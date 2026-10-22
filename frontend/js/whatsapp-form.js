/**
 * Kezza Clinic — Upgraded High-Converting Consultation Request Form Handler
 * Professional Medical Booking Funnel with Dynamic Sub-Categories:
 * 1. Full Name (Required)
 * 2. WhatsApp Number (Required, validated 10-digit Indian mobile)
 * 3. City / Location (Required dropdown: Jaipur, Sikar, Ajmer, Other)
 * 4. Treatment Category (Required dropdown: Hair, Skin, Weight Loss, Permanent Makeup, Aesthetic Treatments, Other)
 * 5. Specific Procedure / Sub-Category (Required dynamic dropdown + 1-tap quick pills)
 * 6. Preferred Time Slot (Optional convenience selector: Morning, Afternoon, Evening, Weekend, Any Time)
 * 
 * Features:
 * - Real-time dependent sub-category generation with clinical accuracy
 * - Interactive 1-tap quick pills for high mobile conversion
 * - Real-time phone normalization & validation
 * - Instant inline error feedback with smooth focus
 * - Dual dispatch: local/Express backend (/api/lead) with fallback to Google Sheets webhook
 * - Meta Pixel Lead tracking with procedure context
 * - Elegant Thank-You card with clinic-specific WhatsApp pre-filled chat link
 */
