/**
 * Kezza Clinic — Contact Form WhatsApp Handler
 * Routes form submission to the correct department WhatsApp based on selected service.
 * FIXED: Replaced alert() with inline error/success UI; removed Alwar; department-based routing.
 */
(function() {
    'use strict';

    // Verified department routing — must match backend DEPARTMENT_PHONES
    const DEPT_PHONES = {
        'hair-services':   '919216063681',
        'hair-transplant': '918130888129',
        'skin-services':   '919216063686',
        'laser-treatments':'919216063686',
        'prp-treatment':   '919216063681',
        'weight-loss':     '919057546221',
        'permanent-makeup':'919079161300',
        'general-query':   '919284517427'  // Reception fallback
    };

    const DEPT_LABELS = {
        'hair-services':   'Hair Team (Dr. Ankit Bhalothia)',
        'hair-transplant': 'Hair Transplant — Elite Surgical, Sikar',
        'skin-services':   'Skin Team (Dr. Amrita Mukhija)',
        'laser-treatments':'Skin Team (Dr. Amrita Mukhija)',
        'prp-treatment':   'Hair Team (Dr. Ankit Bhalothia)',
        'weight-loss':     'Weight Loss Team',
        'permanent-makeup':'PMU Team (Krishna)',
        'general-query':   'Kezza Reception'
    };

    function showError(formEl, message) {
        clearMessages(formEl);
        const el = document.createElement('div');
        el.className = 'kezza-form-error';
        el.setAttribute('role', 'alert');
        el.innerHTML = `<strong>⚠ Please check your details:</strong> ${message}`;
        formEl.prepend(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showSuccess(formEl, message, waUrl, deptName) {
        clearMessages(formEl);
        const el = document.createElement('div');
        el.className = 'kezza-form-success';
        el.setAttribute('role', 'status');
        el.innerHTML = `
            <div style="font-size: 15px; margin-bottom: 12px; color: #065f46; font-weight: 600;">✅ ${message}</div>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 30px; font-weight: 700; text-decoration: none; font-size: 15px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); margin-top: 4px; transition: transform 0.2s ease;">
                <i class="fab fa-whatsapp" style="font-size: 20px;"></i> Open WhatsApp (${deptName || 'Kezza Team'})
            </a>
        `;
        formEl.prepend(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearMessages(formEl) {
        formEl.querySelectorAll('.kezza-form-error, .kezza-form-success').forEach(el => el.remove());
    }

    function injectFormStyles() {
        if (document.getElementById('kezza-form-styles')) return;
        const style = document.createElement('style');
        style.id = 'kezza-form-styles';
        style.textContent = `
            .kezza-form-error, .kezza-form-success {
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                animation: kezza-slide-in 0.3s ease;
            }
            .kezza-form-error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #b91c1c;
            }
            .kezza-form-success {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                color: #15803d;
            }
            @keyframes kezza-slide-in {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', function() {
        injectFormStyles();

        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.setAttribute('maxlength', '10');
            phoneInput.setAttribute('inputmode', 'numeric');
            phoneInput.setAttribute('type', 'tel');
            phoneInput.setAttribute('placeholder', 'Enter 10-digit WhatsApp number');

            // Real-time input filter: digits only
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 10);
            });

            // Paste protection: extract final 10 digits
            phoneInput.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                const digits = text.replace(/\D/g, '');
                const normalized = digits.length > 10 ? digits.slice(-10) : digits;
                this.value = normalized.slice(0, 10);
            });

            phoneInput.addEventListener('keydown', function(e) {
                const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Escape', 'Home', 'End', 'Enter'];
                if (allowed.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
                if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
                const selLen = (this.selectionEnd || 0) - (this.selectionStart || 0);
                if (this.value.length >= 10 && selLen === 0) {
                    e.preventDefault();
                }
            });
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name     = document.getElementById('fullName')?.value.trim()  || '';
            const phone    = document.getElementById('phone')?.value.trim()     || '';
            const email    = document.getElementById('email')?.value.trim()     || '';
            const category = document.getElementById('category')?.value         || '';
            const clinic   = document.getElementById('clinic')?.value           || '';
            const message  = document.getElementById('message')?.value.trim()   || '';

            // Validation
            if (!name || !phone || !email || !category || !clinic || !message) {
                return showError(contactForm, 'All fields are required.');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return showError(contactForm, 'Please enter a valid email address.');
            }

            if (!/^[6-9][0-9]{9}$/.test(phone)) {
                if (/[^\d]/.test(phone)) {
                    return showError(contactForm, 'Only numbers are allowed.');
                }
                if (phone.length < 10) {
                    return showError(contactForm, 'Please enter exactly 10 digits.');
                }
                if (!/^[6-9]/.test(phone)) {
                    return showError(contactForm, 'Please enter a valid Indian mobile number starting with 6, 7, 8 or 9.');
                }
                return showError(contactForm, 'Please enter a valid 10-digit WhatsApp number.');
            }

            // Route to correct department
            const toPhone     = DEPT_PHONES[category] || '919284517427';
            const deptName    = DEPT_LABELS[category] || 'Kezza Team';
            const clinicLabel = clinic === 'sikar' ? 'Sikar' : 'Jaipur';

            const consultationId = `KEZZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const cidLine = `\n🆔 *Consultation ID:* ${consultationId}\n`;
            const waMessage = `🏥 *New Website Enquiry — Kezza Clinic*
━━━━━━━━━━━━━━━━━━━━━${cidLine}
👤 *Name:* ${name}
📱 *Phone:* +91 ${phone}
📧 *Email:* ${email}
🏷️ *Service:* ${category}
🏥 *Preferred Clinic:* ${clinicLabel}
📝 *Message:* ${message}

👨‍⚕️ *Routed to:* ${deptName}`;

            const waUrl = `https://wa.me/${toPhone}?text=${encodeURIComponent(waMessage)}`;

            // Send to Google Sheet Webhook & Backend Lead API
            const leadPayload = {
                timestamp: new Date().toISOString(),
                consultationId: consultationId,
                leadId: consultationId,
                name: name,
                phone: phone,
                whatsapp: phone,
                email: email,
                category: category,
                service: category,
                clinic: clinicLabel,
                message: message,
                department: deptName,
                source: 'Contact Us Form'
            };

            // Direct sync to Google Apps Script (CORS-safe simple POST)
            try {
                fetch('https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(leadPayload)
                }).catch(e => console.warn('[WhatsApp Form Sheet Sync Warn]:', e));
            } catch (sheetErr) {}

            // Server-side sync via /api/lead
            try {
                fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadPayload)
                }).catch(e => {});
            } catch (apiErr) {}

            // Show success message inline with large clickable button
            showSuccess(contactForm, `Redirecting you to WhatsApp (${deptName}). Consultation ID: <strong>${consultationId}</strong>.`, waUrl, deptName);

            // Attempt direct window.open, fallback to location.href if popup blocked
            try {
                const w = window.open(waUrl, '_blank');
                if (!w || w.closed || typeof w.closed === 'undefined') {
                    window.location.href = waUrl;
                }
            } catch (err) {
                window.location.href = waUrl;
            }

            // Reset form
            contactForm.reset();
        });
    });
})();
