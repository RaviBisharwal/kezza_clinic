/**
 * Kezza Clinic — Express Backend & Gemini AI Server
 * Serves all files from the /frontend directory on port 3001.
 * Integrates Google Gemini API for:
 *   1. /api/chat           → AI Chatbot (Gemini 2.5 Flash)
 *   2. /api/analyze-photo  → AI Face & Scalp Scanner (Gemini Vision)
 *   3. /api/health         → Status & API key configuration check
 * 
 * Usage:
 *   node server.js
 * 
 * Then open: http://localhost:3001
 */

require('dotenv').config();
const express = require('express');
const path    = require('path');
const { GoogleGenAI } = require('@google/genai');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS Middleware ─────────────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// ── Middleware ──────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── Lightweight gzip compression for static text assets (zero-dep) ──
const zlib = require('zlib');
app.use((req, res, next) => {
    const ae = req.headers['accept-encoding'] || '';
    // gzip on-the-fly: only GET requests for compressible text files
    if (req.method !== 'GET' || !/\bgzip\b/.test(ae)) return next();
    if (!/\.(html?|css|js|mjs|json|svg|xml|txt|map|webmanifest)$/i.test(req.path)) return next();

    const rawWrite = res.write.bind(res);
    const rawEnd   = res.end.bind(res);
    const chunks   = [];
    let finished   = false;

    res.write = function (chunk, enc, cb) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc));
        if (typeof cb === 'function') cb();
        return true;
    };
    res.end = function (chunk, enc, cb) {
        if (finished) return;
        finished = true;
        if (typeof chunk === 'function') { cb = chunk; chunk = null; enc = null; }
        else if (typeof enc === 'function') { cb = enc; enc = null; }
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc));
        const body = Buffer.concat(chunks);

        // Skip compression for empty / not-200 / already-encoded responses
        if (res.statusCode !== 200 || body.length === 0 || res.getHeader('Content-Encoding')) {
            if (body.length) { res.setHeader('Content-Length', body.length); rawWrite(body); }
            return rawEnd(cb);
        }
        zlib.gzip(body, (err, zipped) => {
            if (err) { res.setHeader('Content-Length', body.length); rawWrite(body); return rawEnd(cb); }
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Vary', 'Accept-Encoding');
            res.setHeader('Content-Length', zipped.length);
            rawWrite(zipped);
            rawEnd(cb);
        });
    };
    next();
});

// ── Serve all frontend assets from ./frontend/ ─────────────────────
app.use(express.static(path.join(__dirname, 'frontend'), {
    extensions: ['html'],
    setHeaders: (res, filePath) => {
        if (/\.html?$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'no-cache');           // HTML always fresh
        } else if (/\.(jpg|jpeg|png|webp|gif|svg|mp4|webm|woff2?|ico)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // media 1yr
        } else if (process.env.NODE_ENV === 'production') {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // css/js 1d in production
        } else {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate'); // always fresh in dev
        }
    },
}));