(function() {
    'use strict';

    const CLINIC_WHATSAPP = {
        'Jaipur': '919284517427',
        'Sikar':  '918130888129',
        'Ajmer':  '919216088257'
    };

    const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec';

    // ── SUB-CATEGORIES CLINICAL TAXONOMY ───────────────────────────────
    const SUB_CATEGORIES = {
        'Hair': {
            badge: 'Hair Restoration',
            doctor: 'Senior Hair Restoration Surgeon & Trichologist',
            procedures: [
                { id: 'FUE Hair Transplant', name: 'FUE Hair Transplant', icon: 'fa-user-md', popular: true },
                { id: 'DHI Hair Transplant', name: 'DHI Hair Transplant', icon: 'fa-feather-alt', popular: true },
                { id: 'GFC Hair Loss Therapy', name: 'GFC Therapy (Growth Factor)', icon: 'fa-vial', popular: true },
                { id: 'PRP Hair Loss Therapy', name: 'PRP Hair Loss Therapy', icon: 'fa-syringe', popular: true },
                { id: 'White Hair Removal (Electrolysis)', name: 'White Hair Removal (Electrolysis)', icon: 'fa-bolt', popular: true },
                { id: 'Beard / Mustache Transplant', name: 'Beard & Mustache Transplant', icon: 'fa-user', popular: true },
                { id: 'Eyebrow Hair Transplant', name: 'Eyebrow Restoration', icon: 'fa-eye', popular: false },
                { id: 'Trichoscopy & Hair Assessment', name: 'Trichoscopy & Scalp Assessment', icon: 'fa-microscope', popular: false },
                { id: 'Non-Surgical Hair Patch / Wig', name: 'Hair Patch / System', icon: 'fa-cut', popular: false },
                { id: 'Other Hair Concern', name: 'Other Hair Concern', icon: 'fa-comment-medical', popular: false }
            ]
        },
        'Skin': {
            badge: 'Clinical Dermatology',
            doctor: 'Senior Certified Dermatologist & Laser Specialist',
            procedures: [
                { id: 'Acne Scar Revision (Laser/Subcision)', name: 'Acne Scar Revision', icon: 'fa-magic', popular: true },
                { id: 'Active Acne & Breakouts Treatment', name: 'Acne & Breakouts', icon: 'fa-shield-virus', popular: true },
                { id: 'Pigmentation & Melasma (Laser Toning)', name: 'Pigmentation & Melasma', icon: 'fa-sun', popular: true },
                { id: 'HydraFacial & Medical Glow Facial', name: 'HydraFacial & Medi-Facial', icon: 'fa-water', popular: true },
                { id: 'Laser Hair Removal (Triple Wavelength)', name: 'Laser Hair Removal', icon: 'fa-bolt', popular: true },
                { id: 'Dark Circles & Under-Eye Care', name: 'Dark Circles Care', icon: 'fa-eye', popular: true },
                { id: 'Chemical Peels & Skin Brightening', name: 'Chemical Peels', icon: 'fa-sparkles', popular: false },
                { id: 'Stretch Marks Revision', name: 'Stretch Marks Revision', icon: 'fa-band-aid', popular: false },
                { id: 'Medical Dermatology (Eczema / Psoriasis)', name: 'Medical Dermatology', icon: 'fa-stethoscope', popular: false },
                { id: 'Other Skin Concern', name: 'Other Skin Concern', icon: 'fa-comment-medical', popular: false }
            ]
        },
        'Weight Loss': {
            badge: 'Body Contouring',
            doctor: 'Clinical Body Sculpting Specialist & Nutritionist',
            procedures: [
                { id: 'Cryolipolysis (360° Fat Freezing)', name: '360° Fat Freezing', icon: 'fa-snowflake', popular: true },
                { id: 'HIFU Non-Surgical Body Sculpting', name: 'HIFU Body Sculpting', icon: 'fa-wave-square', popular: true },
                { id: 'Inch Loss & Tummy Tightening', name: 'Inch Loss & Tummy Tightening', icon: 'fa-compress-arrows-alt', popular: true },
                { id: 'Double Chin Reduction', name: 'Double Chin Reduction', icon: 'fa-smile', popular: true },
                { id: 'Medical Weight Loss Protocol', name: 'Medical Weight Loss Protocol', icon: 'fa-weight', popular: false },
                { id: 'Other Body Sculpting Concern', name: 'Other Body Concern', icon: 'fa-comment-medical', popular: false }
            ]
        },
        'Permanent Makeup': {
            badge: 'Micropigmentation',
            doctor: 'Master PMU Artist & Certified Aesthetician',
            procedures: [
                { id: 'Microblading Eyebrows (Natural 3D)', name: 'Microblading Eyebrows', icon: 'fa-paint-brush', popular: true },
                { id: 'Lip Blush & Micropigmentation', name: 'Lip Blush / Tinting', icon: 'fa-heart', popular: true },
                { id: 'Ombre Powder Brows', name: 'Ombre Powder Brows', icon: 'fa-feather', popular: true },
                { id: 'Scalp Micropigmentation (SMP)', name: 'Scalp SMP (Hair Density)', icon: 'fa-dot-circle', popular: true },
                { id: 'Permanent Eyeliner', name: 'Permanent Eyeliner', icon: 'fa-eye', popular: false },
                { id: 'PMU Laser Correction & Removal', name: 'PMU Correction / Removal', icon: 'fa-eraser', popular: false },
                { id: 'Other PMU Treatment', name: 'Other PMU Treatment', icon: 'fa-comment-medical', popular: false }
            ]
        },
        'Aesthetic Treatments': {
            badge: 'Facial Aesthetics',
            doctor: 'Senior Facial Aesthetic & Anti-Aging Doctor',
            procedures: [
                { id: 'Botox Anti-Wrinkle Injections', name: 'Botox Anti-Wrinkle', icon: 'fa-syringe', popular: true },
                { id: 'Dermal Fillers (Lips / Cheeks / Jawline)', name: 'Dermal Fillers (Lips/Cheeks)', icon: 'fa-gem', popular: true },
                { id: 'Skin Boosters & Profhilo', name: 'Skin Boosters (Profhilo)', icon: 'fa-tint', popular: true },
                { id: 'Anti-Aging Rejuvenation', name: 'Anti-Aging Rejuvenation', icon: 'fa-history', popular: true },
                { id: 'Facial Contouring & Profile Balancing', name: 'Facial Contouring', icon: 'fa-smile-beam', popular: false },
                { id: 'Other Aesthetic Concern', name: 'Other Aesthetic Concern', icon: 'fa-comment-medical', popular: false }
            ]
        },
        'Other': {
            badge: 'General Consultation',
            doctor: 'Senior Clinical Consultant Doctor',
            procedures: [
                { id: 'Doctor Consultation & Evaluation', name: 'Doctor Consultation', icon: 'fa-user-md', popular: true },
                { id: 'Comprehensive Assessment / Second Opinion', name: 'Second Opinion Assessment', icon: 'fa-clipboard-check', popular: true },
                { id: 'Not Sure - Need Expert Guidance', name: 'Not Sure — Need Guidance', icon: 'fa-question-circle', popular: true }
            ]
        }
    };

    // ── UTILITY HELPERS ────────────────────────────────────────────────
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
        const nameInput           = document.getElementById('fullName');
        const phoneInput          = document.getElementById('whatsapp');
        const locationSelect      = document.getElementById('location');
        const concernSelect       = document.getElementById('concern');
        const subConcernSelect    = document.getElementById('subConcern');
        const preferredSlotSelect = document.getElementById('preferredSlot');
        const subCategoryBadge    = document.getElementById('subCategoryBadge');
        const quickPillsWrap      = document.getElementById('quickPillsWrap');
        const subCategoryPills    = document.getElementById('subCategoryPills');
        const specialistAssignedTag = document.getElementById('specialistAssignedTag');
        const satDoctorName       = document.getElementById('satDoctorName');
        const honeypotInput       = document.getElementById('kz_hp');
        const submitBtn           = document.getElementById('submitBtn');

        // WhatsApp number real-time typing filter: STRICT 10-DIGIT NUMERIC LIMIT
        if (phoneInput) {
            phoneInput.setAttribute('maxlength', '10');
            phoneInput.setAttribute('pattern', '[6-9][0-9]{9}');
            phoneInput.addEventListener('input', function() {
                // Remove all non-digit characters
                let cleaned = this.value.replace(/\D/g, '');
                // Handle pasting with country code e.g. +91 9876543210 or 09876543210
                if (cleaned.length === 12 && cleaned.startsWith('91')) {
                    cleaned = cleaned.slice(2);
                } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
                    cleaned = cleaned.slice(1);
                }
                // Hard limit to exactly 10 digits maximum
                if (cleaned.length > 10) {
                    cleaned = cleaned.slice(0, 10);
                }
                if (this.value !== cleaned) {
                    this.value = cleaned;
                }
                // When user reaches 10 digits, validate immediately
                if (cleaned.length === 10) {
                    validateField('whatsapp');
                } else if (cleaned.length === 0) {
                    setFieldError('whatsapp', '');
                }
            });

            phoneInput.addEventListener('blur', function() {
                validateField('whatsapp');
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
                    const nameRegex = /^[A-Za-z\u0900-\u097F\s.]{2,60}$/;
                    if (!val) {
                        errorMsg = 'Please enter your full name';
                        isValid = false;
                    } else if (/\d/.test(val)) {
                        errorMsg = 'Name cannot contain numbers';
                        isValid = false;
                    } else if (!nameRegex.test(val)) {
                        errorMsg = 'Please enter a valid name (2–60 letters)';
                        isValid = false;
                    }
                    break;
                }

                case 'whatsapp': {
                    const rawVal = phoneInput ? phoneInput.value : '';
                    const clean = rawVal.replace(/\D/g, '');
                    if (!clean) {
                        errorMsg = 'Please enter your 10-digit WhatsApp number';
                        isValid = false;
                    } else if (clean.length < 10) {
                        errorMsg = `Please enter exactly 10 digits (${10 - clean.length} more needed)`;
                        isValid = false;
                    } else if (clean.length > 10) {
                        errorMsg = 'WhatsApp number must be exactly 10 digits';
                        isValid = false;
                    } else if (!/^[6-9]\d{9}$/.test(clean)) {
                        errorMsg = 'Number must start with 6, 7, 8 or 9';
                        isValid = false;
                    }
                    break;
                }

                case 'location': {
                    // Optional field — no validation error
                    isValid = true;
                    errorMsg = '';
                    break;
                }

                case 'concern': {
                    const val = concernSelect ? concernSelect.value : '';
                    if (!val) {
                        errorMsg = 'Please select your treatment category';
                        isValid = false;
                    }
                    break;
                }

                case 'subconcern': {
                    const parentCategory = concernSelect ? concernSelect.value : '';
                    const subVal = subConcernSelect ? subConcernSelect.value : '';
                    if (!parentCategory) {
                        errorMsg = 'Please select treatment category first';
                        isValid = false;
                    } else if (!subVal) {
                        errorMsg = 'Please select your specific procedure or concern';
                        isValid = false;
                    }
                    break;
                }
            }

            setFieldError(fieldId, errorMsg);
            return isValid;
        }

        // ── DYNAMIC SUB-CATEGORY POPULATION & PILLS ────────────────────
        function renderSubCategories(categoryKey) {
            if (!subConcernSelect) return;

            const categoryData = SUB_CATEGORIES[categoryKey];

            if (!categoryData) {
                // Disabled empty state
                subConcernSelect.disabled = true;
                subConcernSelect.innerHTML = '<option value="">First select category above...</option>';
                if (subCategoryBadge) subCategoryBadge.style.display = 'none';
                if (quickPillsWrap) quickPillsWrap.style.display = 'none';
                if (subCategoryPills) subCategoryPills.innerHTML = '';
                if (specialistAssignedTag) specialistAssignedTag.style.display = 'none';
                return;
            }

            // Enable sub-category selector
            subConcernSelect.disabled = false;

            // Build select options
            let optionsHtml = '<option value="">Select specific procedure...</option>';
            categoryData.procedures.forEach(proc => {
                optionsHtml += `<option value="${escapeHtml(proc.id)}">${escapeHtml(proc.name)}</option>`;
            });
            subConcernSelect.innerHTML = optionsHtml;

            // Show Category Badge
            if (subCategoryBadge) {
                subCategoryBadge.textContent = categoryData.badge;
                subCategoryBadge.style.display = 'inline-block';
            }

            // Show Doctor Specialist Preview Card
            if (specialistAssignedTag && satDoctorName) {
                satDoctorName.textContent = categoryData.doctor;
                specialistAssignedTag.style.display = 'flex';
            }

            // Render 1-Tap Quick Pills
            if (subCategoryPills && quickPillsWrap) {
                subCategoryPills.innerHTML = '';
                categoryData.procedures.forEach(proc => {
                    const pillBtn = document.createElement('button');
                    pillBtn.type = 'button';
                    pillBtn.className = 'sub-pill-btn';
                    pillBtn.setAttribute('data-proc-id', proc.id);
                    pillBtn.innerHTML = `<i class="fas ${proc.icon}"></i> <span>${escapeHtml(proc.name)}</span>`;

                    pillBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        // Select inside dropdown
                        subConcernSelect.value = proc.id;
                        highlightActivePill(proc.id);
                        validateField('subconcern');
                        subConcernSelect.focus();
                    });

                    subCategoryPills.appendChild(pillBtn);
                });
                quickPillsWrap.style.display = 'block';
            }
        }

        function highlightActivePill(selectedId) {
            if (!subCategoryPills) return;
            const allPills = subCategoryPills.querySelectorAll('.sub-pill-btn');
            allPills.forEach(pill => {
                const procId = pill.getAttribute('data-proc-id');
                if (procId === selectedId) {
                    pill.classList.add('is-active');
                } else {
                    pill.classList.remove('is-active');
                }
            });
        }

        // Attach listeners to selects & inputs
        if (nameInput) {
            nameInput.addEventListener('blur', function() { validateField('name'); });
        }
        if (locationSelect) {
            locationSelect.addEventListener('change', function() { setFieldError('location', ''); });
        }
        if (concernSelect) {
            concernSelect.addEventListener('change', function() {
                const val = this.value;
                renderSubCategories(val);
                validateField('concern');
                setFieldError('subconcern', '');
            });
            concernSelect.addEventListener('blur', function() { validateField('concern'); });
        }
        if (subConcernSelect) {
            subConcernSelect.addEventListener('change', function() {
                highlightActivePill(this.value);
                validateField('subconcern');
            });
            subConcernSelect.addEventListener('blur', function() { validateField('subconcern'); });
        }

        // Check URL Query Parameters for pre-selection (e.g. ?category=Hair or ?concern=Skin or ?procedure=FUE)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const rawCat = urlParams.get('category') || urlParams.get('concern') || urlParams.get('treatment');
            if (rawCat) {
                const lowerCat = rawCat.toLowerCase().trim();
                let matchedCategory = null;
                Object.keys(SUB_CATEGORIES).forEach(k => {
                    if (k.toLowerCase() === lowerCat || lowerCat.includes(k.toLowerCase()) || k.toLowerCase().includes(lowerCat)) {
                        matchedCategory = k;
                    }
                });
                if (matchedCategory && concernSelect) {
                    concernSelect.value = matchedCategory;
                    renderSubCategories(matchedCategory);

                    // Optional procedure pre-selection
                    const rawProc = urlParams.get('procedure') || urlParams.get('sub') || urlParams.get('service');
                    if (rawProc && subConcernSelect) {
                        const lowerProc = rawProc.toLowerCase().trim();
                        const procMatch = SUB_CATEGORIES[matchedCategory].procedures.find(p => 
                            p.id.toLowerCase() === lowerProc || p.name.toLowerCase() === lowerProc || lowerProc.includes(p.id.toLowerCase())
                        );
                        if (procMatch) {
                            subConcernSelect.value = procMatch.id;
                            highlightActivePill(procMatch.id);
                        }
                    }
                }
            }

            // Optional city pre-selection
            const rawCity = urlParams.get('city') || urlParams.get('location') || urlParams.get('clinic');
            if (rawCity && locationSelect) {
                const lowerCity = rawCity.toLowerCase().trim();
                ['Jaipur', 'Sikar', 'Ajmer'].forEach(c => {
                    if (lowerCity.includes(c.toLowerCase())) {
                        locationSelect.value = c;
                    }
                });
            }
        } catch (paramErr) {
            console.warn('[URL Params Init Error]:', paramErr);
        }

        // ── FORM SUBMISSION ────────────────────────────────────────────
        let isSubmitting = false;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Prevent double submission
            if (isSubmitting) return;

            // Remove any existing global error banner
            const existingGlobalErr = contactForm.querySelector('.cty-global-error');
            if (existingGlobalErr) existingGlobalErr.remove();

            // Validate required fields (name, whatsapp, concern, subconcern)
            const fieldsToValidate = [
                { id: 'name', el: nameInput },
                { id: 'whatsapp', el: phoneInput },
                { id: 'concern', el: concernSelect },
                { id: 'subconcern', el: subConcernSelect }
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
                showThankYouCard({
                    name: nameInput ? nameInput.value.trim() : 'Patient',
                    clinic: 'Jaipur',
                    category: concernSelect ? concernSelect.value : 'Consultation',
                    subCategory: subConcernSelect ? subConcernSelect.value : 'General',
                    treatment: `${concernSelect ? concernSelect.value : 'Consultation'} - ${subConcernSelect ? subConcernSelect.value : 'General'}`,
                    preferredSlot: preferredSlotSelect ? preferredSlotSelect.value : 'Any Time',
                    leadId: `KEZZA-${new Date().getFullYear()}-4102`
                }, false);
                return;
            }

            // Extract values
            const nameVal          = nameInput.value.trim();
            const cleanPhone       = normalizeWhatsApp(phoneInput.value);
            const locationVal      = (locationSelect && locationSelect.value) ? locationSelect.value : '';
            const concernVal       = concernSelect.value;
            const subConcernVal    = subConcernSelect ? subConcernSelect.value : 'General Consultation';
            const preferredSlotVal = preferredSlotSelect ? preferredSlotSelect.value : 'Any Time (Clinic Hours 9 AM - 8 PM)';
            const combinedTreatment = `${concernVal} — ${subConcernVal}`;

            // Determine resolved clinic: Jaipur / Sikar / Ajmer / default to Jaipur for Other or unselected
            let clinicVal = 'Jaipur';
            if (['Jaipur', 'Sikar', 'Ajmer'].includes(locationVal)) {
                clinicVal = locationVal;
            }

            // Generate client-side Lead ID fallback
            const currentYear = new Date().getFullYear();
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const clientLeadId = `KEZZA-${currentYear}-${randomDigits}`;

            // Build comprehensive payload for backend and Google Sheets CRM
            const payload = {
                source: 'Contact Us Form (Website)',
                Source: 'Contact Us Form (Website)',
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
                location: locationVal || 'Jaipur',
                patientLocation: locationVal || 'Jaipur',
                'Patient Location': locationVal || 'Jaipur',
                city: locationVal || 'Jaipur',
                clinic: clinicVal,
                Clinic: clinicVal,
                'Clinic': clinicVal,
                department: concernVal,
                Department: concernVal,
                'Department': concernVal,
                category: concernVal,
                Category: concernVal,
                'Category': concernVal,
                subCategory: subConcernVal,
                'Sub-Category': subConcernVal,
                subConcern: subConcernVal,
                treatment: combinedTreatment,
                Treatment: combinedTreatment,
                'Treatment': combinedTreatment,
                concern: combinedTreatment,
                Concern: combinedTreatment,
                'Concern / Duration': combinedTreatment,
                preferredSlot: preferredSlotVal,
                'Preferred Slot': preferredSlotVal,
                status: 'New',
                Status: 'New',
                'Status': 'New',
                kz_hp: ''
            };

            // Enter loading state
            isSubmitting = true;
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-spinner"></span><span>Confirming Booking…</span>';

            // Timeout controller (20 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            let syncSuccess = false;
            let returnedLeadId = clientLeadId;

            try {
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
                    serverHandled = false;
                }

                // 2. Direct Google Sheets Webhook fallback
                if (!serverHandled) {
                    await fetch(SHEET_WEBHOOK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });
                    syncSuccess = true;
                }

                clearTimeout(timeoutId);

            } catch (err) {
                clearTimeout(timeoutId);
                console.error('[Kezza Consultation Lead Submit Error]:', err);
                syncSuccess = false;
            }

            if (syncSuccess) {
                // Track GA4, GTM and Meta Pixel Lead event with specific procedure
                try {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'generate_lead',
                        lead_id: leadId,
                        treatment: combinedTreatment,
                        category: concernVal,
                        clinic: clinicVal,
                        slot: preferredSlotVal
                    });
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', {
                            event_category: 'consultation',
                            event_label: combinedTreatment,
                            clinic: clinicVal,
                            value: 1
                        });
                    }
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead', {
                            content_name: combinedTreatment,
                            content_category: concernVal,
                            clinic_location: locationVal,
                            slot: preferredSlotVal
                        });
                    }
                } catch (pxErr) {
                    console.warn('[Analytics Lead Warning]:', pxErr);
                }

                // Show Thank-You Card
                showThankYouCard({
                    name: nameVal,
                    clinic: clinicVal,
                    category: concernVal,
                    subCategory: subConcernVal,
                    treatment: combinedTreatment,
                    preferredSlot: preferredSlotVal,
                    leadId: returnedLeadId
                }, true);

            } else {
                // Failure: restore button, preserve inputs, show inline error banner
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                const clinicWa = CLINIC_WHATSAPP[clinicVal] || '919284517427';
                const waFailUrl = `https://wa.me/${clinicWa}?text=${encodeURIComponent('Hello Kezza Clinic ' + clinicVal + ', I attempted to book a free consultation for ' + combinedTreatment + ' on your website.')}`;

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
            const waChatMsg = `Hello Kezza Clinic ${lead.clinic}, I have booked a free consultation for ${lead.category} (${lead.subCategory}) on your website. Preferred Slot: ${lead.preferredSlot}. My Reference ID is ${lead.leadId}.`;
            const waChatUrl = `https://wa.me/${clinicPhone}?text=${encodeURIComponent(waChatMsg)}`;

            formCard.innerHTML = `
                <div class="consultation-thank-you-card" role="status" aria-live="polite">
                    <div class="cty-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3 class="cty-title">Thank you, ${escapeHtml(lead.name)}!</h3>
                    <p class="cty-message">
                        Your free consultation request for <strong>${escapeHtml(lead.category)} &mdash; ${escapeHtml(lead.subCategory)}</strong> at our <strong>${escapeHtml(lead.clinic)}</strong> clinic has been confirmed.
                    </p>
                    <div class="cty-slot-badge" style="display:inline-flex; align-items:center; gap:6px; background:rgba(0,175,192,0.08); border:1px solid rgba(0,175,192,0.22); color:#007D8A; padding:6px 14px; border-radius:20px; font-size:0.82rem; font-weight:600; margin-bottom:14px;">
                        <i class="far fa-clock"></i> Preferred Slot: ${escapeHtml(lead.preferredSlot)}
                    </div>
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

            if (window.KezzaFollowUp && typeof window.KezzaFollowUp.show === 'function') {
                window.KezzaFollowUp.show({
                    name: lead.name,
                    clinic: lead.clinic,
                    treatment: lead.treatment,
                    time: lead.preferredSlot,
                    leadId: lead.leadId
                });
            }

            const resetBtn = document.getElementById('btnBookAnother');
            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    window.location.reload();
                });
            }
        }
    });
})();
