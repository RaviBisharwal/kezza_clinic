// ============================================
// KEZZA AI — ULTRA-FAST & LIGHTWEIGHT CONVERSATION & VALIDATION SYSTEM
// High-Speed Deterministic State Machine, Pre-compiled RegExes & Instant UI
// Priority: ACCURACY > SAFETY > CORRECT INTENT > CORRECT DATA > SPEED
// Clinic Locations: Jaipur & Sikar ONLY
// ============================================

(function () {
    'use strict';

    // ============================================
    // VERIFIED KEZZA CLINIC LOCATIONS & GOOGLE MAPS (Jaipur & Sikar ONLY)
    // ============================================
    const CLINIC_LOCATIONS = {
        jaipur: {
            city: 'Jaipur',
            clinicName: 'Kezza Hair & Skin Clinic',
            state: 'Rajasthan',
            address: 'A-7, 1st Floor, Hanuman Nagar, Sirsi Rd, Main, Khatipura, Jaipur, Rajasthan 302021',
            phone: '+91-9284517427',
            mapsUrl: 'https://maps.app.goo.gl/vBqhXZdd6AMFGeo46',
            mapsBtnText: '📍 Open Jaipur Clinic in Google Maps',
            flagship: true
        },
        sikar: {
            city: 'Sikar',
            clinicName: 'Kezza Hair & Skin Clinic',
            state: 'Rajasthan',
            address: 'First Floor, Shakambhari Heights, Infront of S.K. Hospital, Silver Jubilee Rd, Sakpura Mohlla, Samrathpura Rural, Sikar, Rajasthan 332001',
            phone: '+91-9284517427',
            mapsUrl: 'https://maps.app.goo.gl/LzPZybnxyxgoK8wU6',
            mapsBtnText: '📍 Open Sikar Clinic in Google Maps',
            flagship: false
        }
    };

    // ============================================
    // STRICT TREATMENT TAXONOMY — Mutually Exclusive Primary Categories
    // PMU ≠ SMP | BEARD MICROPIGMENTATION ≠ PMU | MEDICAL FACIAL = SKIN
    // BOTOX = SKIN | GLUTATHIONE = SKIN | DARK CIRCLE = SKIN
    // ============================================
    const STRICT_INTENT_TAXONOMY = {
        // ── SKIN INTENTS (route to: 9216063686) ──────────────────────────
        MEDICAL_FACIAL: {
            category: 'SKIN',
            label: 'Medical Facial',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['medical facial', 'medi facial', 'medifacial', 'medical face treatment', 'medical facial treatment', 'medical facial consultation', 'medical facial appointment', 'medical facial available', 'medical facial price', 'medical facial kya hota hai', 'medical facial karwana', 'face ka medical facial'],
            triggers_hi: ['medical facial chahiye', 'medical facial karwana hai', 'skin ke liye medical facial', 'medical facial ka consultation', 'medical facial se baat'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Medical Facial.'
        },
        BOTOX: {
            category: 'SKIN',
            label: 'Botox',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['botox', 'botox treatment', 'botox consultation', 'botox karwana', 'wrinkle ke liye botox'],
            triggers_hi: ['botox chahiye', 'botox karwana hai', 'botox ka treatment'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Botox.'
        },
        GLUTATHIONE: {
            category: 'SKIN',
            label: 'Glutathione',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['glutathione', 'glutathione treatment', 'glutathione therapy', 'glutathione injection'],
            triggers_hi: ['glutathione chahiye', 'glutathione karwana hai', 'glutathione ka treatment'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Glutathione treatment.'
        },
        DARK_CIRCLE: {
            category: 'SKIN',
            label: 'Dark Circle Treatment',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['dark circle', 'dark circles', 'under eye dark', 'under eye treatment', 'dark circle treatment', 'kale ghere', 'aankhon ke neeche'],
            triggers_hi: ['dark circle hai', 'dark circles hain', 'aankhon ke neeche kaala', 'eyes ke niche darkness'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Dark Circle Treatment.'
        },
        ACNE_SCAR: {
            category: 'SKIN',
            label: 'Acne & Scar Treatment',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['acne', 'pimple', 'pimples', 'acne scar', 'acne scars', 'pimple marks', 'pimple scar', 'acne treatment', 'acne marks', 'face ke daag', 'muhase', 'muhasa', 'pimpal'],
            triggers_hi: ['acne hai', 'acne hain', 'pimples hain', 'acne ke daag', 'acne scar treatment chahiye'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Acne/Scar treatment.'
        },
        SKIN_PIGMENTATION: {
            category: 'SKIN',
            label: 'Skin Pigmentation',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['skin pigmentation', 'pigmentation on face', 'face pigmentation', 'pigmentation treatment', 'pigmentation removal', 'uneven skin tone', 'dull skin'],
            triggers_hi: ['pigmentation hai', 'chehra pigmentation', 'skin ka pigmentation'],
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for Skin Pigmentation.'
        },
        ANTI_AGING: {
            category: 'SKIN',
            label: 'Anti-Aging Treatment',
            phone: '9216063686',
            specialist: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            triggers_en: ['anti aging', 'anti-aging', 'antiaging', 'wrinkle', 'wrinkles', 'fine lines', 'fine line', 'skin tightening', 'skin rejuvenation', 'rejuvenation', 'youthful skin', 'jhurri', 'jhurriya', 'face tight'],
            triggers_hi: ['anti aging chahiye', 'anti aging treatment', 'wrinkles hain', 'jhurriya hain', 'face tight karna'],
            defaultMsg: 'Hello Kezza Anti-Aging Team, I would like to book a consultation for anti-aging treatment.'
        },
        // ── PMU INTENTS (route to: 9079163100) ────────────────────────────
        EYEBROW_PMU: {
            category: 'PMU',
            label: 'Eyebrow PMU',
            phone: '9079163100',
            specialist: 'Dr. Krishna Choudhary',
            triggers_en: ['eyebrow pmu', 'pmu eyebrow', 'permanent eyebrow', 'eyebrow permanent makeup', 'microblading', 'ombre brows', 'powder brows', 'eyebrow tattoo', 'brow pmu', 'brow permanent makeup', 'permanent brows'],
            triggers_hi: ['eyebrow pmu chahiye', 'eyebrow permanent makeup', 'bhrauhn pmu'],
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a consultation for Eyebrow PMU.'
        },
        LIP_PMU: {
            category: 'PMU',
            label: 'Lip PMU',
            phone: '9079163100',
            specialist: 'Dr. Krishna Choudhary',
            triggers_en: ['lip pmu', 'pmu lip', 'lip blush', 'lip blushing', 'lip neutralization', 'cosmetic lip pigmentation', 'permanent lip', 'lip permanent makeup', 'lip color correction'],
            triggers_hi: ['lip pmu chahiye', 'lip blush chahiye', 'lip permanent makeup'],
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a consultation for Lip PMU.'
        },
        EYELINER_PMU: {
            category: 'PMU',
            label: 'Permanent Eyeliner',
            phone: '9079163100',
            specialist: 'Dr. Krishna Choudhary',
            triggers_en: ['permanent eyeliner', 'eyeliner pmu', 'pmu eyeliner', 'lash enhancement', 'lash line tattoo'],
            triggers_hi: ['permanent eyeliner chahiye', 'eyeliner permanent'],
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a consultation for Permanent Eyeliner.'
        },
        BEAUTY_SPOT: {
            category: 'PMU',
            label: 'Beauty Spot',
            phone: '9079163100',
            specialist: 'Dr. Krishna Choudhary',
            triggers_en: ['beauty spot', 'beauty mark', 'mole tattoo'],
            triggers_hi: ['beauty spot chahiye', 'beauty mark lagwana hai'],
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a consultation for Beauty Spot.'
        },
        // ── SMP INTENTS (route to: 9079163100 — SMP dept) ─────────────────
        SMP: {
            category: 'SMP',
            label: 'Scalp Micropigmentation (SMP)',
            phone: '9079163100',
            specialist: 'Kezza SMP Team',
            triggers_en: ['scalp micropigmentation', 'smp', 'hairline smp', 'scalp pigmentation', 'scalp density pigmentation', 'bald scalp pigmentation', 'hair tattoo scalp', 'scalp micro'],
            triggers_hi: ['scalp micropigmentation chahiye', 'smp karwana hai', 'scalp pigmentation chahiye'],
            defaultMsg: 'Hello Kezza SMP Team, I would like to book a consultation for Scalp Micropigmentation (SMP).'
        },
        // ── BEARD MICROPIGMENTATION ──────────────────────────────────────
        BEARD_MICROPIGMENTATION: {
            category: 'BEARD_MICROPIGMENTATION',
            label: 'Beard Micropigmentation',
            phone: null,
            specialist: null,
            triggers_en: ['beard micropigmentation', 'beard micro pigmentation', 'beard smp', 'beard density pigmentation', 'beard enhancement pigmentation', 'facial hair micropigmentation', 'beard pigmentation', 'beard micro'],
            triggers_hi: ['beard micropigmentation chahiye', 'beard pigmentation karwana', 'dadhi micropigmentation'],
            defaultMsg: null
        },
        // ── STRETCH MARK / SCAR CAMOUFLAGE (route to SMP dept) ────────────
        STRETCH_MARK: {
            category: 'SMP',
            label: 'Stretch Mark Camouflage',
            phone: '9079163100',
            specialist: 'Kezza SMP Team',
            triggers_en: ['stretch mark', 'stretch marks', 'stretchmark', 'stretch mark camouflage', 'stretch mark treatment'],
            triggers_hi: ['stretch mark hai', 'stretch marks hain', 'stretch mark treatment chahiye'],
            defaultMsg: 'Hello Kezza SMP Team, I would like to book a consultation for Stretch Mark treatment.'
        },
        SCAR_CAMOUFLAGE: {
            category: 'SMP',
            label: 'Scar Camouflage',
            phone: '9079163100',
            specialist: 'Kezza SMP Team',
            triggers_en: ['scar camouflage', 'vitiligo camouflage', 'scar cover', 'tattoo camouflage'],
            triggers_hi: ['scar camouflage chahiye', 'vitiligo camouflage'],
            defaultMsg: 'Hello Kezza SMP Team, I would like to book a consultation for Scar/Vitiligo Camouflage.'
        }
    };

    const DEPARTMENTS = {
        weight_loss: {
            id: 'WEIGHT_LOSS',
            name: 'Weight Loss Department',
            phone: '9057546221',
            consultationBtn: '📅 Book Weight Loss Consultation',
            buttonTextEn: 'Chat with Weight Loss Team',
            buttonTextHi: 'Weight Loss Team se Chat Karein',
            defaultMsg: 'Hello Kezza Weight Loss Team, I would like to book a consultation for weight loss.',
            scope: ['weight loss', 'fat loss', 'slimming', 'body weight', 'obesity', 'lose weight', 'inch loss', 'diet', 'wajan kam', 'wazan kam', 'mota', 'motapa', 'pet kam', 'vajan kam']
        },
        hair_loss: {
            id: 'HAIR_LOSS',
            name: 'Hair Loss Department',
            phone: '9216063681',
            consultationBtn: '📅 Book Hair Consultation',
            buttonTextEn: 'Chat with Hair Loss Team',
            buttonTextHi: 'Hair Loss Team se Chat Karein',
            defaultMsg: 'Hello Kezza Hair Loss Team, I would like to book a consultation for hair loss/hair treatment.',
            scope: ['hair fall', 'hair loss', 'hair thinning', 'baldness', 'receding hairline', 'hair restoration', 'prp', 'mesotherapy', 'gfc', 'baal', 'bal', 'jhad', 'gir', 'ganja', 'ganjapan', 'hairs', 'airfall', 'hairfal', 'haifall', 'baal jhad', 'bal jhad', 'baal gir', 'bal gir', 'fall raha', 'fall rhi', 'girna', 'jhadte', 'toot']
        },
        acne_scar: {
            id: 'ACNE_SCAR',
            name: 'Skin Team (Acne, Scars, Dark Circle)',
            phone: '9216063686',
            consultationBtn: '📅 Book Skin Consultation',
            buttonTextEn: 'Chat with Skin Team',
            buttonTextHi: 'Skin Team se Chat Karein',
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for acne/scar/skin treatment.',
            scope: ['acne', 'pimple', 'pimples', 'acne scars', 'pimple marks', 'muhase', 'muhasa', 'dhabbe', 'pimpal', 'glowing skin', 'dark circle', 'dark circles', 'skin concern', 'skin problem', 'medical facial', 'medi facial', 'medifacial', 'dark spot']
        },
        smp_stretchmark: {
            id: 'SMP_STRETCHMARK',
            name: 'SMP / Stretch Mark Department',
            phone: '9079163100',
            consultationBtn: '📅 Book SMP / Stretch Mark Consultation',
            buttonTextEn: 'Chat with SMP & Stretch Mark Team',
            buttonTextHi: 'SMP & Stretch Mark Team se Chat Karein',
            defaultMsg: 'Hello Kezza Team, I would like to book a consultation for SMP/stretch mark treatment.',
            scope: ['smp', 'scalp micropigmentation', 'stretch mark', 'stretch marks', 'stretchmark', 'hair tattoo', 'strecth', 'scar camouflage', 'vitiligo camouflage']
        },
        pmu: {
            id: 'PMU',
            name: 'PMU / Permanent Makeup (Dr. Krishna Choudhary)',
            phone: '9079163100',
            consultationBtn: '📅 Book PMU Consultation',
            buttonTextEn: 'Chat with PMU Team (Dr. Krishna Choudhary)',
            buttonTextHi: 'PMU Team se Chat Karein (Dr. Krishna Choudhary)',
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a PMU consultation.',
            scope: ['pmu', 'permanent makeup', 'microblading', 'permanent eyeliner', 'lip blush', 'lip neutralization', 'lash enhancement', 'beauty spot', 'ombre brows', 'powder brows', 'eyebrow tattoo', 'brow tattoo', 'permanent brows']
        },
        eyebrow_lip: {
            id: 'EYEBROW_LIP',
            name: 'Eyebrow & Lip Department',
            phone: '6375011157',
            consultationBtn: '📅 Book Eyebrow / Lip Consultation',
            buttonTextEn: 'Chat with Eyebrow & Lip Team',
            buttonTextHi: 'Eyebrow & Lip Team se Chat Karein',
            defaultMsg: 'Hello Kezza Team, I would like to book a consultation for eyebrow/lip treatment.',
            scope: ['eyebrow transplant', 'cosmetic lip', 'eybrow']
        },
        laser: {
            id: 'LASER',
            name: 'Laser Department',
            phone: '9216063686',
            consultationBtn: '📅 Book Laser Consultation',
            buttonTextEn: 'Chat with Laser Team',
            buttonTextHi: 'Laser Team se Chat Karein',
            defaultMsg: 'Hello Kezza Laser Team, I would like to book a consultation for laser treatment.',
            scope: ['laser', 'laser hair removal', 'skin laser', 'laser treatment', 'laser toning', 'lasar', 'unwanted hair']
        },
        anti_aging: {
            id: 'SKIN',
            name: 'Skin Department',
            phone: '9216063686',
            consultationBtn: '📅 Book Skin Consultation',
            buttonTextEn: 'Chat with Skin Team',
            buttonTextHi: 'Skin Team se Chat Karein',
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a consultation for skin treatment.',
            scope: ['anti aging', 'anti-aging', 'wrinkle', 'wrinkles', 'fine lines', 'fillers', 'filler', 'skin tightening', 'rejuvenation', 'youthful skin', 'jhurri', 'jhurriya', 'face tight', 'hifu']
        }
    };

    // ============================================
    // VERIFIED SPECIALIST DIRECTORY
    // ============================================
    const SPECIALISTS = {
        dr_ankit: {
            id: 'HAIR_LOSS',
            name: 'Dr. Ankit Bhalothia',
            role: 'Hair Specialist',
            phone: '9216063681',
            buttonTextEn: 'Chat with Hair Team (Dr. Ankit Bhalothia)',
            buttonTextHi: 'Hair Team se Chat Karein (Dr. Ankit Bhalothia)',
            defaultMsg: 'Hello Kezza Hair Team (Dr. Ankit Bhalothia), I would like to book a consultation for hair loss / hair treatment.'
        },
        elite_surgical: {
            id: 'HAIR_TRANSPLANT',
            name: 'Elite Surgical',
            role: 'Hair Transplant Surgeon',
            location: 'Sikar',
            phone: '8130888129',
            buttonTextEn: 'Chat with Hair Transplant Team (Elite Surgical)',
            buttonTextHi: 'Hair Transplant Team se Chat Karein (Elite Surgical)',
            defaultMsg: 'Hello Elite Surgical Hair Transplant Team, I would like to book a hair transplant consultation.'
        },
        skin_team: {
            id: 'SKIN',
            name: 'Skin Team (Dr. Amrita Makhija / Dr. Neelam Choudhary)',
            role: 'Skin Specialists',
            phone: '9216063686',
            buttonTextEn: 'Chat with Skin Team',
            buttonTextHi: 'Skin Team se Chat Karein',
            defaultMsg: 'Hello Kezza Skin Team, I would like to book a skin consultation.'
        },
        dr_krishna: {
            id: 'PMU',
            name: 'Dr. Krishna Choudhary',
            role: 'Makeup / PMU Specialist',
            phone: '9079163100',
            buttonTextEn: 'Chat with PMU Team (Dr. Krishna Choudhary)',
            buttonTextHi: 'PMU Team se Chat Karein (Dr. Krishna Choudhary)',
            defaultMsg: 'Hello Dr. Krishna Choudhary PMU Team, I would like to book a PMU / Makeup consultation.'
        },
        dr_dhiral: {
            id: 'DENTAL',
            name: 'Dr. Dhiral Vijayvargiya',
            role: 'Dental Specialist',
            phone: null,
            buttonTextEn: null,
            buttonTextHi: null,
            defaultMsg: null
        }
    };

    const CLINIC = {
        name: 'Kezza Hair & Skin Clinic',
        generalPhone: '+91-9284517427',
        generalWhatsApp: '919284517427',
        email: 'support@kezza.co.in',
        website: 'https://kezza.co.in',
        timings: '10:00 AM – 7:00 PM, Monday–Saturday'
    };

    const DOCTORS = [
        {
            name: 'Dr. Ankit Bhalothia',
            title: 'Aesthetic & Hair Transplant Surgeon',
            specialization: 'Oral and Maxillofacial Surgeon specializing in hair restoration, hairline design, and facial aesthetics',
            brief: 'Led 10,000+ successful procedures with expertise in FUE, DHI, and facial contouring.'
        },
        {
            name: 'Dr. Amrita Mukhija',
            title: 'Aesthetic Physician and Skin Specialist',
            specialization: 'Laser treatments, injectables, anti-aging, skin rejuvenation, and customized skincare',
            brief: 'Experienced aesthetic physician delivering safe, natural-looking skin results.'
        },
        {
            name: 'Dr. Neelam Choudhary',
            title: 'Aesthetic Physician and Skin Specialist',
            specialization: 'Skin rejuvenation, anti-aging treatments, laser therapies, and customized skincare',
            brief: 'Dedicated to personalized care for healthier, clearer, youthful-looking skin.'
        },
        {
            name: 'Dr. Dhiral Vijayvargiya',
            title: 'Dental, Aesthetic Physician & Hair Transplant Surgeon',
            specialization: 'Oral and Maxillofacial Surgeon with expertise in hair transplantation and facial aesthetics',
            brief: 'Combines elite surgical expertise with refined aesthetic precision for natural results.'
        },
        {
            name: 'Krishna',
            title: 'Permanent Makeup (PMU) Artist',
            specialization: 'Permanent makeup including microblading, lip blushing, and cosmetic tattooing',
            brief: 'Skilled PMU artist dedicated to enhancing natural beauty with precision and artistry.'
        }
    ];

    const VERIFIED_TESTIMONIALS = [
        { name: 'Nisha S.', text: 'I got full body laser hair removal at Kezza clinic and I’m so impressed with the results! The treatment was quick, painless, and the staff made me feel comfortable throughout.' },
        { name: 'Ansh G.', text: 'I had an excellent experience with my hair transplant at Kezza. Dr. Ankit Bhalothia and the team were professional and caring. Best clinic in Jaipur!' },
        { name: 'Deepa R.', text: 'Best skin clinic in Rajasthan, Best Doctor\'s Team.' },
        { name: 'Ayush K.', text: 'I took laser treatment and had excellent results after 3 sessions. Highly recommended!' }
    ];

    const SYSTEM_PROMPT = `
You are Kezza AI, the official AI patient-assistance chatbot for Kezza Hair & Skin Clinic.
ROLE: Help website visitors with treatment information, hair/skin/dental/PMU concerns, clinic information, specialist routing, consultation booking, and general FAQs.
You are NOT a doctor. Never replace professional medical consultation.
Always respond in the SAME language style the patient uses (English, Hindi, or conversational Hinglish).
`;

    // ============================================
    // STATE & CONFIGURATION
    // ============================================
    let state = {
        isOpen: false,
        userName: null,
        userAge: null,
        patientLocation: null,
        selectedClinic: null,
        lastConcern: null,
        userPhone: null,
        consultationFlow: null,
        messageCount: 0,
        hasGreeted: false,
        tooltipDismissed: false,
        apiKey: localStorage.getItem('kezza_gemini_api_key') || '',
        voiceEnabled: localStorage.getItem('kezza_voice_enabled') === 'true',
        isListening: false,
        chatHistory: []
    };

    let recognition = null;
    let synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;

    // Precompiled RegEx patterns
    const RX_NORM_BHOT      = /\b(bhot|bht|bahaot|bhut)\b/g;
    const RX_NORM_RHA       = /\b(rha|rhe|rahi|rahe)\b/g;
    const RX_NORM_KRNA      = /\b(krna|krna h|karna h|karvana|karwana|krwana|karwao)\b/g;
    const RX_NORM_KR        = /\b(kr|kro|krdo|kardo)\b/g;
    const RX_NORM_CHYE      = /\b(chye|chaiye|chahie|chahye|chaheye|chahiye)\b/g;
    const RX_NORM_MUJE      = /\b(muje|mujko|hume)\b/g;
    const RX_NORM_NHI       = /\b(nhi|nai|nahin|ni)\b/g;
    const RX_NORM_KAHA      = /\b(kaha|kahan|kidhar)\b/g;
    const RX_NORM_JHAD      = /\b(jhad|jhadna|girna|jhadte)\b/g;
    const RX_NORM_AIRFALL   = /\b(airfall|hairfal|haifall|hairfall|hairfalls|baal jhad|bal jhad|bal gir|baal gir)\b/g;
    const RX_NORM_TRANS     = /\b(trensplant|transplat|transplnt)\b/g;
    const RX_NORM_LASER     = /\b(lasar)\b/g;
    const RX_NORM_WAJAN     = /\b(wajan|vajan)\b/g;
    const RX_NORM_JHURRI    = /\b(jhurri|jhurriya|jhurriyan)\b/g;
    const RX_DEVANAGARI     = /[\u0900-\u097F]/;
    const RX_NORM_APPOINT   = /\b(apointment|appoitement|appointmnt|appontment)\b/g;
    const RX_NORM_CONSULT   = /\b(consulation|consultion|consult ation|consultasion)\b/g;
    const RX_NORM_BAAL      = /\b(bal\b|baal\b)/g;
    const RX_NORM_DAAG      = /\b(daag|dabbe|dhabbe|dhabb|dabbe)\b/g;
    const RX_NORM_SUBAH     = /\b(svere|sbere|subha)\b/g;
    const RX_NORM_SHAAM     = /\b(sham|sham ko|shaame|shaam ko)\b/g;
    const RX_NORM_BOOK      = /\b(bok|boook)\b/g;
    const RX_NORM_PIMPLE    = /\b(pimpls|pimles|pimle|pimpl)\b/g;
    const RX_NORM_DOCTOR    = /\b(docter|doktar|dok)\b/g;
    const RX_NORM_TREATMENT = /\b(treament|treatement|treetment|tratment)\b/g;
    const RX_NORM_HAIR_TR   = /\b(balo ka|baalon ka|baal ka|bal ka)\b/g;

    function normalizeHinglish(text) {
        if (!text) return '';
        let t = text.toLowerCase().trim();
        t = t.replace(RX_NORM_AIRFALL, 'hair fall')
             .replace(RX_NORM_BHOT,   'bahut')
             .replace(RX_NORM_RHA,    'raha')
             .replace(RX_NORM_KRNA,   'karna')
             .replace(RX_NORM_KR,     'kar')
             .replace(RX_NORM_CHYE,   'chahiye')
             .replace(RX_NORM_MUJE,   'mujhe')
             .replace(RX_NORM_NHI,    'nahi')
             .replace(RX_NORM_KAHA,   'kahan')
             .replace(RX_NORM_JHAD,   'fall')
             .replace(RX_NORM_TRANS,  'transplant')
             .replace(RX_NORM_LASER,  'laser')
             .replace(RX_NORM_WAJAN,  'weight')
             .replace(RX_NORM_JHURRI, 'wrinkles')
             .replace(RX_NORM_APPOINT,   'appointment')
             .replace(RX_NORM_CONSULT,   'consultation')
             .replace(RX_NORM_DAAG,      'marks')
             .replace(RX_NORM_SUBAH,     'subah')
             .replace(RX_NORM_SHAAM,     'shaam')
             .replace(RX_NORM_BOOK,      'book')
             .replace(RX_NORM_PIMPLE,    'pimple')
             .replace(RX_NORM_DOCTOR,    'doctor')
             .replace(RX_NORM_TREATMENT, 'treatment')
             .replace(RX_NORM_HAIR_TR,   'hair');
        return t;
    }

    const HINGLISH_TRIGGERS = new Set([
        'hai', 'hain', 'kya', 'kaise', 'kaisa', 'kab', 'kahan', 'kaha', 'kitna', 'kitne',
        'mein', 'mera', 'mere', 'meri', 'mujhe', 'chahiye', 'karna', 'karo', 'baal', 'bal',
        'chehra', 'batao', 'dikhana', 'milna', 'wajan', 'vajan', 'daag', 'dhabbe', 'h',
        'rha', 'rhe', 'bhot', 'bht', 'nhi', 'nai', 'shikayat', 'swagat', 'dhanyawad',
        'karwana', 'batayein', 'padega', 'hoga', 'hota', 'hoti', 'lagta', 'lagega',
        'haan', 'nahi', 'krdo', 'kardo', 'bhejo', 'book', 'apna', 'apni', 'aapka', 'aapki',
        'bilkul', 'thoda', 'bahut', 'bohot', 'bhai', 'yaar', 'please', 'plz', 'gir', 'jhad',
        'problem', 'samajh', 'zaroor', 'theek', 'theek hai', 'sahi', 'accha', 'acha'
    ]);

    function detectLanguage(text) {
        if (!text) return 'english';
        if (RX_DEVANAGARI.test(text)) return 'hindi';
        const words = text.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            if (HINGLISH_TRIGGERS.has(words[i])) return 'hinglish';
        }
        return 'english';
    }

    function getISTTimeInfo() {
        try {
            const now = new Date();
            const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const istDate = new Date(istString);
            const day = istDate.getDay();
            const hour = istDate.getHours();
            const minute = istDate.getMinutes();
            const totalMinutes = hour * 60 + minute;
            const isOpenHour = (totalMinutes >= 540 && totalMinutes < 1200);
            const isOpenDay = (day >= 1 && day <= 6);
            return { isOpen: isOpenHour && isOpenDay, hour, minute, day };
        } catch (e) {
            const now = new Date();
            const hour = now.getHours();
            return { isOpen: (hour >= 9 && hour < 20), hour, minute: now.getMinutes(), day: now.getDay() };
        }
    }

    function updateBusinessHoursHeaderStatus() {
        const statusEl = document.getElementById('kezzaHeaderStatus');
        if (!statusEl) return;
        const timeInfo = getISTTimeInfo();
        if (timeInfo.isOpen) {
            statusEl.innerHTML = `<span class="kezza-status-dot online"></span> <span><strong>Online</strong> — Available 9:00 AM to 8:00 PM</span>`;
        } else {
            statusEl.innerHTML = `<span class="kezza-status-dot offline"></span> <span><strong>Offline</strong> — Available tomorrow from 9:00 AM</span>`;
        }
    }

    function getGreetingResponse(lang) {
        const timeInfo = getISTTimeInfo();
        const quickReplies = ['💬 Enquiry', '🩺 Treatment', '📅 Book Consultation', '👨⚕️ Specialists', '📍 Clinic Location', '📞 Contact Team'];

        if (timeInfo.isOpen) {
            if (lang === 'hinglish') {
                return {
                    text: `Namaste! 👋 Main <strong>Kezza AI</strong> hoon. How can I help you today?\n\nKezza ke treatments, pricing, Jaipur & Sikar clinic locations, ya consultation booking ke liye options select karein:`,
                    quickReplies: quickReplies
                };
            }
            if (lang === 'hindi') {
                return {
                    text: `नमस्ते! 👋 मैं <strong>Kezza AI</strong> हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?\n\nKezza के treatments, clinic locations (Jaipur & Sikar) या consultation booking के लिए विकल्प चुनें:`,
                    quickReplies: quickReplies
                };
            }
            return {
                text: `Hi! 👋 I'm <strong>Kezza AI</strong>. How can I help you today?\n\nI can assist you with treatment information, clinic locations in Jaipur & Sikar, or help you book a consultation:`,
                quickReplies: quickReplies
            };
        } else {
            if (lang === 'hinglish') {
                return {
                    text: `Hi! 👋 Main <strong>Kezza AI</strong> hoon. Hamari consultation team abhi <strong>currently closed</strong> hai aur subah <strong>9:00 AM</strong> se available hogi.`,
                    quickReplies: quickReplies
                };
            }
            return {
                text: `Hi! 👋 I'm <strong>Kezza AI</strong>. Our consultation team is <strong>currently closed</strong> and will be available from <strong>9:00 AM</strong> tomorrow.`,
                quickReplies: quickReplies
            };
        }
    }

    function getWhatsAppUrl(phone, messageText) {
        const cleanPhone = phone ? phone.replace(/\D/g, '') : '9284517427';
        const encoded = encodeURIComponent(messageText || 'Hello Kezza Team, I would like to enquire about consultation.');
        return `https://wa.me/91${cleanPhone}?text=${encoded}`;
    }

    function createWhatsAppButtonHtml(deptKey, customMsg, lang) {
        const dept = DEPARTMENTS[deptKey];
        if (!dept) return '';
        const url = getWhatsAppUrl(dept.phone, customMsg || dept.defaultMsg);
        const label = (lang === 'hindi' || lang === 'hinglish') ? dept.buttonTextHi : dept.buttonTextEn;
        return `<a href="${url}" target="_blank" class="kezza-whatsapp-btn"><i class="fab fa-whatsapp"></i> ${label}</a>`;
    }

    function createMapButtonHtml(locationKey) {
        const loc = CLINIC_LOCATIONS[locationKey];
        if (!loc) return '';
        return `<a href="${loc.mapsUrl}" target="_blank" class="kezza-map-btn">${loc.mapsBtnText}</a>`;
    }

    function detectDepartment(userText) {
        if (!userText) return null;
        const norm = normalizeHinglish(userText);
        const strictResult = classifyStrictIntent(userText);
        if (strictResult) {
            const tax = strictResult.taxonomy;
            switch (tax.category) {
                case 'SKIN':   return 'acne_scar';
                case 'PMU':    return 'pmu';
                case 'SMP':    return 'smp_stretchmark';
                case 'ANTI_AGING': return 'anti_aging';
                default: break;
            }
        }
        if (norm.includes('laser')) return 'laser';
        if (DEPARTMENTS.weight_loss.scope.some(k => norm.includes(k))) return 'weight_loss';
        if (DEPARTMENTS.hair_loss.scope.some(k => norm.includes(k))) return 'hair_loss';
        if (DEPARTMENTS.smp_stretchmark.scope.some(k => norm.includes(k))) return 'smp_stretchmark';
        if (DEPARTMENTS.pmu.scope.some(k => norm.includes(k))) return 'pmu';
        if (DEPARTMENTS.acne_scar.scope.some(k => norm.includes(k))) return 'acne_scar';
        if (DEPARTMENTS.eyebrow_lip.scope.some(k => norm.includes(k))) return 'eyebrow_lip';
        if (DEPARTMENTS.anti_aging.scope.some(k => norm.includes(k))) return 'anti_aging';
        return null;
    }

    function detectMultipleDepartments(userText) {
        const norm = normalizeHinglish(userText);
        const detected = [];
        if (DEPARTMENTS.hair_loss.scope.some(k => norm.includes(k))) detected.push('hair_loss');
        if (DEPARTMENTS.weight_loss.scope.some(k => norm.includes(k))) detected.push('weight_loss');
        if (norm.includes('laser')) detected.push('laser');
        if (DEPARTMENTS.acne_scar.scope.some(k => norm.includes(k))) detected.push('acne_scar');
        if (DEPARTMENTS.pmu.scope.some(k => norm.includes(k))) detected.push('pmu');
        if (DEPARTMENTS.smp_stretchmark.scope.some(k => norm.includes(k))) detected.push('smp_stretchmark');
        return [...new Set(detected)];
    }

    const DEPARTMENT_ROUTING_TABLE = {
        HAIR_LOSS: {
            id: 'HAIR_LOSS',
            specialistName: 'Dr. Ankit Bhalothia',
            departmentName: 'Hair Specialist',
            phone: '9216063681',
            buttonTextEn: '💬 Send Consultation to Hair Specialist (9216063681)',
            buttonTextHi: '💬 Hair Specialist (Dr. Ankit) ko WhatsApp par Send karein (9216063681)'
        },
        HAIR_TRANSPLANT: {
            id: 'HAIR_TRANSPLANT',
            specialistName: 'Elite Surgical Hair Transplant Surgeon',
            departmentName: 'Hair Transplant Surgery',
            location: 'Sikar',
            phone: '8130888129',
            buttonTextEn: '💬 Send Consultation to Elite Surgical (8130888129)',
            buttonTextHi: '💬 Elite Surgical ko WhatsApp par Send karein (8130888129)'
        },
        SKIN: {
            id: 'SKIN',
            specialistsText: 'Dr. Amrita Makhija / Dr. Neelam Choudhary',
            departmentName: 'Skin',
            phone: '9216063686',
            buttonTextEn: '💬 Send Consultation to Skin Team (9216063686)',
            buttonTextHi: '💬 Skin Team ko WhatsApp par Send karein (9216063686)'
        },
        PMU: {
            id: 'PMU',
            specialistName: 'Dr. Krishna Choudhary',
            departmentName: 'Makeup / PMU',
            phone: '9079163100',
            buttonTextEn: '💬 Send Consultation to Dr. Krishna Choudhary (9079163100)',
            buttonTextHi: '💬 Dr. Krishna Choudhary ko WhatsApp par Send karein (9079163100)'
        },
        DENTAL: {
            id: 'DENTAL',
            specialistName: 'Dr. Dhiral Vijayvargiya',
            departmentName: 'Dental',
            phone: null
        },
        WEIGHT_LOSS: {
            id: 'WEIGHT_LOSS',
            specialistName: 'Kezza Weight Loss Team',
            departmentName: 'Weight Loss Department',
            phone: '9057546221',
            buttonTextEn: '💬 Send Consultation to Weight Loss Team (9057546221)',
            buttonTextHi: '💬 Weight Loss Team ko WhatsApp par Send karein (9057546221)'
        }
    };

    const RX_SPEC_TRANSPLANT = /\b(hair\s*transplant|transplant|fue|dhi|graft|baldness\s*transplant|surgical\s*hair)\b/i;
    const RX_SPEC_PMU = /\b(pmu|permanent\s*makeup|microblading|ombre\s*brows|powder\s*brows|eyebrow\s*pmu|lip\s*blush|lip\s*neutralization|permanent\s*eyeliner|lash\s*enhancement|beauty\s*spot)\b/i;
    const RX_SPEC_SMP = /\b(scalp\s*micropigmentation|\bsmp\b|hairline\s*smp|scalp\s*pigmentation|hair\s*tattoo\s*scalp)\b/i;
    const RX_SPEC_BEARD_MICRO = /\b(beard\s*micro\s*pigmentation|beard\s*micropigmentation|beard\s*smp|beard\s*density\s*pigmentation)\b/i;
    const RX_SPEC_DENTAL = /\b(dental|teeth|tooth|daant|dant)\b/i;
    const RX_SPEC_SKIN = /\b(acne|pimple|scar|scars|dark\s*circle|dark\s*circles|botox|glutathione|medical\s*facial|medi\s*facial|anti\s*aging|laser)\b/i;
    const RX_SPEC_WEIGHT = /\b(weight|fat|slimming|body\s*slimming|diet|obesity|wajan|vajan)\b/i;

    function classifyStrictIntent(userText) {
        if (!userText) return null;
        const norm = normalizeHinglish(userText);
        const lower = userText.toLowerCase().trim();

        if (RX_SPEC_BEARD_MICRO.test(norm)) {
            return { intentKey: 'BEARD_MICROPIGMENTATION', taxonomy: STRICT_INTENT_TAXONOMY.BEARD_MICROPIGMENTATION };
        }

        const intentOrder = [
            'MEDICAL_FACIAL', 'DARK_CIRCLE', 'ACNE_SCAR', 'SKIN_PIGMENTATION',
            'EYEBROW_PMU', 'LIP_PMU', 'EYELINER_PMU', 'BEAUTY_SPOT',
            'SMP', 'STRETCH_MARK', 'SCAR_CAMOUFLAGE',
            'BOTOX', 'GLUTATHIONE', 'ANTI_AGING'
        ];
        for (const key of intentOrder) {
            const tax = STRICT_INTENT_TAXONOMY[key];
            if (!tax) continue;
            const allTriggers = (tax.triggers_en || []).concat(tax.triggers_hi || []);
            if (allTriggers.some(t => norm.includes(t) || lower.includes(t))) {
                return { intentKey: key, taxonomy: tax };
            }
        }

        return null;
    }

    function resolveConsultationRouting(concernText) {
        const norm = normalizeHinglish(concernText || '');
        if (RX_SPEC_BEARD_MICRO.test(norm)) return DEPARTMENT_ROUTING_TABLE.SKIN;
        if (RX_SPEC_TRANSPLANT.test(norm)) return DEPARTMENT_ROUTING_TABLE.HAIR_TRANSPLANT;
        if (RX_SPEC_DENTAL.test(norm)) return DEPARTMENT_ROUTING_TABLE.DENTAL;
        if (RX_SPEC_SMP.test(norm)) return DEPARTMENT_ROUTING_TABLE.PMU;
        if (RX_SPEC_PMU.test(norm)) return DEPARTMENT_ROUTING_TABLE.PMU;
        if (RX_SPEC_SKIN.test(norm)) return DEPARTMENT_ROUTING_TABLE.SKIN;
        if (RX_SPEC_WEIGHT.test(norm)) return DEPARTMENT_ROUTING_TABLE.WEIGHT_LOSS;
        return DEPARTMENT_ROUTING_TABLE.HAIR_LOSS;
    }

    function buildConsultationWhatsAppMessage(data, routing) {
        const clinicCity = (data.selectedClinic && data.selectedClinic.toLowerCase().includes('sikar')) ? 'Sikar' : 'Jaipur';
        const catConfig = CONSULTATION_CATEGORIES[data.category] || {};
        const categoryLabel = catConfig.title || (data.category ? data.category.replace('_', ' ') : 'General');

        return `Hello Kezza Team,

A new consultation enquiry has been received through the Kezza AI website.

📋 CONSULTATION ENQUIRY
👤 Name: ${data.name || ''}
🎂 Age: ${data.age || ''}
📍 Patient Location: ${data.patientLocation || ''}
🏥 Preferred Clinic: ${clinicCity}
🏷️ Category: ${categoryLabel}
🩺 Treatment: ${data.treatment || 'Consultation'}
📝 Concern / Duration: ${data.concernDetails || 'Standard Clinical Assessment'}
📅 Preferred Date: ${data.date || ''}
🕐 Preferred Time: ${data.time || ''}
📱 Patient WhatsApp: ${data.phone || ''}
🏷️ Department: ${routing.departmentName}

Please contact the patient for appointment confirmation.
— Kezza AI`;
    }

    function createSpecialistWhatsAppButtonHtml(specialistKey, customMsg, lang) {
        const spec = SPECIALISTS[specialistKey];
        if (!spec || !spec.phone) return '';
        const url = getWhatsAppUrl(spec.phone, customMsg || spec.defaultMsg);
        const label = (lang === 'hindi' || lang === 'hinglish') ? spec.buttonTextHi : spec.buttonTextEn;
        return `<a href="${url}" target="_blank" class="kezza-whatsapp-btn"><i class="fab fa-whatsapp"></i> ${label}</a>`;
    }

    function validateName(text) {
        if (!text) return null;
        let clean = text.replace(/^(my name is|mera naam|i am|iam|naam hai|naam)\s*/i, '').trim();
        clean = clean.replace(/[^\w\s\.\u0900-\u097F]/g, '').trim();
        if (!clean || clean.length < 2 || clean.length > 50) return null;
        if (/^\d+$/.test(clean)) return null;
        return clean;
    }

    function validateAge(text) {
        if (!text) return null;
        const match = text.match(/\b([1-9]\d?|1[01]\d)\b/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= 5 && num <= 110) return num;
        }
        return null;
    }

    function validatePatientLocation(text) {
        if (!text) return null;
        let clean = text.replace(/^(i live in|i am from|mein rehta hu|se hu|location)\s*/i, '').replace(/📍/g, '').trim();
        if (!clean || clean.length < 2 || clean.length > 50) return null;
        return clean;
    }

    function validateClinic(text) {
        if (!text) return null;
        const lower = text.toLowerCase();
        if (lower.includes('jaipur')) return 'Jaipur';
        if (lower.includes('sikar')) return 'Sikar';
        return null;
    }

    function validateDate(text) {
        if (!text) return null;
        const lower = text.toLowerCase().trim();
        if (lower === 'today' || lower === 'aaj') return 'Today';
        if (lower === 'tomorrow' || lower === 'kal') return 'Tomorrow';
        if (lower.includes('weekend')) return 'This Weekend';
        if (text.length >= 2 && text.length <= 40) return text.trim();
        return null;
    }

    function validateTime(text) {
        if (!text) return null;
        const lower = text.toLowerCase().trim();
        if (lower.includes('morning') || lower.includes('subah')) return 'Morning (11:00 AM)';
        if (lower.includes('afternoon') || lower.includes('dopahar')) return 'Afternoon (2:00 PM)';
        if (lower.includes('evening') || lower.includes('shaam')) return 'Evening (5:00 PM)';
        return text.trim();
    }

    function validatePhone(text) {
        if (!text) return null;
        const digits = text.replace(/\D/g, '');
        if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits;
        if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return digits.slice(2);
        return null;
    }

    function isConsultationConsentIntent(text, norm) {
        if (!text) return false;
        const lower = text.toLowerCase().trim();
        const consentPhrases = ['haan book', 'book kar do', 'book my consultation', 'haan', 'yes', 'confirm', 'send', 'submit', 'proceed', 'theek hai'];
        return consentPhrases.some(p => lower.includes(p));
    }

    function isInformationalQuery(text, norm) {
        if (!text) return false;
        const lower = text.toLowerCase().trim();
        const infoMarkers = ['kya hai', 'kya hota hai', 'what is', 'what are', 'how does', 'explain', 'batao', 'fayde'];
        return infoMarkers.some(m => lower.includes(m));
    }

    async function submitConsultationAuto(data, lang) {
        const year = new Date().getFullYear();
        const random = Math.floor(10000 + Math.random() * 90000);
        const consultationId = `KEZZA-${year}-${random}`;
        const routing = resolveConsultationRouting(data.treatment || data.category);
        const clinicCity = (data.selectedClinic && data.selectedClinic.toLowerCase().includes('sikar')) ? 'Sikar' : 'Jaipur';

        const summaryCard = `
<div class="kezza-appt-summary">
<strong>📋 Consultation Details:</strong><br><br>
🆔 <strong>Consultation ID:</strong> <code>${consultationId}</code><br>
👤 <strong>Name:</strong> ${escapeHtml(data.name || '')}<br>
🎂 <strong>Age:</strong> ${escapeHtml(String(data.age || ''))}<br>
📍 <strong>Location:</strong> ${escapeHtml(data.patientLocation || '')}<br>
🏥 <strong>Clinic:</strong> ${escapeHtml(clinicCity)}<br>
🩺 <strong>Treatment:</strong> ${escapeHtml(data.treatment || 'Consultation')}<br>
📅 <strong>Date:</strong> ${escapeHtml(data.date || '')}<br>
🕐 <strong>Time:</strong> ${escapeHtml(data.time || '')}<br>
📱 <strong>WhatsApp:</strong> ${escapeHtml(data.phone || '')}
</div>`;

        const leadPayload = {
            timestamp: new Date().toISOString(),
            consultationId: consultationId,
            leadId: consultationId,
            name: data.name || '',
            phone: data.phone || '',
            whatsapp: data.phone || '',
            age: data.age || '',
            city: data.patientLocation || clinicCity,
            clinic: clinicCity,
            category: routing.deptName || data.category || 'Consultation',
            treatment: data.treatment || 'Clinical Consultation',
            preferredDate: data.date || '',
            preferredTime: data.time || '',
            gender: data.gender || '',
            duration: data.duration || '',
            notes: data.notes || '',
            doctor: routing.doctor || '',
            source: 'AI Chatbot'
        };

        // Direct fetch to Google Apps Script Webhook (CORS-safe simple POST)
        try {
            fetch('https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(leadPayload)
            }).catch(e => console.warn('[Chatbot Sheet Sync Warn]:', e));
        } catch (sheetErr) {}

        // Forward to /api/lead (Server also syncs to Google Sheets)
        try {
            fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload)
            }).catch(e => {});
        } catch (apiErr) {}

        try {
            window.open(waUrl, '_blank');
        } catch (e) {}

        return {
            text: `✅ <strong>Consultation Request Processed!</strong>\n\n${summaryCard}\n\n<a href="${waUrl}" target="_blank" class="kezza-whatsapp-btn"><i class="fab fa-whatsapp"></i> WhatsApp par Send Karein (${routing.phone || CLINIC.generalPhone})</a>`,
            quickReplies: ['Thank You 😊', '📍 Clinic Locations', 'Ask Another Question']
        };
    }

    function renderLocationOverview(lang) {
        return {
            text: `Kezza currently has clinic locations in:\n\n📍 <strong>Jaipur</strong>: Hanuman Nagar, Sirsi Rd, Khatipura\n📍 <strong>Sikar</strong>: Shakambhari Heights, Infront of S.K. Hospital\n\nWhich location would you like to see?`,
            quickReplies: ['📍 Jaipur', '📍 Sikar', '📅 Book Consultation']
        };
    }

    function renderBranchDetails(branchKey, lang) {
        const branch = CLINIC_LOCATIONS[branchKey];
        if (!branch) return renderLocationOverview(lang);
        const mapBtn = createMapButtonHtml(branchKey);
        return {
            text: `📍 Our <strong>${branch.city}</strong> clinic is located at:\n\n${branch.address}\n\n${mapBtn}`,
            quickReplies: [`📅 Book ${branch.city} Consultation`, '📍 Clinic Locations']
        };
    }

    const CONSULTATION_CATEGORIES = {
        hair: {
            id: 'hair',
            label: '💇 Hair',
            title: 'Hair',
            treatments: ['Hair Transplant (HT)', 'PRP', 'GFC', 'White Hair Removal', 'Electrolysis', 'Wig'],
            promptEn: 'Which hair concern or treatment would you like to consult about?',
            questionEn: 'What is your main concern and duration?',
            questionOptions: ['Less than 6 months', '6-12 months', '1-2 years', 'More than 2 years']
        },
        skin: {
            id: 'skin',
            label: '✨ Skin',
            title: 'Skin',
            treatments: ['Medical Facial', 'Botox', 'Glutathione', 'Dark Circle Treatment', 'Acne & Scar Treatment', 'Fillers', 'Laser Treatment'],
            promptEn: 'Which skin treatment would you like to consult about?',
            questionEn: 'What is your primary skin concern?',
            questionOptions: ['Active Acne / Marks', 'Uneven Tone', 'Under-eye Circles', 'Skin Glow & Texture']
        },
        weight_loss: {
            id: 'weight_loss',
            label: '⚖️ Weight Loss',
            title: 'Weight Loss',
            treatments: ['Weight Loss Management', 'Body Slimming & Contouring', 'Diet & Metabolic Care', 'Fat Reduction'],
            promptEn: 'What would you like help with regarding weight loss?',
            questionEn: 'What is your main weight-loss goal?',
            questionOptions: ['5-10 kg Weight Loss', '10-20 kg Weight Loss', 'Targeted Fat Loss']
        },
        pmu: {
            id: 'pmu',
            label: '💄 PMU (Permanent Makeup)',
            title: 'PMU (Permanent Makeup)',
            treatments: ['Eyebrow PMU (Microblading)', 'Lip PMU (Lip Blush)', 'Permanent Eyeliner', 'Beauty Spot'],
            promptEn: 'Which PMU treatment would you like to consult about?',
            questionEn: 'Which PMU area would you like to have treated?',
            questionOptions: ['Eyebrows', 'Lips', 'Eyes / Eyeliner', 'Beauty Spot']
        },
        smp: {
            id: 'smp',
            label: '🎨 SMP (Scalp Micropigmentation)',
            title: 'SMP (Scalp Micropigmentation)',
            treatments: ['Scalp Micropigmentation (SMP)', 'Stretch Mark Camouflage', 'Scar Camouflage'],
            promptEn: 'Which SMP treatment would you like to consult about?',
            questionEn: 'Which area would you like to have treated?',
            questionOptions: ['Scalp / Hairline', 'Stretch Marks', 'Scars / Vitiligo']
        }
    };

    function detectCategoryKey(text) {
        if (!text) return null;
        const norm = normalizeHinglish(text);
        if (norm.includes('skin') || norm.includes('acne') || norm.includes('facial') || norm.includes('botox')) return 'skin';
        if (norm.includes('pmu') || norm.includes('microblading') || norm.includes('lip blush')) return 'pmu';
        if (norm.includes('smp') || norm.includes('scalp micropigmentation')) return 'smp';
        if (norm.includes('weight') || norm.includes('fat')) return 'weight_loss';
        if (norm.includes('hair') || norm.includes('transplant') || norm.includes('prp')) return 'hair';
        return null;
    }

    function startConsultationFlow(prefilledCategory, prefilledTreatment, lang) {
        const catKey = prefilledCategory || 'hair';
        state.consultationFlow = {
            step: 'COLLECT_LOCATION',
            lang: lang || 'english',
            data: {
                patientLocation: state.patientLocation || null,
                category: catKey,
                treatment: prefilledTreatment || null,
                concernDetails: null,
                name: state.userName || null,
                age: state.userAge || null,
                selectedClinic: state.selectedClinic || null,
                date: null,
                time: null,
                phone: state.userPhone || null
            }
        };
        return advanceConsultationFlow('', lang || 'english');
    }

    async function handleConsultationFlow(userText, lang) {
        const flow = state.consultationFlow;
        const text = userText.trim();
        const lower = text.toLowerCase();

        if (flow.step === 'COLLECT_LOCATION') {
            const loc = validatePatientLocation(text);
            if (loc) { flow.data.patientLocation = loc; flow.step = 'COLLECT_NAME'; }
        } else if (flow.step === 'COLLECT_NAME') {
            const n = validateName(text);
            if (n) { flow.data.name = n; flow.step = 'COLLECT_AGE'; }
        } else if (flow.step === 'COLLECT_AGE') {
            const a = validateAge(text);
            if (a) { flow.data.age = a; flow.step = 'COLLECT_CLINIC'; }
        } else if (flow.step === 'COLLECT_CLINIC') {
            const c = validateClinic(text);
            if (c) { flow.data.selectedClinic = c; flow.step = 'COLLECT_DATE'; }
        } else if (flow.step === 'COLLECT_DATE') {
            const d = validateDate(text);
            if (d) { flow.data.date = d; flow.step = 'COLLECT_TIME'; }
        } else if (flow.step === 'COLLECT_TIME') {
            const t = validateTime(text);
            if (t) { flow.data.time = t; flow.step = 'COLLECT_PHONE'; }
        } else if (flow.step === 'COLLECT_PHONE') {
            const p = validatePhone(text);
            if (p) {
                flow.data.phone = p;
                flow.step = 'CONFIRM_DETAILS';
                return renderConfirmationStep(flow.data, lang);
            }
        } else if (flow.step === 'CONFIRM_DETAILS') {
            if (isConsultationConsentIntent(text)) {
                const finalData = Object.assign({}, flow.data);
                state.consultationFlow = null;
                return await submitConsultationAuto(finalData, lang);
            }
        }

        return advanceConsultationFlow(text, lang);
    }

    function advanceConsultationFlow(userText, lang) {
        const flow = state.consultationFlow;
        if (!flow.data.patientLocation) {
            flow.step = 'COLLECT_LOCATION';
            return { text: `Which city or area are you located in (e.g. Jaipur, Sikar, Delhi)?`, quickReplies: ['Jaipur', 'Sikar'] };
        }
        if (!flow.data.name) {
            flow.step = 'COLLECT_NAME';
            return { text: `Please enter your full name:`, quickReplies: [] };
        }
        if (!flow.data.age) {
            flow.step = 'COLLECT_AGE';
            return { text: `Please enter your age:`, quickReplies: [] };
        }
        if (!flow.data.selectedClinic) {
            flow.step = 'COLLECT_CLINIC';
            return { text: `Which Kezza clinic do you prefer?`, quickReplies: ['📍 Jaipur', '📍 Sikar'] };
        }
        if (!flow.data.date) {
            flow.step = 'COLLECT_DATE';
            return { text: `Preferred consultation date (e.g. Tomorrow, Weekend):`, quickReplies: ['Tomorrow', 'This Weekend'] };
        }
        if (!flow.data.time) {
            flow.step = 'COLLECT_TIME';
            return { text: `Preferred time (Clinic hours: 9:00 AM to 8:00 PM):`, quickReplies: ['Morning (11:00 AM)', 'Afternoon (2:00 PM)', 'Evening (5:00 PM)'] };
        }
        if (!flow.data.phone) {
            flow.step = 'COLLECT_PHONE';
            return { text: `Please enter your 10-digit WhatsApp number:`, quickReplies: [] };
        }
        flow.step = 'CONFIRM_DETAILS';
        return renderConfirmationStep(flow.data, lang);
    }

    function renderConfirmationStep(data, lang) {
        const summaryCard = `
<div class="kezza-appt-summary">
<strong>📋 Consultation Review:</strong><br><br>
👤 <strong>Name:</strong> ${escapeHtml(data.name || '')}<br>
🎂 <strong>Age:</strong> ${escapeHtml(String(data.age || ''))}<br>
📍 <strong>Location:</strong> ${escapeHtml(data.patientLocation || '')}<br>
🏥 <strong>Clinic:</strong> ${escapeHtml(data.selectedClinic || 'Jaipur')}<br>
🩺 <strong>Treatment:</strong> ${escapeHtml(data.treatment || 'Consultation')}<br>
📅 <strong>Date:</strong> ${escapeHtml(data.date || '')}<br>
🕐 <strong>Time:</strong> ${escapeHtml(data.time || '')}<br>
📱 <strong>WhatsApp:</strong> ${escapeHtml(data.phone || '')}
</div>`;

        return {
            text: `Please verify your consultation details:\n\n${summaryCard}`,
            quickReplies: ['✅ Yes, Submit Request', '✏️ Edit Details']
        };
    }

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';
        recognition.onstart = () => { state.isListening = true; updateMicUI(); };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            const input = document.getElementById('kezzaChatInput');
            if (input && transcript) {
                input.value = transcript;
                sendUserMessage();
            }
        };
        recognition.onerror = () => { state.isListening = false; updateMicUI(); };
        recognition.onend = () => { state.isListening = false; updateMicUI(); };
    }

    function toggleVoiceInput() {
        if (!recognition) return;
        if (state.isListening) recognition.stop();
        else {
            try { recognition.start(); } catch (e) { recognition.stop(); }
        }
    }

    function updateMicUI() {
        const micBtn = document.getElementById('kezzaChatMic');
        if (!micBtn) return;
        if (state.isListening) micBtn.classList.add('listening');
        else micBtn.classList.remove('listening');
    }

    function speakText(text) {
        if (!state.voiceEnabled || !synth) return;
        synth.cancel();
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/[^\w\s.,?!'\u0900-\u097F]/g, ' ');
        if (!cleanText.trim()) return;
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        synth.speak(utterance);
    }

    function toggleVoiceOutput() {
        state.voiceEnabled = !state.voiceEnabled;
        localStorage.setItem('kezza_voice_enabled', state.voiceEnabled);
        const speakerBtn = document.getElementById('kezzaSpeakerBtn');
        if (speakerBtn) {
            speakerBtn.classList.toggle('active', state.voiceEnabled);
            if (!state.voiceEnabled && synth) synth.cancel();
        }
    }

    async function callGeminiAPI(userText) {
        // Fallback to Express backend /api/chat
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history: state.chatHistory.slice(-3) })
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data.status === 'OK' && data.reply) {
                return {
                    text: data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'),
                    quickReplies: ['📅 Book Consultation', '📍 Clinic Locations', '💬 Enquiry']
                };
            }
        } catch (e) {}
        return null;
    }

    async function generateLocalResponse(userText) {
        const lang = detectLanguage(userText);
        const norm = normalizeHinglish(userText);
        const lower = userText.toLowerCase().trim();

        if (state.consultationFlow) {
            return await handleConsultationFlow(userText, lang);
        }

        if (norm.includes('jaipur')) return renderBranchDetails('jaipur', lang);
        if (norm.includes('sikar')) return renderBranchDetails('sikar', lang);
        if (norm.includes('location') || norm.includes('branch')) return renderLocationOverview(lang);

        const strictIntent = classifyStrictIntent(userText);
        if (strictIntent) {
            const tax = strictIntent.taxonomy;
            const routing = resolveConsultationRouting(tax.label);
            const btn = (routing.phone) ? `<a href="${getWhatsAppUrl(routing.phone, tax.defaultMsg)}" target="_blank" class="kezza-whatsapp-btn"><i class="fab fa-whatsapp"></i> Chat with ${routing.departmentName} (${routing.phone})</a>` : '';
            return {
                text: `<strong>${tax.label}</strong> Kezza Clinic ke under available hai.\n\n${btn}`,
                quickReplies: ['📅 Book Consultation', '📍 Clinic Locations']
            };
        }

        if (norm.includes('hair') || norm.includes('baal')) {
            return {
                text: `Kezza offers advanced Hair Restoration and Hair Fall therapies (PRP, GFC, FUE Transplant).`,
                quickReplies: ['Hair Transplant (HT)', 'PRP', 'GFC', '📅 Book Consultation']
            };
        }

        if (norm.includes('consultation') || norm.includes('appointment') || norm.includes('book')) {
            return startConsultationFlow(detectCategoryKey(userText), null, lang);
        }

        return {
            text: `Namaste! 👋 Main <strong>Kezza AI</strong> hoon. Aap treatments, clinic locations (Jaipur & Sikar), ya consultation booking ke baare mein pooch sakte hain.`,
            quickReplies: ['📅 Book Consultation', '📍 Clinic Locations', '💇 Hair Treatments', '✨ Skin Treatments']
        };
    }

    function createChatWidget() {
        if (document.getElementById('kezzaChatFab')) return;

        const fab = document.createElement('button');
        fab.className = 'kezza-chat-fab';
        fab.id = 'kezzaChatFab';
        fab.setAttribute('aria-label', 'Open Kezza AI Assistant');
        fab.innerHTML = `
            <svg class="chat-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
            <svg class="close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            <span class="kezza-chat-badge hidden" id="kezzaBadge">1</span>
        `;

        const win = document.createElement('div');
        win.className = 'kezza-chat-window';
        win.id = 'kezzaChatWindow';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', 'Kezza AI Chat Assistant Window');
        win.innerHTML = `
            <div class="kezza-chat-header">
                <div class="kezza-chat-avatar">🤖</div>
                <div class="kezza-chat-header-info">
                    <div class="kezza-chat-header-title">Kezza AI</div>
                    <div class="kezza-chat-header-status" id="kezzaHeaderStatus" aria-live="polite">
                        <span class="kezza-status-dot online"></span> <span>Online</span>
                    </div>
                </div>
                <div class="kezza-chat-header-actions">
                    <button class="kezza-header-btn ${state.voiceEnabled ? 'active' : ''}" id="kezzaSpeakerBtn" aria-label="Toggle voice output" title="Toggle voice speech">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="kezza-chat-minimize" id="kezzaChatMinimize" aria-label="Close Kezza AI chat window">✕</button>
                </div>
            </div>

            <div class="kezza-chat-messages" id="kezzaMessages" role="log" aria-live="polite"></div>

            <div class="kezza-chat-input-area">
                <button class="kezza-chat-mic" id="kezzaChatMic" aria-label="Voice input" title="Voice input (Speak in Hindi/English)">
                    <i class="fas fa-microphone"></i>
                </button>
                <input type="text" class="kezza-chat-input" id="kezzaChatInput" placeholder="Type in Hindi, Hinglish or English..." autocomplete="off" aria-label="Chat input message" />
                <button class="kezza-chat-send" id="kezzaChatSend" aria-label="Send message">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>

            <div class="kezza-chat-footer-bar">
                <span>Powered by Kezza AI</span>
            </div>
        `;

        const tooltip = document.createElement('div');
        tooltip.className = 'kezza-chat-tooltip hidden';
        tooltip.id = 'kezzaTooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.innerHTML = `
            👋 Ask Kezza AI! Need clinic info or consultation?
            <button class="kezza-chat-tooltip-close" id="kezzaTooltipClose" aria-label="Close suggestion bubble">✕</button>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(win);
        document.body.appendChild(tooltip);

        fab.addEventListener('click', toggleChat, { passive: true });
        document.getElementById('kezzaChatMinimize').addEventListener('click', closeChat, { passive: true });
        document.getElementById('kezzaChatSend').addEventListener('click', sendUserMessage);
        document.getElementById('kezzaChatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMessage(); });
        document.getElementById('kezzaChatMic').addEventListener('click', toggleVoiceInput, { passive: true });
        document.getElementById('kezzaSpeakerBtn').addEventListener('click', toggleVoiceOutput, { passive: true });

        document.getElementById('kezzaTooltipClose').addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.add('hidden');
            state.tooltipDismissed = true;
            localStorage.setItem('kezza_tooltip_dismissed', 'true');
        });
        tooltip.addEventListener('click', () => {
            tooltip.classList.add('hidden');
            state.tooltipDismissed = true;
            localStorage.setItem('kezza_tooltip_dismissed', 'true');
            openChat();
        });

        updateBusinessHoursHeaderStatus();
        initSpeechRecognition();
    }

    function toggleChat() {
        if (state.isOpen) closeChat();
        else openChat();
    }

    function openChat() {
        state.isOpen = true;
        const fab = document.getElementById('kezzaChatFab');
        const win = document.getElementById('kezzaChatWindow');
        if (fab) fab.classList.add('open');
        if (win) win.classList.add('open');

        const tip = document.getElementById('kezzaTooltip');
        const badge = document.getElementById('kezzaBadge');
        if (tip) tip.classList.add('hidden');
        if (badge) badge.classList.add('hidden');

        state.tooltipDismissed = true;
        localStorage.setItem('kezza_tooltip_dismissed', 'true');

        updateBusinessHoursHeaderStatus();

        if (!state.hasGreeted) {
            state.hasGreeted = true;
            const resp = getGreetingResponse('english');
            addBotMessage(resp.text, resp.quickReplies);
            speakText(resp.text);
        }
        setTimeout(() => {
            const input = document.getElementById('kezzaChatInput');
            if (input) input.focus();
        }, 80);
    }

    function closeChat() {
        state.isOpen = false;
        const fab = document.getElementById('kezzaChatFab');
        const win = document.getElementById('kezzaChatWindow');
        if (fab) fab.classList.remove('open');
        if (win) win.classList.remove('open');
        if (synth) synth.cancel();
    }

    async function sendUserMessage() {
        const input = document.getElementById('kezzaChatInput');
        const sendBtn = document.getElementById('kezzaChatSend');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        if (input) input.value = '';
        addUserMessage(text);
        state.chatHistory.push({ role: 'user', text });

        showTypingIndicator();
        try {
            let resp = await generateLocalResponse(text);
            if (!resp) resp = await callGeminiAPI(text);
            removeTypingIndicator();
            if (resp && resp.text) {
                addBotMessage(resp.text, resp.quickReplies);
                state.chatHistory.push({ role: 'model', text: resp.text });
                speakText(resp.text);
            }
        } catch (e) {
            removeTypingIndicator();
            addBotMessage(`Namaste! How may I assist you today?`, ['📅 Book Consultation', '📍 Clinic Locations']);
        }
    }

    function handleQuickReply(text) {
        const input = document.getElementById('kezzaChatInput');
        if (input) input.value = text;
        sendUserMessage();
    }

    function addUserMessage(text) {
        const container = document.getElementById('kezzaMessages');
        if (!container) return;
        const msg = document.createElement('div');
        msg.className = 'kezza-msg user';
        msg.innerHTML = `
            <div class="kezza-msg-avatar">👤</div>
            <div class="kezza-msg-bubble">${escapeHtml(text)}</div>
        `;
        container.appendChild(msg);
        scrollToBottom();
    }

    function addBotMessage(html, quickReplies) {
        const container = document.getElementById('kezzaMessages');
        if (!container) return;
        const msg = document.createElement('div');
        msg.className = 'kezza-msg bot';
        msg.innerHTML = `
            <div class="kezza-msg-avatar">🤖</div>
            <div class="kezza-msg-bubble">${html.replace(/\n/g, '<br>')}</div>
        `;
        container.appendChild(msg);

        if (quickReplies && quickReplies.length > 0) {
            const qrContainer = document.createElement('div');
            qrContainer.className = 'kezza-quick-replies';
            quickReplies.forEach(qr => {
                const btn = document.createElement('button');
                btn.className = 'kezza-quick-btn';
                btn.textContent = qr;
                btn.addEventListener('click', () => {
                    qrContainer.remove();
                    handleQuickReply(qr);
                });
                qrContainer.appendChild(btn);
            });
            container.appendChild(qrContainer);
        }
        scrollToBottom();
    }

    function showTypingIndicator() {
        const container = document.getElementById('kezzaMessages');
        if (!container) return;
        const typing = document.createElement('div');
        typing.className = 'kezza-typing';
        typing.id = 'kezzaTyping';
        typing.innerHTML = `
            <div class="kezza-msg-avatar">🤖</div>
            <div class="kezza-typing-dots">
                <div class="kezza-typing-dot"></div>
                <div class="kezza-typing-dot"></div>
                <div class="kezza-typing-dot"></div>
            </div>
        `;
        container.appendChild(typing);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('kezzaTyping');
        if (el) el.remove();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            const container = document.getElementById('kezzaMessages');
            if (container) container.scrollTop = container.scrollHeight;
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Expose globally
    if (typeof window !== 'undefined') {
        window.KezzaChatbot = {
            open: openChat,
            close: closeChat,
            toggle: toggleChat,
            send: (txt) => { openChat(); const inp = document.getElementById('kezzaChatInput'); if (inp) { inp.value = txt; sendUserMessage(); } },
            getState: () => state
        };
        window.Chatbot = window.KezzaChatbot;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createChatWidget, { once: true });
        } else {
            createChatWidget();
        }
    }
})();