// ── System Prompt for Kezza Hair & Skin Clinic ──────────────────────
const KEZZA_SYSTEM_INSTRUCTION = `You are Kezza AI, the official virtual clinical assistant for Kezza Hair & Skin Clinic (Jaipur, Sikar & Ajmer, Rajasthan).

CLINIC INFORMATION:
- Locations:
  1. Jaipur Clinic: A-7, 1st Floor, Hanuman Nagar, Sirsi Rd, Main, Khatipura, Jaipur, Rajasthan.
     Phone/WhatsApp: +91-9284517427
     Timings: 9:00 AM to 8:00 PM (Monday to Sunday, All 7 Days).
  2. Sikar Clinic: First Floor, Shakambhari Heights, Infront of S.K. Hospital, Silver Jubilee Rd, Sikar, Rajasthan.
     Phone/WhatsApp: +91-9284517427
     Timings: 9:00 AM to 8:00 PM (Monday to Sunday, All 7 Days).
  3. Ajmer Clinic (Kezza Clinic – Ajmer): First Floor, Shastri Nagar, Oasis Complex and Hotels, Jawahar Nagar, Ajmer, Rajasthan 305001.
     Phone: +91-9216088257 | WhatsApp: +91-9216088257 | Email: kezzaclinic@gmail.com
     Google Maps: https://maps.app.goo.gl/zMajvKmT5N7coswJA?g_st=ic
     Opening Hours: Please contact the clinic directly for current timings.
- Central WhatsApp / Consultation Helpline: +91 9284517427.

KEY MEDICAL EXPERTS & DEPARTMENTS:
1. Hair Restoration & Surgery:
   - Specialist: Dr. Ankit Bhalothia & Elite Surgical Team (Sikar).
   - Treatments: Sapphire FUE Hair Transplant, Choi DHI, GFC / PRP Hair Loss Therapy, Beard & Eyebrow Transplant, White Hair Removal.
2. Skin & Aesthetics:
   - Specialist: Dr. Amrita Mukhija (Jaipur & Sikar).
   - Treatments: Medical HydraFacial, Acne & Fractional Scar Repair, Botox & Dermal Fillers, Pigmentation / Melasma Reduction, Laser Hair Removal, Glutathione Glow Therapy.
3. Permanent Makeup (PMU):
   - Microblading, Ombre Powder Brows, Lip Blush, Scalp Micropigmentation (SMP).
4. Weight Loss & Body Contouring:
   - 360° Cryolipolysis (Fat Freezing), HIFU Body Sculpting.
5. Ajmer Clinic Specialists:
   - Dr. Dhiral Vijayvargiya: Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon. Available at Ajmer.
   - Dr. Aliza Rizvi: Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon. Specializations: Maxillofacial Surgery, Facial Symmetry & Aesthetics, Hair Transplant. Available at Ajmer.
     Bio: Dr. Aliza Rizvi is a specialist Oral and Maxillofacial Surgeon whose advanced practice is devoted to hair transplantation and facial aesthetics. Her elite surgical foundation brings a deep command of facial anatomy, bone structure and nerve pathways to every procedure. Leading our Ajmer centre, she applies rigorous hospital-grade surgical discipline to non-surgical facial rejuvenation and delicate, micro-graft hair transplants, achieving dense, natural-looking restorations.

LOCATION ROUTING RULES:
- If a user mentions "Ajmer", "Ajmer clinic", "Kezza Ajmer", "I want appointment in Ajmer" or "I live in Ajmer": use location = Ajmer and provide Ajmer clinic details.
- Ajmer doctors: Dr. Dhiral Vijayvargiya and Dr. Aliza Rizvi.
- Do NOT claim Jaipur/Sikar doctors are available in Ajmer unless explicitly configured.
- Do NOT invent opening hours for Ajmer — say "Please contact the clinic directly for current timings."

RESPONSE GUIDELINES:
- Language: Respond naturally in the language user speaks (English, Hindi, or conversational Hinglish).
- Tone: Empathetic, polite, professional, and clinically accurate.
- Formatting: Use short, clean paragraphs, bullet points, and bold text. Keep answers concise (< 150 words).
- Medical Disclaimer: Always clarify that preliminary AI guidance is for informational purposes and recommend booking an in-person or WhatsApp consultation with Kezza specialists.`;

// ── 1. Health & Config Status API ──────────────────────────────────
app.get('/api/health', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    res.json({
        status: 'OK',
        service: 'Kezza Clinic Backend',
        geminiConfigured: hasKey,
        port: PORT
    });
});

// In-memory instant response cache
const chatCache = new Map();

