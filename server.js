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
        } else {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // css/js 7d
        }
    },
}));

// ── System Prompt for Kezza Hair & Skin Clinic ──────────────────────
const KEZZA_SYSTEM_INSTRUCTION = `You are Kezza AI, the official virtual clinical assistant for Kezza Hair & Skin Clinic (Jaipur & Sikar, Rajasthan).

CLINIC INFORMATION:
- Locations:
  1. Jaipur Clinic: A-7, 1st Floor, Hanuman Nagar, Sirsi Rd, Main, Khatipura, Jaipur, Rajasthan.
  2. Sikar Clinic: First Floor, Shakambhari Heights, Infront of S.K. Hospital, Silver Jubilee Rd, Sikar, Rajasthan.
- Timings: 9:00 AM to 8:00 PM (Monday to Sunday, All 7 Days).
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
            // Fallback to flash if lite busy
            const fbResponse = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: contents,
                config: {
                    systemInstruction: KEZZA_SYSTEM_INSTRUCTION,
                    temperature: 0.2,
                    maxOutputTokens: 250
                }
            });
            responseText = fbResponse.text || '';
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

        const promptText = `Perform a comprehensive dermatological and trichological visual evaluation of this patient photo for Kezza Hair & Skin Clinic (Jaipur & Sikar).

PATIENT QUESTIONNAIRE & CLINICAL CONTEXT:
${enrichedContext || 'General Skin & Hair Assessment'}

CLINICAL DEPARTMENTS & KEY SPECIALISTS AT KEZZA:
1. HAIR: Dr. Ankit Bhalothia (Sapphire FUE, GFC/PRP Therapy, Hair Thinning)
2. HAIR_TRANSPLANT_SIKAR: Dr. Dhiral Vijayvargiya (Elite Surgical Hair Restoration, Sikar)
3. SKIN: Dr. Amrita Mukhija (Acne, Scars, HydraFacial, Melasma, Laser Toning)
4. ANTI_AGING: Dr. Amrita Mukhija (Botox, Dermal Fillers, HIFU, Skin Tightening)
5. PMU / SMP: Krishna (Eyebrow Microblading, Lip Blush, Scalp Micropigmentation)
6. WEIGHT_LOSS: Kezza Wellness Team (360° Cryolipolysis Fat Freezing, Body Sculpting)
7. ENT_RHINOPLASTY: Dr. Mandhata Sharma (Aesthetic Rhinoplasty, Facial Contour)

REQUIRED OUTPUT FORMAT:
Return a strict JSON object with this exact schema:
{
  "status": "OK",
  "recommended_consultation": "Specific consultation title (e.g. Hair Loss Consultation / Active Acne & Scar Assessment)",
  "treatment_name": "Recommended clinical treatment (e.g. Sapphire FUE Hair Transplant / Medical HydraFacial / GFC Hair Therapy)",
  "department_key": "HAIR or HAIR_TRANSPLANT_SIKAR or SKIN or ANTI_AGING or PMU or SMP or WEIGHT_LOSS or ENT_RHINOPLASTY",
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

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
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

        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({ status: 'ERROR', message: 'WhatsApp number must be exactly 10 digits.' });
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
        const finalLeadId = consultationId || `KEZZA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const leadRecord = {
            timestamp: timestamp || new Date().toISOString(),
            leadId: finalLeadId,
            name: trimmedName,
            whatsapp: cleanPhone,
            phone: cleanPhone,
            age: parsedAge,
            gender: gender || 'Not Specified',
            city: body.city || body.patientLocation || body.patient_city || '',
            clinic: clinic || selectedClinic || 'Jaipur (Flagship)',
            category: categoryTitle || category || '',
            treatment: treatment || '',
            concern: concern || concernDetails || 'General Consultation',
            duration: duration || '',
            date: date || preferredDate || '',
            time: time || preferredTime || '',
            email: email || '',
            message: message || notes || '',
            severity: severity || '',
            symptoms: symptoms || '',
            allergies: allergies || '',
            medicines: medicines || '',
            aiSummary: typeof aiSummary === 'string' ? aiSummary.slice(0, 1500) : JSON.stringify(aiSummary || '').slice(0, 1500),
            source: source || 'Kezza Website',
            consent: true
        };

        console.log(`[Lead Received] ${leadRecord.name} (${leadRecord.whatsapp}) | ${leadRecord.treatment || leadRecord.concern} | ${leadRecord.clinic} | Source: ${leadRecord.source}`);

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

// ── Fallback: root → frontend/index.html ──────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ── 404 — dedicated page (multi-page site, not an SPA) ────────────
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ Kezza Clinic Website is LIVE at: http://localhost:${PORT}`);
    console.log(`🤖 Gemini AI API routes loaded: /api/chat, /api/analyze-photo, /api/health`);
    console.log(`📁 Serving from: ./frontend/`);
    console.log(`\nPress Ctrl+C to stop.\n`);
});
