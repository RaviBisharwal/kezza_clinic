import http.server
import os
import posixpath
import sys
import urllib.parse
from http import HTTPStatus

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(CURRENT_DIR, 'frontend')
PRIMARY_DIR = FRONTEND_DIR if os.path.isdir(FRONTEND_DIR) else CURRENT_DIR
FALLBACK_DIR = os.environ.get('KEZZA_ASSETS_DIR', os.path.expanduser("/Users/ravikumar/Desktop/images/kezza-clinic"))

class KezzaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PRIMARY_DIR, **kwargs)

    def translate_path(self, path):
        # Strip query and fragments
        clean = path.split('?', 1)[0].split('#', 1)[0]
        trailing = clean.endswith('/')
        try:
            unquoted = urllib.parse.unquote(clean, errors='surrogatepass')
        except UnicodeDecodeError:
            unquoted = urllib.parse.unquote(clean)

        norm = posixpath.normpath(unquoted).lstrip('/')
        if norm == '.' or not norm:
            norm = ''

        # 1. Primary workspace check
        p_target = os.path.join(PRIMARY_DIR, norm)
        if os.path.exists(p_target):
            return p_target + ('/' if trailing and os.path.isdir(p_target) else '')
        if os.path.exists(p_target + '.html'):
            return p_target + '.html'

        # 2. Fallback check for base assets (images, posters, videos, etc.)
        if os.path.exists(FALLBACK_DIR):
            f_target = os.path.join(FALLBACK_DIR, norm)
            if os.path.exists(f_target):
                return f_target + ('/' if trailing and os.path.isdir(f_target) else '')
            if os.path.exists(f_target + '.html'):
                return f_target + '.html'

        return p_target

    def do_GET(self):
        parsed_path = self.path.split('?', 1)[0].split('#', 1)[0]
        try:
            unquoted = urllib.parse.unquote(parsed_path, errors='surrogatepass')
        except UnicodeDecodeError:
            unquoted = urllib.parse.unquote(parsed_path)

        norm = posixpath.normpath(unquoted).lstrip('/')
        if norm == '.' or not norm:
            norm = ''

        p_target = os.path.join(PRIMARY_DIR, norm)
        f_target = os.path.join(FALLBACK_DIR, norm) if os.path.exists(FALLBACK_DIR) else ''

        # Enforce trailing slash for directories (mirrors .htaccess)
        is_dir = os.path.isdir(p_target) or (bool(f_target) and os.path.isdir(f_target))
        if is_dir and not parsed_path.endswith('/'):
            query = self.path[len(parsed_path):]
            self.send_response(HTTPStatus.MOVED_PERMANENTLY)
            self.send_header('Location', parsed_path + '/' + query)
            self.end_headers()
            return

        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        parsed_path = self.path.split('?', 1)[0].split('#', 1)[0]
        if parsed_path in ('/api/lead', '/api/telecrm-lead'):
            import json, urllib.request, urllib.error
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8')) if body else {}
            except Exception:
                data = {}

            # 1. Save lead to local audit file
            try:
                leads_file = os.path.join(PRIMARY_DIR, 'leads.jsonl')
                with open(leads_file, 'a', encoding='utf-8') as f:
                    f.write(json.dumps(data, ensure_ascii=False) + '\n')
            except Exception as e:
                print(f"[Lead Storage Error]: {e}")

            # 2. Forward to TeleCRM Async API
            telecrm_eid = 'f4aec56d-3d53-4f3a-96fc-2071ac72d054'
            telecrm_token = 'f4aec56d-3d53-4f3a-96fc-2071ac72d0541791960668171:af31a753-03a9-413d-be0b-d37c9544a1b6'
            telecrm_url = f'https://next-api.telecrm.in/enterprise/{telecrm_eid}/autoupdatelead'

            # Clean and format phone for TeleCRM (91XXXXXXXXXX)
            raw_phone = str(data.get('phone') or data.get('whatsapp') or data.get('WhatsApp') or '')
            digits = ''.join(c for c in raw_phone if c.isdigit())
            if len(digits) == 10 and digits[0] in '6789':
                formatted_phone = '91' + digits
            elif len(digits) == 11 and digits.startswith('0'):
                formatted_phone = '91' + digits[1:]
            elif len(digits) == 12 and digits.startswith('91'):
                formatted_phone = digits
            else:
                formatted_phone = digits

            telecrm_fields = {
                'name': (data.get('name') or data.get('Name') or 'Website Lead').strip(),
                'phone': formatted_phone,
                'email': data.get('email') or '',
                'city': data.get('city') or data.get('location') or 'Jaipur',
                'clinic': data.get('clinic') or data.get('Clinic') or 'Jaipur',
                'treatment': data.get('treatment') or data.get('Treatment') or 'Consultation',
                'category': data.get('category') or data.get('department') or 'Consultation',
                'source': data.get('source') or 'Website',
                'preferred_slot': data.get('preferredSlot') or data.get('preferredTime') or 'Any Time',
                'notes': f"Ref: {data.get('leadId','')} | Treatment: {data.get('treatment','')} | Clinic: {data.get('clinic','')} | Slot: {data.get('preferredSlot','')}"
            }

            telecrm_payload = {
                'fields': telecrm_fields,
                'actions': [
                    {
                        'type': 'SYSTEM_NOTE',
                        'fields': {
                            'note': f"Kezza Lead | Ref: {data.get('leadId','')} | Treatment: {data.get('treatment','')} | Clinic: {data.get('clinic','')}"
                        }
                    }
                ]
            }

            telecrm_resp = None
            telecrm_status = 0
            try:
                req = urllib.request.Request(
                    telecrm_url,
                    data=json.dumps(telecrm_payload).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {telecrm_token}'
                    },
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=8) as r:
                    telecrm_status = r.status
                    telecrm_resp = r.read().decode('utf-8', errors='ignore')
                    print(f"[TeleCRM Sync SUCCESS]: {telecrm_status} -> {telecrm_resp}")
            except urllib.error.HTTPError as e:
                telecrm_status = e.code
                telecrm_resp = e.read().decode('utf-8', errors='ignore')
                print(f"[TeleCRM Sync HTTP Notice]: {telecrm_status} -> {telecrm_resp}")
            except Exception as e:
                print(f"[TeleCRM Sync Error]: {e}")

            # Send JSON response
            resp_bytes = json.dumps({
                'success': True,
                'leadId': data.get('leadId') or ('KEZZA-2026-' + str(abs(hash(formatted_phone)) % 9000 + 1000)),
                'telecrm': {
                    'status': telecrm_status,
                    'response': telecrm_resp
                }
            }).encode('utf-8')

            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(resp_bytes)))
            self.end_headers()
            self.wfile.write(resp_bytes)
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, KezzaHandler)
    print(f"Kezza Clinic update server running at http://localhost:{PORT}")
    print(f"Primary Directory:  {PRIMARY_DIR}")
    print(f"Fallback Directory: {FALLBACK_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()
