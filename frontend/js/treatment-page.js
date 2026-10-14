/**
 * Kezza Clinic — treatment & doctor pages (built by tools/treatment-pages/build_pages.py).
 *
 *  1. FAQ accordion (buttons with aria-expanded; answers stay in the HTML for search engines).
 *  2. Consultation form (#pgLeadForm): validates name + 10-digit Indian mobile, sends the lead to the
 *     same Google Sheets webhook as the contact page (google-apps-script/Code.gs), fires the Meta
 *     Pixel "Lead" and GA4 "generate_lead" events, then shows a thank-you card with a WhatsApp link.
 *  3. WhatsApp click tracking (GA4 "whatsapp_click") on links to wa.me.
 */
(function () {
    'use strict';

    var DEFAULT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec';
    document.documentElement.classList.add('pg-js');

    function track(name, params) {
        try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) { /* ignore */ }
        try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params || {})); } catch (e) { /* ignore */ }
    }

    // ── 1. FAQ accordion ───────────────────────────────────────────────
    function initFaq() {
        var buttons = document.querySelectorAll('.pg-faq-q');
        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('.pg-faq-item');
                if (!item) return;
                var open = !item.classList.contains('open');
                item.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (open) track('faq_open', { faq_question: btn.textContent.trim().slice(0, 100) });
            });
        });
    }

    // ── 2. Consultation form ───────────────────────────────────────────
    function digitsOnly(v) {
        var d = String(v || '').replace(/\D/g, '');
        if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
        else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
        return d;
    }

    function setError(form, field, msg) {
        var input = form.querySelector('[name="' + field + '"]');
        var box = form.querySelector('[data-error-for="' + field + '"]');
        if (box) box.textContent = msg || '';
        if (input) {
            var group = input.closest('.pg-input-group');
            if (group) group.classList.toggle('has-error', !!msg);
            input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        }
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function initForm(form) {
        var phone = form.querySelector('[name="whatsapp"]');
        if (phone) {
            phone.addEventListener('input', function () {
                var d = digitsOnly(phone.value).slice(0, 10);
                if (phone.value !== d) phone.value = d;
                if (d.length === 10) setError(form, 'whatsapp', /^[6-9]\d{9}$/.test(d) ? '' : 'Please enter a valid 10-digit mobile number.');
            });
        }

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            if (form.getAttribute('data-busy') === '1') return;

            var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? String(el.value || '').trim() : ''; };
            var name = get('name');
            var mobile = digitsOnly(get('whatsapp'));
            var clinic = get('clinic') || 'Jaipur';
            var treatment = get('treatment') || form.getAttribute('data-treatment') || 'Consultation';
            var message = get('message');
            var ok = true;

            setError(form, 'name', '');
            setError(form, 'whatsapp', '');
            if (name.length < 2) { setError(form, 'name', 'Please enter your name.'); ok = false; }
            if (!/^[6-9]\d{9}$/.test(mobile)) { setError(form, 'whatsapp', 'Please enter a valid 10-digit WhatsApp number.'); ok = false; }
            if (!ok) {
                var firstBad = form.querySelector('[aria-invalid="true"]');
                if (firstBad) firstBad.focus();
                return;
            }

            // Bots fill the hidden field; pretend success and send nothing.
            if (get('kz_hp')) { showThanks(form, name, clinic, treatment, ''); return; }

            var leadId = 'KEZZA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
            var department = form.getAttribute('data-department') || 'Skin';
            var specialist = form.getAttribute('data-specialist') || '';
            var source = 'Treatment Page Form (' + (form.getAttribute('data-page') || location.pathname) + ')';
            var payload = {
                source: source, Source: source,
                leadId: leadId, consultationId: leadId,
                timestamp: new Date().toISOString(),
                name: name, whatsapp: mobile, phone: mobile,
                location: clinic, city: clinic, clinic: clinic,
                department: department, category: department,
                treatment: treatment, service: treatment,
                specialist: specialist,
                concern: treatment + (message ? ' — ' + message : ''),
                message: message,
                preferredTime: get('preferredTime') || 'Any Time',
                page: location.href,
                status: 'New',
                kz_hp: ''
            };

            var btn = form.querySelector('button[type="submit"]');
            var original = btn ? btn.innerHTML : '';
            form.setAttribute('data-busy', '1');
            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…'; }
            var status = form.querySelector('.pg-form-status');
            if (status) { status.className = 'pg-form-status'; status.textContent = ''; }

            var endpoint = form.getAttribute('data-endpoint') || DEFAULT_ENDPOINT;
            var controller = typeof AbortController === 'function' ? new AbortController() : null;
            var timer = setTimeout(function () { if (controller) controller.abort(); }, 20000);

            // Forward lead directly to TeleCRM Async API
            if (window.KezzaTeleCRM && typeof window.KezzaTeleCRM.sendLead === 'function') {
                try { window.KezzaTeleCRM.sendLead(payload); } catch (e) { /* ignore */ }
            }

            fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                signal: controller ? controller.signal : undefined
            }).then(function () {
                clearTimeout(timer);
                try { if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: treatment, content_category: department, clinic_location: clinic }); } catch (e) { /* ignore */ }
                track('generate_lead', { treatment: treatment, clinic: clinic, department: department, form: 'treatment_page' });
                showThanks(form, name, clinic, treatment, leadId);
            }).catch(function () {
                clearTimeout(timer);
                form.removeAttribute('data-busy');
                if (btn) { btn.disabled = false; btn.innerHTML = original; }
                var wa = form.getAttribute('data-wa') || '919284517427';
                var text = 'Hello Kezza Clinic, I would like to book a consultation for ' + treatment + ' at ' + clinic + '. My name is ' + name + '.';
                if (status) {
                    status.className = 'pg-form-status error';
                    status.innerHTML = 'We could not send your request. Please try again, or <a href="https://wa.me/' + wa + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">message us on WhatsApp</a>.';
                }
            });
        });
    }

    function showThanks(form, name, clinic, treatment, leadId) {
        var wa = form.getAttribute('data-wa') || '919284517427';
        var text = 'Hello Kezza Clinic ' + clinic + ', I have requested a consultation for ' + treatment + ' on your website.' + (leadId ? ' My reference is ' + leadId + '.' : '');
        var box = document.createElement('div');
        box.className = 'pg-thanks';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        box.innerHTML = '<i class="fas fa-circle-check" aria-hidden="true"></i>' +
            '<h3>Thank you, ' + escapeHtml(name.split(' ')[0]) + '!</h3>' +
            '<p>Your request for <strong>' + escapeHtml(treatment) + '</strong> at our <strong>' + escapeHtml(clinic) + '</strong> clinic has been received. Our team will call or WhatsApp you during clinic hours (9 AM – 8 PM, all 7 days).' +
            (leadId ? '<br>Reference: <strong>' + escapeHtml(leadId) + '</strong>' : '') + '</p>' +
            '<a class="btn-pg-wa" href="https://wa.me/' + wa + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i> Continue on WhatsApp</a>';
        form.parentNode.replaceChild(box, form);
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── 3. WhatsApp click tracking ─────────────────────────────────────
    function initWaTracking() {
        document.addEventListener('click', function (ev) {
            var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me/"]') : null;
            if (!a) return;
            track('whatsapp_click', { link_location: a.getAttribute('data-cta') || 'page', page_path: location.pathname });
        }, { passive: true });
    }

    function init() {
        initFaq();
        Array.prototype.forEach.call(document.querySelectorAll('form.pg-lead-form'), initForm);
        initWaTracking();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
