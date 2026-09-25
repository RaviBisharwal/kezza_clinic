/**
 * Kezza Clinic — Upgraded Consultation Request Form Handler
 * Handles validation, dependent department->treatment dropdowns, specialist hint,
 * IST date restrictions, dual-dispatch (local server / direct Apps Script webhook),
 * thank-you card replacement, and Meta Pixel Lead event tracking.
 */
(function() {
    'use strict';

    // ── CONFIGURATION & MAPPINGS ───────────────────────────────────────
    const DEPARTMENT_TREATMENTS = {
        'Hair Transplant': [
            'Hair Transplant',
            'PRP Therapy',
            'GFC Therapy',
            'White Hair Removal',
            'Electrolysis',
            'Hair Wig',
            'Hair Loss Treatment'
        ],
        'Skin': [
            'Botox',
            'Acne & Acne Scar',
            'Dark Circle Treatment',
            'Laser Treatments',
            'Anti-Aging',
            'Glutathione Therapy',
            'Medical Facial',
            'Skin Consultation'
        ],
        'Weight Loss': [
            'Non-Surgical Weight Loss',
            'Body Sculpting (Cryolipolysis)',
            'Clinical Fat Reduction',
            'Weight Management Consultation'
        ],
        'PMU': [
            'Eyebrow PMU',
            'Lip PMU',
            'Permanent Eyeliner',
            'PMU Consultation'
        ]
    };

    const SPECIALIST_MAP = {
        'Jaipur': {
            'Hair Transplant': 'Dr. Ankit Bhalothia',
            'Skin': 'Dr. Amrita Mukhija',
            'Weight Loss': 'Dr. Amrita Mukhija',
            'PMU': 'Krishna'
        },
        'Sikar': {
            'Hair Transplant': 'Dr. Ankit Bhalothia',
            'Skin': 'Dr. Amrita Mukhija',
            'Weight Loss': 'Kezza Wellness & Slimming Team',
            'PMU': 'Krishna'
        },
        'Ajmer': {
            'Hair Transplant': 'Dr. Dhiral Vijayvargiya',
            'Skin': 'Dr. Aliza Rizvi',
            'Weight Loss': 'To be assigned',
            'PMU': 'To be assigned'
        }
    };

    const CLINIC_WHATSAPP = {
        'Jaipur': '919284517427',
        'Sikar':  '918130888129',
        'Ajmer':  '919216088257'
    };

    const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec';

    // ── UTILITY HELPERS ────────────────────────────────────────────────
    function getTodayIST() {
        try {
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            return formatter.format(new Date()); // YYYY-MM-DD
        } catch (e) {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }

    function formatSheetDate(isoDateStr) {
        if (!isoDateStr) return '';
        const parts = isoDateStr.split('-');
        if (parts.length !== 3) return isoDateStr;
        const y = parts[0];
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayStr = d < 10 ? '0' + d : String(d);
        return `${dayStr} ${months[m] || 'Sep'} ${y}`;
    }

    function normalizeWhatsApp(val) {
        if (!val) return '';
        let digits = String(val).replace(/[\s\-\+]/g, '').replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) {
            digits = digits.slice(2);
        } else if (digits.length === 11 && digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        return digits;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ── MAIN INITIALIZATION ────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Elements
        const nameInput      = document.getElementById('fullName');
        const phoneInput     = document.getElementById('whatsapp');
        const ageInput       = document.getElementById('age');
        const locationInput  = document.getElementById('location');
        const clinicSelect   = document.getElementById('clinic');
        const deptSelect     = document.getElementById('department');
        const treatSelect    = document.getElementById('treatment');
        const dateInput      = document.getElementById('preferredDate');
        const timeSelect     = document.getElementById('preferredTime');
        const durationSelect = document.getElementById('duration');
        const messageInput   = document.getElementById('message');
        const honeypotInput  = document.getElementById('kz_hp');
        const submitBtn      = document.getElementById('submitBtn');

        const specialistHint = document.getElementById('specialistHint');
        const specialistName = document.getElementById('specialistName');

        // Set min date in IST
        const todayIST = getTodayIST();
        if (dateInput) {
            dateInput.min = todayIST;
        }

        // WhatsApp number real-time typing filter (digits only, max 10)
        if (phoneInput) {
            phoneInput.setAttribute('maxlength', '15'); // allow pasting with +91 or spaces before cleanup
            phoneInput.addEventListener('input', function() {
                // Remove non-digit characters
                const cleaned = this.value.replace(/[^\d\+\s\-]/g, '');
                if (cleaned !== this.value) {
                    this.value = cleaned;
                }
            });

            phoneInput.addEventListener('blur', function() {
                const norm = normalizeWhatsApp(this.value);
                if (norm.length === 10) {
                    this.value = norm;
                }
                validateField('whatsapp');
            });
        }

        // ── DYNAMIC DEPARTMENT -> TREATMENT POPULATION ─────────────────
        function updateTreatments() {
            const selectedDept = deptSelect ? deptSelect.value : '';
            if (!treatSelect) return;

            treatSelect.innerHTML = '';

            if (!selectedDept || !DEPARTMENT_TREATMENTS[selectedDept]) {
                treatSelect.disabled = true;
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'Select department first';
                treatSelect.appendChild(opt);
            } else {
                treatSelect.disabled = false;
                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Select treatment...';
                treatSelect.appendChild(placeholder);

                DEPARTMENT_TREATMENTS[selectedDept].forEach(treatment => {
                    const opt = document.createElement('option');
                    opt.value = treatment;
                    opt.textContent = treatment;
                    treatSelect.appendChild(opt);
                });
            }

            updateSpecialistHint();
        }

        // ── DYNAMIC SPECIALIST HINT ────────────────────────────────────
        function updateSpecialistHint() {
            if (!specialistHint || !specialistName) return;

            const clinic = clinicSelect ? clinicSelect.value : '';
            const dept   = deptSelect   ? deptSelect.value   : '';

            if (clinic && dept && SPECIALIST_MAP[clinic] && SPECIALIST_MAP[clinic][dept]) {
                const doc = SPECIALIST_MAP[clinic][dept];
                if (doc && doc !== 'To be assigned') {
                    specialistName.textContent = doc;
                    specialistHint.style.display = 'flex';
                    return;
                }
            }
            specialistHint.style.display = 'none';
            specialistName.textContent = '';
        }

        if (deptSelect) {
            deptSelect.addEventListener('change', function() {
                updateTreatments();
                validateField('department');
                validateField('treatment');
            });
        }

        if (clinicSelect) {
            clinicSelect.addEventListener('change', function() {
                updateSpecialistHint();
                validateField('clinic');
            });
        }

        if (treatSelect) {
            treatSelect.addEventListener('change', function() {
                validateField('treatment');
            });
        }

        // ── FIELD VALIDATION RULES ─────────────────────────────────────
        function setFieldError(fieldId, errorMsg) {
            const errSpan = document.getElementById(`err-${fieldId}`);
            const wrapEl  = document.getElementById(`wrap-${fieldId}`);
            if (errSpan) {
                errSpan.textContent = errorMsg;
                errSpan.style.display = errorMsg ? 'block' : 'none';
            }
            if (wrapEl) {
                if (errorMsg) {
                    wrapEl.classList.add('has-error');
                } else {
                    wrapEl.classList.remove('has-error');
                }
            }
        }

        function validateField(fieldId) {
            let isValid = true;
            let errorMsg = '';

            switch (fieldId) {
                case 'name': {
                    const val = (nameInput ? nameInput.value : '').trim();
                    // 2–60 characters; letters (Hindi unicode allowed), spaces and dots; no digits
                    const nameRegex = /^[A-Za-z\u0900-\u097F\s.]{2,60}$/;
                    if (!val) {
                        errorMsg = 'Please enter your full name';
                        isValid = false;
                    } else if (/\d/.test(val)) {
                        errorMsg = 'Name cannot contain numbers';
                        isValid = false;
                    } else if (!nameRegex.test(val)) {
                        errorMsg = 'Please enter your full name (2–60 letters)';
                        isValid = false;
                    }
                    break;
                }

                case 'whatsapp': {
                    const rawVal = phoneInput ? phoneInput.value : '';
                    const clean = normalizeWhatsApp(rawVal);
                    if (!clean) {
                        errorMsg = 'Please enter a valid 10-digit WhatsApp number';
                        isValid = false;
                    } else if (clean.length < 10) {
                        errorMsg = 'Please enter a valid 10-digit WhatsApp number';
                        isValid = false;
                    } else if (clean.length > 10) {
                        errorMsg = 'Please enter a valid 10-digit WhatsApp number';
                        isValid = false;
                    } else if (!/^[6-9]\d{9}$/.test(clean)) {
                        errorMsg = 'Number must start with 6, 7, 8 or 9';
                        isValid = false;
                    }
                    break;
                }

                case 'age': {
                    const val = ageInput ? ageInput.value.trim() : '';
                    const num = parseInt(val, 10);
                    if (!val) {
                        errorMsg = 'Please enter your age (10–90)';
                        isValid = false;
                    } else if (isNaN(num) || num < 10 || num > 90) {
                        errorMsg = 'Please enter your age (10–90)';
                        isValid = false;
                    }
                    break;
                }

                case 'location': {
                    const val = (locationInput ? locationInput.value : '').trim();
                    if (!val || val.length < 2 || val.length > 50) {
                        errorMsg = 'Please enter your city (2–50 characters)';
                        isValid = false;
                    }
                    break;
                }

                case 'clinic': {
                    const val = clinicSelect ? clinicSelect.value : '';
                    if (!val || !['Jaipur', 'Sikar', 'Ajmer'].includes(val)) {
                        errorMsg = 'Please choose a clinic';
                        isValid = false;
                    }
                    break;
                }

                case 'department': {
                    const val = deptSelect ? deptSelect.value : '';
                    if (!val || !DEPARTMENT_TREATMENTS[val]) {
                        errorMsg = 'Please select a department';
                        isValid = false;
                    }
                    break;
                }

                case 'treatment': {
                    const deptVal = deptSelect ? deptSelect.value : '';
                    const treatVal = treatSelect ? treatSelect.value : '';
                    if (!deptVal) {
                        errorMsg = 'Please select department first';
                        isValid = false;
                    } else if (!treatVal || !DEPARTMENT_TREATMENTS[deptVal] || !DEPARTMENT_TREATMENTS[deptVal].includes(treatVal)) {
                        errorMsg = 'Please select a treatment';
                        isValid = false;
                    }
                    break;
                }

                case 'preferredDate': {
                    const val = dateInput ? dateInput.value.trim() : '';
                    if (!val) {
                        errorMsg = 'Please choose today or a later date';
                        isValid = false;
                    } else {
                        // Compare YYYY-MM-DD strings directly (valid ISO 8601 comparison)
                        const currentIST = getTodayIST();
                        if (val < currentIST) {
                            errorMsg = 'Please choose today or a later date';
                            isValid = false;
                        }
                    }
                    break;
                }

                case 'preferredTime': {
                    const val = timeSelect ? timeSelect.value : '';
                    if (!val) {
                        errorMsg = 'Please choose a time slot';
                        isValid = false;
                    }
                    break;
                }
            }

            setFieldError(fieldId, errorMsg);
            return isValid;
        }

        // Attach blur listeners
        const blurFields = [
            { id: 'name', el: nameInput },
            { id: 'age', el: ageInput },
            { id: 'location', el: locationInput },
            { id: 'clinic', el: clinicSelect },
            { id: 'department', el: deptSelect },
            { id: 'treatment', el: treatSelect },
            { id: 'preferredDate', el: dateInput },
            { id: 'preferredTime', el: timeSelect }
        ];

        blurFields.forEach(item => {
            if (item.el) {
                item.el.addEventListener('blur', function() {
                    validateField(item.id);
                });
            }
        });

        // ── FORM SUBMISSION ────────────────────────────────────────────
        let isSubmitting = false;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Prevent double submission
            if (isSubmitting) return;

            // Remove any existing global error banner
            const existingGlobalErr = contactForm.querySelector('.cty-global-error');
            if (existingGlobalErr) existingGlobalErr.remove();

            // Validate all fields
            const fieldsToValidate = [
                { id: 'name', el: nameInput },
                { id: 'whatsapp', el: phoneInput },
                { id: 'age', el: ageInput },
                { id: 'location', el: locationInput },
                { id: 'clinic', el: clinicSelect },
                { id: 'department', el: deptSelect },
                { id: 'treatment', el: treatSelect },
                { id: 'preferredDate', el: dateInput },
                { id: 'preferredTime', el: timeSelect }
            ];

            let firstInvalidEl = null;
            let allValid = true;

            fieldsToValidate.forEach(item => {
                const valid = validateField(item.id);
                if (!valid) {
                    allValid = false;
                    if (!firstInvalidEl && item.el) {
                        firstInvalidEl = item.el;
                    }
                }
            });

            if (!allValid) {
                if (firstInvalidEl) {
                    firstInvalidEl.focus();
                    const wrap = firstInvalidEl.closest('.form-group');
                    if (wrap) {
                        wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return;
            }

            // Check honeypot
            const honeypotVal = honeypotInput ? honeypotInput.value.trim() : '';
            if (honeypotVal !== '') {
                // Silently succeed for bots
                showThankYouCard({
                    name: nameInput ? nameInput.value.trim() : 'Patient',
                    clinic: clinicSelect ? clinicSelect.value : 'Jaipur',
                    treatment: treatSelect ? treatSelect.value : 'Consultation',
                    leadId: `KEZZA-${new Date().getFullYear()}-4102`
                }, false);
                return;
            }

            // Extract values
            const nameVal      = nameInput.value.trim();
            const cleanPhone   = normalizeWhatsApp(phoneInput.value);
            const ageVal       = parseInt(ageInput.value.trim(), 10);
            const locationVal  = locationInput.value.trim();
            const clinicVal    = clinicSelect.value;
            const deptVal      = deptSelect.value;
            const treatmentVal = treatSelect.value;
            const rawDateVal   = dateInput.value.trim();
            const sheetDate    = formatSheetDate(rawDateVal);
            const timeVal      = timeSelect.value;
            const durationVal  = durationSelect ? durationSelect.value : '';
            const messageVal   = messageInput ? messageInput.value.trim() : '';

            // Specialist resolution
            let specialist = 'To be assigned';
            if (SPECIALIST_MAP[clinicVal] && SPECIALIST_MAP[clinicVal][deptVal]) {
                specialist = SPECIALIST_MAP[clinicVal][deptVal];
            }

            // Concern / Duration column formatting
            let concernDuration = '';
            if (durationVal && messageVal) {
                concernDuration = `Duration: ${durationVal}. ${messageVal}`;
            } else if (durationVal) {
                concernDuration = `Duration: ${durationVal}`;
            } else if (messageVal) {
                concernDuration = messageVal;
            }

            // Generate client-side Lead ID fallback
            const currentYear = new Date().getFullYear();
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const clientLeadId = `KEZZA-${currentYear}-${randomDigits}`;

            // Build payload matching exact specifications (Section 7 & 8)
            const payload = {
                source: 'Contact Us Form',
                Source: 'Contact Us Form',
                'Source': 'Contact Us Form',
                leadId: clientLeadId,
                consultationId: clientLeadId,
                'Lead ID': clientLeadId,
                timestamp: new Date().toISOString(),
                name: nameVal,
                Name: nameVal,
                'Name': nameVal,
                whatsapp: cleanPhone,
                phone: cleanPhone,
                'WhatsApp': cleanPhone,
                age: ageVal,
                Age: ageVal,
                'Age': ageVal,
                location: locationVal,
                patientLocation: locationVal,
                'Patient Location': locationVal,
                clinic: clinicVal,
                Clinic: clinicVal,
                'Clinic': clinicVal,
                department: deptVal,
                Department: deptVal,
                'Department': deptVal,
                category: deptVal,
                Category: deptVal,
                'Category': deptVal,
                treatment: treatmentVal,
                Treatment: treatmentVal,
                'Treatment': treatmentVal,
                specialist: specialist,
                Specialist: specialist,
                'Specialist': specialist,
                duration: durationVal,
                message: messageVal,
                concern: concernDuration,
                Concern: concernDuration,
                'Concern / Duration': concernDuration,
                'concern / duration': concernDuration,
                'Concern/Duration': concernDuration,
                preferredDate: sheetDate,
                'Preferred Date': sheetDate,
                preferredTime: timeVal,
                'Preferred Time': timeVal,
                status: 'New',
                Status: 'New',
                'Status': 'New',
                kz_hp: ''
            };

            // Enter loading state
            isSubmitting = true;
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-spinner"></span><span>Booking…</span>';

            // Timeout controller (20 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            let syncSuccess = false;
            let returnedLeadId = clientLeadId;

            try {
                // Determine API endpoint
                const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const apiBase = isLocal && window.location.port !== '3001' ? 'http://localhost:3001' : '';

                let serverHandled = false;

                // 1. Try local/Express backend if present
                try {
                    const apiRes = await fetch(`${apiBase}/api/lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    if (apiRes.ok) {
                        const resData = await apiRes.json().catch(() => ({}));
                        if (resData && (resData.leadId || resData.id)) {
                            returnedLeadId = resData.leadId || resData.id;
                        }
                        serverHandled = true;
                        syncSuccess = true;
                    }
                } catch (apiErr) {
                    // Backend not reachable, fall through to direct Google Sheets webhook
                    serverHandled = false;
                }

                // 2. Direct Google Sheets Webhook fallback (cPanel static hosting)
                if (!serverHandled) {
                    const sheetRes = await fetch(SHEET_WEBHOOK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });
                    // In no-cors mode, sheetRes.ok is false, type is 'opaque', but write succeeds!
                    syncSuccess = true;
                }

                clearTimeout(timeoutId);

            } catch (err) {
                clearTimeout(timeoutId);
                console.error('[Kezza Consultation Lead Submit Error]:', err);
                syncSuccess = false;
            }

            if (syncSuccess) {
                // Track Meta Pixel Lead event
                try {
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead', {
                            content_name: treatmentVal,
                            content_category: deptVal
                        });
                    }
                } catch (pxErr) {
                    console.warn('[Meta Pixel Warning]:', pxErr);
                }

                // Show Thank-You Card
                showThankYouCard({
                    name: nameVal,
                    clinic: clinicVal,
                    treatment: treatmentVal,
                    leadId: returnedLeadId
                }, true);

            } else {
                // Failure: restore button, preserve inputs, show inline error banner
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                const clinicWa = CLINIC_WHATSAPP[clinicVal] || '919284517427';
                const waFailUrl = `https://wa.me/${clinicWa}?text=${encodeURIComponent('Hello Kezza Clinic ' + clinicVal + ', I attempted to book a consultation for ' + treatmentVal + ' on your website.')}`;

                const errBanner = document.createElement('div');
                errBanner.className = 'cty-global-error';
                errBanner.setAttribute('role', 'alert');
                errBanner.innerHTML = `
                    <span>⚠ Something went wrong while saving your request. Please try again, or connect directly on WhatsApp:</span>
                    <a href="${waFailUrl}" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp"></i> Message Us on WhatsApp
                    </a>
                `;
                submitBtn.parentNode.insertBefore(errBanner, submitBtn);
                errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // ── THANK-YOU CARD DISPLAY ─────────────────────────────────────
        function showThankYouCard(lead, sendWhatsAppChat) {
            const formCard = contactForm.closest('.form-card');
            if (!formCard) return;

            const clinicPhone = CLINIC_WHATSAPP[lead.clinic] || '919284517427';
            const waChatMsg = `Hello Kezza Clinic ${lead.clinic}, I have booked a consultation for ${lead.treatment} on your website. My Reference ID is ${lead.leadId}.`;
            const waChatUrl = `https://wa.me/${clinicPhone}?text=${encodeURIComponent(waChatMsg)}`;

            // Save original form card HTML for "Book another consultation" link
            const originalCardContent = formCard.innerHTML;

            formCard.innerHTML = `
                <div class="consultation-thank-you-card" role="status" aria-live="polite">
                    <div class="cty-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3 class="cty-title">Thank you, ${escapeHtml(lead.name)}!</h3>
                    <p class="cty-message">
                        Your consultation request has been received. Our <strong>${escapeHtml(lead.clinic)}</strong> team will review your inquiry and connect with you on WhatsApp shortly.
                    </p>
                    <div class="cty-ref-box">
                        <i class="fas fa-receipt"></i> Reference: <strong>${escapeHtml(lead.leadId)}</strong>
                    </div>
                    <div class="cty-actions">
                        <a href="${waChatUrl}" target="_blank" rel="noopener noreferrer" class="cty-btn-wa">
                            <i class="fab fa-whatsapp"></i> Chat on WhatsApp (${escapeHtml(lead.clinic)})
                        </a>
                        <button type="button" class="cty-btn-reset" id="btnBookAnother">
                            ← Book another consultation
                        </button>
                    </div>
                </div>
            `;

            formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Restore form upon clicking "Book another consultation"
            const resetBtn = document.getElementById('btnBookAnother');
            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    formCard.innerHTML = originalCardContent;
                    // Re-run initialization to re-bind form events
                    window.location.reload();
                });
            }
        }
    });
})();