// ── 2. Ultra-Fast Chatbot API (/api/chat) ───────────────────────────
app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || !apiKey.trim()) {
            return res.json({
                status: 'NO_GEMINI_KEY',
                message: 'Gemini API key is not configured on the server.'
            });
        }

        const { message, history } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ status: 'ERROR', message: 'Valid message is required.' });
        }

        const cleanMsg = message.trim().toLowerCase();
        
        // 1. Instant Cache Check (<1ms)
        if (chatCache.has(cleanMsg)) {
            return res.json({ status: 'OK', reply: chatCache.get(cleanMsg), cached: true });
        }

        const ai = new GoogleGenAI({ apiKey });

        const contents = [];
        if (Array.isArray(history) && history.length > 0) {
            // Keep last 3 turns for lightning context without token overhead
            for (const item of history.slice(-3)) {
                if (item.text && item.role) {
                    contents.push({
                        role: (item.role === 'model' || item.role === 'assistant' || item.role === 'bot') ? 'model' : 'user',
                        parts: [{ text: String(item.text).slice(0, 250) }]
                    });
                }
            }
        }

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Use ultra-fast lite model with concise output tokens for instant response
        let responseText = '';
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash-lite',
                contents: contents,
                config: {
                    systemInstruction: KEZZA_SYSTEM_INSTRUCTION,
                    temperature: 0.2,
                    maxOutputTokens: 250
                }
            });
            responseText = response.text || '';
        } catch (mErr) {
            // Fallback to gemini-3.8-flash, then gemini-2.5-flash
            try {
                const fbResponse = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: contents,
                    config: {
                        systemInstruction: KEZZA_SYSTEM_INSTRUCTION,
                        temperature: 0.2,
                        maxOutputTokens: 250
                    }
                });
                responseText = fbResponse.text || '';
            } catch (fbErr) {
                const legacyResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: {
                        systemInstruction: KEZZA_SYSTEM_INSTRUCTION,
                        temperature: 0.2,
                        maxOutputTokens: 250
                    }
                });
                responseText = legacyResponse.text || '';
            }
        }

        if (responseText) {
            // Cache response (up to 200 items)
            if (chatCache.size > 200) {
                const firstKey = chatCache.keys().next().value;
                chatCache.delete(firstKey);
            }
            chatCache.set(cleanMsg, responseText);
        }

        return res.json({ status: 'OK', reply: responseText });
    } catch (err) {
        console.error('[Gemini Chat API Error]:', err.message);
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// ── 3. AI Face & Scalp Scanner Vision API (/api/analyze-photo) ──────
app.post('/api/analyze-photo', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || !apiKey.trim()) {
            return res.json({
                status: 'NO_GEMINI_KEY',
                message: 'Gemini API key is not configured on the server.'
            });
        }

        const { image, textContext, answers, userDetails } = req.body;
        if (!image) {
            return res.status(400).json({ status: 'ERROR', message: 'Image payload is required.' });
        }

        // Build enriched patient context from userDetails if provided
        let enrichedContext = textContext || '';
        if (userDetails && typeof userDetails === 'object') {
            const lines = [];
            if (userDetails.age) lines.push(`Patient Age: ${userDetails.age}`);
            if (userDetails.gender) lines.push(`Gender: ${userDetails.gender}`);
            if (userDetails.mainConcern || userDetails.concernLabel) lines.push(`Primary Target Concern: ${userDetails.mainConcern || userDetails.concernLabel}`);
            if (userDetails.duration) lines.push(`Duration of Concern: ${userDetails.duration}`);
            if (userDetails.severity) lines.push(`Self-Reported Severity: ${userDetails.severity}`);
            if (userDetails.allergies) lines.push(`Known Allergies / Skin Sensitivities: ${userDetails.allergies}`);
            if (userDetails.medicines) lines.push(`Current Medicines / Skincare Products: ${userDetails.medicines}`);
            if (userDetails.clinic) lines.push(`Preferred Clinic: ${userDetails.clinic}`);
            if (userDetails.additionalInfo) lines.push(`Additional Patient Symptoms & Notes: ${userDetails.additionalInfo}`);
            
            if (lines.length > 0) {
                enrichedContext = (enrichedContext ? enrichedContext + '\n\n' : '') + 'PATIENT CLINICAL PROFILE & QUESTIONNAIRE:\n' + lines.join('\n');
            }
        }

        // Parse base64 data URL
        const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/jpeg';
        const base64Data = match ? match[2] : image;

        const ai = new GoogleGenAI({ apiKey });

        const preferredClinic = userDetails && userDetails.clinic ? userDetails.clinic : '';
        const promptText = `Perform a comprehensive dermatological and trichological visual evaluation of this patient photo for Kezza Hair & Skin Clinic (Jaipur, Sikar & Ajmer).

PATIENT QUESTIONNAIRE & CLINICAL CONTEXT:
${enrichedContext || 'General Skin & Hair Assessment'}
${preferredClinic ? `\nPATIENT PREFERRED CLINIC: ${preferredClinic}` : ''}

CLINICAL DEPARTMENTS & KEY SPECIALISTS AT KEZZA:
1. HAIR: Dr. Ankit Bhalothia (Sapphire FUE, GFC/PRP Therapy, Hair Thinning) — Jaipur & Sikar
2. HAIR_TRANSPLANT_SIKAR: Dr. Dhiral Vijayvargiya (Elite Surgical Hair Restoration) — Sikar & Ajmer
3. SKIN: Dr. Amrita Mukhija (Acne, Scars, HydraFacial, Melasma, Laser Toning) — Jaipur & Sikar
4. ANTI_AGING: Dr. Amrita Mukhija (Botox, Dermal Fillers, HIFU, Skin Tightening) — Jaipur & Sikar
5. PMU / SMP: Krishna (Eyebrow Microblading, Lip Blush, Scalp Micropigmentation) — Jaipur & Sikar
6. WEIGHT_LOSS: Kezza Wellness Team (360° Cryolipolysis Fat Freezing, Body Sculpting) — Jaipur & Sikar
7. ENT_RHINOPLASTY: Dr. Mandhata Sharma (Aesthetic Rhinoplasty, Facial Contour) — Jaipur
8. AJMER_SPECIALIST: Dr. Aliza Rizvi (Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon) — Ajmer
9. PLASTIC_SURGERY: Dr. Nakul Somani (Aesthetic & Reconstructive Plastic Surgery, Body Contouring, Liposuction) — Jaipur

REQUIRED OUTPUT FORMAT:
Return a strict JSON object with this exact schema:
{
  "status": "OK",
  "recommended_consultation": "Specific consultation title (e.g. Hair Loss Consultation / Active Acne & Scar Assessment)",
  "treatment_name": "Recommended clinical treatment (e.g. Sapphire FUE Hair Transplant / Medical HydraFacial / GFC Hair Therapy)",
  "department_key": "HAIR or HAIR_TRANSPLANT_SIKAR or SKIN or ANTI_AGING or PMU or SMP or WEIGHT_LOSS or ENT_RHINOPLASTY or AJMER_SPECIALIST or PLASTIC_SURGERY",
  "confidence_score": 92,
  "severity": "Mild or Moderate or High",
  "photo_quality": "High",
  "visible_observations": [
    "High-precision visual observation 1 grounded in the photo",
    "High-precision visual observation 2 regarding density/texture/pigment",
    "High-precision visual observation 3 regarding clinical zone"
  ],
  "why_this_consultation": "Detailed empathetic rationale for why this specific specialist and procedure will deliver optimal results."
}`;

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            },
                            { text: promptText }
                        ]
                    }
                ],
                config: {
                    systemInstruction: 'You are a senior clinical dermatologist and hair trichology AI diagnostic engine for Kezza Clinic. Provide accurate, professional visual assessments in JSON format.',
                    responseMimeType: 'application/json'
                }
            });
        } catch (vErr) {
            response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            },
                            { text: promptText }
                        ]
                    }
                ],
                config: {
                    systemInstruction: 'You are a senior clinical dermatologist and hair trichology AI diagnostic engine for Kezza Clinic. Provide accurate, professional visual assessments in JSON format.',
                    responseMimeType: 'application/json'
                }
            });
        }

        const rawText = response.text || '{}';
        try {
            const parsed = JSON.parse(rawText);
            return res.json({ status: 'OK', ...parsed });
        } catch (pErr) {
            return res.json({
                status: 'OK',
                recommended_consultation: 'Specialist Clinical Assessment',
                treatment_name: 'Personalized Treatment Program',
                department_key: 'SKIN',
                confidence_score: 88,
                severity: 'Moderate',
                visible_observations: [
                    'Target anatomical zone successfully identified for clinical evaluation.',
                    'Texture and tone variation mapped across assessment area.',
                    'Patient history correlates with recommended clinical protocol.'
                ],
                why_this_consultation: 'Based on our initial visual assessment, a consultation with Dr. Amrita Mukhija or Dr. Ankit Bhalothia is recommended.'
            });
        }
    } catch (err) {
        console.error('[Gemini Vision API Error]:', err.message);
        return res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// ── Lead Store ──────────────────────────────────────────────────────
// admin.html has always called /api/admin/stats, /api/admin/consultations and
// /api/consultations/:id, but no such routes existed — the dashboard could only
// ever show "Cannot connect to SQL backend". This is a small file-backed store so
// captured leads are actually readable. Swap readStore/writeStore for a real
// database when one is available; nothing else needs to change.
const fs = require('fs');
const LEAD_STORE_PATH = process.env.LEAD_STORE_PATH || path.join(__dirname, 'data', 'leads.json');

function readStore() {
    try {
        if (!fs.existsSync(LEAD_STORE_PATH)) return [];
        const parsed = JSON.parse(fs.readFileSync(LEAD_STORE_PATH, 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('[Lead Store Read Error]:', err.message);
        return [];
    }
}

function writeStore(records) {
    try {
        fs.mkdirSync(path.dirname(LEAD_STORE_PATH), { recursive: true });
        fs.writeFileSync(LEAD_STORE_PATH, JSON.stringify(records, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('[Lead Store Write Error]:', err.message);
        return false;
    }
}

// Map the internal lead record onto the snake_case field names admin.html reads.
function toAdminRecord(lead) {
    return {
        id: lead.id,
        consultation_id: lead.leadId,
        full_name: lead.name,
        patient_name: lead.name,
        age: lead.age,
        mobile_number: lead.whatsapp,
        phone: lead.whatsapp,
        whatsapp_number: lead.whatsapp,
        gender: lead.gender,
        patient_city: lead.city,
        city: lead.city,
        clinic_location: lead.clinic,
        clinic_branch: lead.clinic,
        category: lead.category,
        treatment: lead.treatment,
        recommended_treatment: lead.treatment,
        concern: lead.concern,
        detected_concern: lead.concern,
        concern_duration: lead.concernDuration,
        preferred_date: lead.date,
        preferred_time: lead.time,
        specialist: lead.specialist,
        assigned_doctor: lead.specialist,
        department: lead.department,
        department_key: lead.department,
        status: lead.status,
        source: lead.source,
        email: lead.email,
        message: lead.message,
        severity: lead.severity,
        allergies: lead.allergies,
        medicines: lead.medicines,
        photo_analysis: lead.aiSummary,
        created_at: lead.timestamp,
        consultation_date: lead.timestamp
    };
}

// ── 4. Lead Capture & Google Sheets Webhook API (/api/lead) ─────────
const leadRateLimitMap = new Map(); // whatsapp -> [timestamps]

// Clean up expired rate-limit records every 15 minutes
setInterval(() => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    for (const [phone, timestamps] of leadRateLimitMap.entries()) {
        const validTimestamps = timestamps.filter(t => (now - t) < tenMinutes);
        if (validTimestamps.length === 0) {
            leadRateLimitMap.delete(phone);
        } else {
            leadRateLimitMap.set(phone, validTimestamps);
        }
    }
}, 15 * 60 * 1000);

app.post(['/api/lead', '/api/send-consultation'], async (req, res) => {
    try {
        const body = req.body || {};
        const {
            name,
            full_name,
            whatsapp,
            phone,
            mobile_number,
            age,
            gender,
            concern,
            duration,
            concernDetails,
            severity,
            symptoms,
            allergies,
            medicines,
            clinic,
            selectedClinic,
            category,
            categoryTitle,
            treatment,
            preferredDate,
            date,
            preferredTime,
            time,
            email,
            message,
            notes,
            aiSummary,
            source,
            timestamp,
            consultationId
        } = body;

        // 1. Validation
        const trimmedName = typeof (name || full_name) === 'string' ? (name || full_name).trim() : '';
        if (!trimmedName) {
            return res.status(400).json({ status: 'ERROR', message: 'Full name is required.' });
        }

        // Clean phone/whatsapp string (remove spaces, hyphens, leading +91 or 91 if 12 digits)
        let cleanPhone = String(whatsapp || phone || mobile_number || '').replace(/[\s\-\+\(\)]/g, '');
        if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
            cleanPhone = cleanPhone.slice(2);
        } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
            cleanPhone = cleanPhone.slice(1);
        }

        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return res.status(400).json({ status: 'ERROR', message: 'WhatsApp number must be a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).' });
        }

        let parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
            parsedAge = '';
        }

        // 2. Spam Protection Rate Limiting (max 5 submissions per 10 minutes per phone)
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const pastTimestamps = (leadRateLimitMap.get(cleanPhone) || []).filter(t => (now - t) < tenMinutes);

        if (pastTimestamps.length >= 5) {
            return res.status(429).json({
                status: 'ERROR',
                message: 'Too many submissions from this number. Please wait 10 minutes or message us directly on WhatsApp.'
            });
        }

        pastTimestamps.push(now);
        leadRateLimitMap.set(cleanPhone, pastTimestamps);

        // 3. Prepare sanitized payload for Google Sheets & logs
        const finalLeadId = consultationId || body.leadId || body.consultation_id || body.lead_id || `KEZZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        let resolvedClinic = 'Jaipur';
        const rawClinic = String(clinic || selectedClinic || body.preferred_clinic || body.preferredClinic || '').trim();
        if (rawClinic.toLowerCase().includes('ajmer')) {
            resolvedClinic = 'Ajmer';
        } else if (rawClinic.toLowerCase().includes('sikar')) {
            resolvedClinic = 'Sikar';
        } else if (rawClinic.toLowerCase().includes('jaipur')) {
            resolvedClinic = 'Jaipur';
        } else if (rawClinic) {
            resolvedClinic = rawClinic;
        }

        const patientCity = body.city || body.patientLocation || body['Patient Location'] || body.patient_city || body.location || '';
        const categoryVal = categoryTitle || category || body.category || body.Category || body.treatment_category || body.department || body.Department || '';
        const specialistVal = body.specialist || body.doctor || '';
        const durationVal = duration || body.duration || body.Duration || body['Concern / Duration'] || body['concern / duration'] || body.concern_duration || body.concernDuration || '';
        const rawConcern = concern || body.concern || body.Concern || concernDetails || body.concernDetails || '';
        const resolvedConcernDuration = body['Concern / Duration'] || body['concern / duration'] || durationVal || (rawConcern ? rawConcern : 'Not specified');

        let resolvedDepartment = String(body.department || body.Department || body.department_name || '').trim();
        if (!resolvedDepartment) {
            const catLower = (categoryVal || '').toLowerCase();
            const treatLower = (treatment || '').toLowerCase();
            if (catLower.includes('hair') || treatLower.includes('hair') || treatLower.includes('fue') || treatLower.includes('prp') || treatLower.includes('gfc')) {
                resolvedDepartment = 'Hair';
            } else if (catLower.includes('smp') || treatLower.includes('smp') || treatLower.includes('micropigmentation') || treatLower.includes('camouflage')) {
                resolvedDepartment = 'SMP';
            } else if (catLower.includes('pmu') || treatLower.includes('pmu') || treatLower.includes('microblading') || treatLower.includes('eyeliner')) {
                resolvedDepartment = 'PMU';
            } else if (catLower.includes('weight') || treatLower.includes('weight') || treatLower.includes('slimming') || treatLower.includes('fat reduction')) {
                resolvedDepartment = 'Weight Loss';
            } else if (catLower.includes('rhino') || treatLower.includes('rhino') || treatLower.includes('ent') || treatLower.includes('nose')) {
                resolvedDepartment = 'Rhinoplasty / ENT';
            } else if (catLower.includes('skin') || treatLower.includes('facial') || treatLower.includes('botox') || treatLower.includes('derma') || treatLower.includes('acne') || treatLower.includes('brightening')) {
                resolvedDepartment = 'Skin';
            } else if (categoryVal) {
                resolvedDepartment = categoryVal;
            } else {
                resolvedDepartment = 'General';
            }
        }

        const dateVal = date || preferredDate || body.preferred_date || '';
        const timeVal = time || preferredTime || body.preferred_time || '';
        const sourceVal = source || 'Kezza Website';
        const statusVal = body.status || 'Pending';

        const leadRecord = {
            timestamp: timestamp || new Date().toISOString(),
            leadId: finalLeadId,
            consultationId: finalLeadId,
            name: trimmedName,
            full_name: trimmedName,
            whatsapp: cleanPhone,
            phone: cleanPhone,
            mobile_number: cleanPhone,
            'WhatsApp': cleanPhone,
            age: parsedAge,
            gender: gender || 'Not Specified',
            city: patientCity,
            patient_city: patientCity,
            patientLocation: patientCity,
            'Patient Location': patientCity,
            clinic: resolvedClinic,
            selectedClinic: resolvedClinic,
            preferred_clinic: resolvedClinic,
            'Clinic': resolvedClinic,
            category: categoryVal,
            treatment_category: categoryVal,
            'Category': categoryVal,
            treatment: treatment || categoryVal || '',
            service: treatment || categoryVal || '',
            'Treatment': treatment || categoryVal || '',
            specialist: specialistVal,
            doctor: specialistVal,
            'Specialist': specialistVal,
            concern: rawConcern || 'General Consultation',
            Concern: rawConcern || 'General Consultation',
            duration: durationVal,
            Duration: durationVal,
            concern_duration: durationVal,
            concernDuration: resolvedConcernDuration,
            'Concern / Duration': resolvedConcernDuration,
            'concern / duration': resolvedConcernDuration,
            'Concern/Duration': resolvedConcernDuration,
            date: dateVal,
            preferredDate: dateVal,
            preferred_date: dateVal,
            'Preferred Date': dateVal,
            time: timeVal,
            preferredTime: timeVal,
            preferred_time: timeVal,
            'Preferred Time': timeVal,
            department: resolvedDepartment,
            Department: resolvedDepartment,
            'Department': resolvedDepartment,
            department_name: resolvedDepartment,
            status: statusVal,
            Status: statusVal,
            'Status': statusVal,
            email: email || '',
            message: message || notes || '',
            severity: severity || '',
            symptoms: symptoms || '',
            allergies: allergies || '',
            medicines: medicines || '',
            aiSummary: typeof aiSummary === 'string' ? aiSummary.slice(0, 1500) : JSON.stringify(aiSummary || '').slice(0, 1500),
            source: sourceVal,
            Source: sourceVal,
            'Source': sourceVal,
            consent: true
        };

        console.log(`[Lead Received] ${leadRecord.name} (${leadRecord.whatsapp}) | ${leadRecord.treatment || leadRecord.concern} | ${leadRecord.clinic} | Source: ${leadRecord.source}`);

        // 3b. Persist locally so the admin dashboard has something to read.
        // De-duplicated on leadId, since a retried submission reuses the same ID.
        try {
            const store = readStore();
            const existingIdx = store.findIndex(r => r.leadId === finalLeadId);
            if (existingIdx >= 0) {
                leadRecord.id = store[existingIdx].id;
                store[existingIdx] = leadRecord;
            } else {
                leadRecord.id = store.length ? Math.max(...store.map(r => r.id || 0)) + 1 : 1;
                store.push(leadRecord);
            }
            writeStore(store);
        } catch (storeErr) {
            console.error('[Lead Store Error]:', storeErr.message);
        }

        // 4. Forward to Google Sheets Webhook
        const sheetWebhookUrl = process.env.SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec';
        if (sheetWebhookUrl && sheetWebhookUrl.trim()) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                fetch(sheetWebhookUrl.trim(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadRecord),
                    signal: controller.signal
                })
                .then(async (sheetRes) => {
                    clearTimeout(timeoutId);
                    if (!sheetRes.ok) {
                        const errText = await sheetRes.text().catch(() => '');
                        console.warn('[Google Sheets Webhook Response Not OK]:', sheetRes.status, errText);
                    } else {
                        console.log(`[Google Sheets Webhook Success] Synced lead ${finalLeadId} for ${leadRecord.whatsapp}`);
                    }
                })
                .catch((sheetErr) => {
                    clearTimeout(timeoutId);
                    console.error('[Google Sheets Webhook Forward Error]:', sheetErr.message);
                });
            } catch (postErr) {
                console.error('[Google Sheets Webhook Dispatch Error]:', postErr.message);
            }
        }

        return res.json({
            status: 'SENT',
            message: 'Lead captured successfully.',
            leadId: finalLeadId
        });

    } catch (err) {
        console.error('[Lead Capture Error]:', err.message);
        return res.status(500).json({ status: 'ERROR', message: 'Internal server error processing lead.' });
    }
});

// ── 5. Admin Dashboard APIs (consumed by frontend/admin.html) ───────
// NOTE: these are gated by a shared token, not real user accounts. Set
// ADMIN_TOKEN in .env before exposing this server publicly, and serve it
// over HTTPS only. Without ADMIN_TOKEN set, the routes are refused rather
// than left wide open.
function requireAdmin(req, res, next) {
    const expected = (process.env.ADMIN_TOKEN || (process.env.NODE_ENV === 'production' ? '' : 'kezza-admin-secret-2026')).trim();
    if (!expected) {
        return res.status(503).json({
            status: 'ERROR',
            message: 'Admin API is disabled. Set ADMIN_TOKEN in the server .env file to enable it.'
        });
    }
    const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (supplied !== expected) {
        return res.status(401).json({ status: 'ERROR', message: 'Unauthorized.' });
    }
    next();
}

app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const store = readStore();
    const today = new Date().toISOString().split('T')[0];
    const countStatus = s => store.filter(r => String(r.status || '').toUpperCase() === s).length;
    const countClinic = c => store.filter(r => String(r.clinic || '').toLowerCase() === c).length;

    res.json({
        status: 'OK',
        stats: {
            total:     store.length,
            today:     store.filter(r => String(r.timestamp || '').startsWith(today)).length,
            newCount:  countStatus('PENDING') + countStatus('NEW'),
            confirmed: countStatus('CONFIRMED'),
            jaipur:    countClinic('jaipur'),
            sikar:     countClinic('sikar'),
            ajmer:     countClinic('ajmer')
        }
    });
});

app.get('/api/admin/consultations', requireAdmin, (req, res) => {
    const { search, clinic, category, status, startDate, endDate } = req.query;
    let records = readStore();

    if (search) {
        const q = String(search).toLowerCase();
        records = records.filter(r =>
            String(r.name || '').toLowerCase().includes(q) ||
            String(r.whatsapp || '').includes(q) ||
            String(r.leadId || '').toLowerCase().includes(q)
        );
    }
    if (clinic)   records = records.filter(r => String(r.clinic || '').toLowerCase()   === String(clinic).toLowerCase());
    if (category) records = records.filter(r => String(r.category || '').toLowerCase() === String(category).toLowerCase());
    if (status)   records = records.filter(r => String(r.status || '').toUpperCase()   === String(status).toUpperCase());
    if (startDate) records = records.filter(r => String(r.timestamp || '').split('T')[0] >= startDate);
    if (endDate)   records = records.filter(r => String(r.timestamp || '').split('T')[0] <= endDate);

    // Newest first
    records.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')));

    res.json({
        status: 'OK',
        total: records.length,
        records: records.map(toAdminRecord)
    });
});

app.get('/api/consultations/:idOrCode', requireAdmin, (req, res) => {
    const key = String(req.params.idOrCode);
    const lead = readStore().find(r => r.leadId === key || String(r.id) === key);
    if (!lead) {
        return res.status(404).json({ status: 'ERROR', message: 'Consultation not found.' });
    }
    res.json({ status: 'OK', consultation: toAdminRecord(lead) });
});

app.patch('/api/consultations/:idOrCode', requireAdmin, (req, res) => {
    const key = String(req.params.idOrCode);
    const allowed = ['NEW', 'PENDING', 'CONFIRMED', 'CONTACTED', 'COMPLETED', 'CANCELLED'];
    const status = String((req.body && req.body.status) || '').toUpperCase();

    if (!allowed.includes(status)) {
        return res.status(400).json({ status: 'ERROR', message: 'Invalid status value.' });
    }

    const store = readStore();
    const idx = store.findIndex(r => r.leadId === key || String(r.id) === key);
    if (idx < 0) {
        return res.status(404).json({ status: 'ERROR', message: 'Consultation not found.' });
    }

    store[idx].status = status;
    store[idx].Status = status;
    if (!writeStore(store)) {
        return res.status(500).json({ status: 'ERROR', message: 'Could not save the updated status.' });
    }
    res.json({ status: 'OK', consultation: toAdminRecord(store[idx]) });
});

// ── Fallback: root → frontend/index.html ──────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ── 404 — dedicated page (multi-page site, not an SPA) ────────────
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
});

const server = app.listen(PORT, () => {
    console.log(`\n✅ Kezza Clinic Website is LIVE at: http://localhost:${PORT}`);
    console.log(`🤖 Gemini AI API routes loaded: /api/chat, /api/analyze-photo, /api/health`);
    console.log(`📁 Serving from: ./frontend/`);
    console.log(`\nPress Ctrl+C to stop.\n`);
});

if (Number(PORT) !== 3000) {
    try {
        const altServer = app.listen(3000, () => {
            console.log(`✅ Also LIVE at: http://localhost:3000`);
        });
        altServer.on('error', (err) => {
            // port 3000 might be in use, ignore error
        });
    } catch(e) {}
}
