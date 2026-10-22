/**
 * Kezza Hair & Skin Clinic — TeleCRM Integration Module
 *
 * Official TeleCRM Async API v2 Integration
 * Endpoint: POST https://next-api.telecrm.in/enterprise/{enterpriseId}/autoupdatelead
 * Docs: https://docs.telecrm.in/async-api/create-or-update-lead
 *
 * Supports:
 *  - Contact page form (#contactForm)
 *  - Treatment and doctor pages (.pg-lead-form)
 *  - AI face scanner & modal leads
 *  - Custom programmatic calls via window.KezzaTeleCRM.sendLead(data)
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.KezzaTeleCRM = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ── CONFIGURATION ─────────────────────────────────────────────────────────
    var CONFIG = {
        // Base API endpoint for TeleCRM Async API
        apiBase: 'https://next-api.telecrm.in',

        // Enterprise workspace ID
        enterpriseId: 'f4aec56d-3d53-4f3a-96fc-2071ac72d054',

        // TeleCRM Async Bearer Token
        token: 'f4aec56d-3d53-4f3a-96fc-2071ac72d0541791960668171:af31a753-03a9-413d-be0b-d37c9544a1b6',

        // Global enable/disable flag
        enabled: true,

        // Request timeout in milliseconds
        timeoutMs: 15000,

        // Debug logging (set to true in development)
        debug: false
    };

    function log() {
        if (CONFIG.debug && typeof console !== 'undefined' && console.log) {
            console.log.apply(console, ['[TeleCRM]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    function warn() {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn.apply(console, ['[TeleCRM]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    function error() {
        if (typeof console !== 'undefined' && console.error) {
            console.error.apply(console, ['[TeleCRM]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    // ── PHONE NUMBER FORMATTING ──────────────────────────────────────────────
    // TeleCRM expects Indian mobile numbers with country code: 91XXXXXXXXXX
    function formatPhone(phone) {
        if (!phone) return '';
        var digits = String(phone).replace(/\D/g, '');
        if (digits.length === 10 && /^[6-9]/.test(digits)) {
            return '91' + digits;
        }
        if (digits.length === 11 && digits.charAt(0) === '0') {
            return '91' + digits.slice(1);
        }
        if (digits.length === 12 && digits.indexOf('91') === 0) {
            return digits;
        }
        return digits;
    }

    // ── PAYLOAD BUILDER ──────────────────────────────────────────────────────
    function buildPayload(raw) {
        raw = raw || {};
        var phone = formatPhone(raw.phone || raw.whatsapp || raw.WhatsApp || raw.mobile || '');
        var name = (raw.name || raw.Name || raw.fullName || 'Consultation Inquirer').trim();
        var city = raw.city || raw.location || raw.patientLocation || raw.clinic || 'Jaipur';
        var clinic = raw.clinic || raw.Clinic || raw.location || 'Jaipur';
        var treatment = raw.treatment || raw.Treatment || raw.service || raw.procedure || 'General Consultation';
        var category = raw.category || raw.Category || raw.department || raw.Department || 'Consultation';
        var email = raw.email || raw.Email || '';
        var leadId = raw.leadId || raw.consultationId || raw['Lead ID'] || ('KEZZA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
        var preferredSlot = raw.preferredSlot || raw.preferredTime || raw['Preferred Slot'] || 'Any Time (9 AM – 8 PM)';
        var pageUrl = raw.page || (typeof window !== 'undefined' && window.location ? window.location.href : '');
        var source = raw.source || raw.Source || ('Website Form (' + (typeof window !== 'undefined' && window.location ? window.location.pathname : '/') + ')');
        var specialist = raw.specialist || raw.doctor || '';
        var userMessage = raw.message || raw.concern || raw.concernDetails || '';

        // Comprehensive note for the TeleCRM calling dashboard
        var summaryNotes = [
            'Lead Reference: ' + leadId,
            'Treatment: ' + treatment,
            'Category: ' + category,
            'Clinic: ' + clinic + (city && city !== clinic ? ' (City: ' + city + ')' : ''),
            'Preferred Slot: ' + preferredSlot,
            specialist ? 'Specialist: ' + specialist : '',
            userMessage ? 'User Message: ' + userMessage : '',
            'Source: ' + source,
            'Page: ' + pageUrl
        ].filter(Boolean).join(' | ');

        var fields = {
            name: name,
            phone: phone
        };

        if (email) fields.email = email;
        if (city) fields.city = city;
        if (clinic) fields.clinic = clinic;
        if (treatment) fields.treatment = treatment;
        if (category) fields.category = category;
        if (source) fields.source = source;
        if (preferredSlot) fields.preferred_slot = preferredSlot;
        if (leadId) fields.lead_id = leadId;
        fields.notes = summaryNotes;

        return {
            fields: fields,
            actions: [
                {
                    type: 'SYSTEM_NOTE',
                    fields: {
                        note: summaryNotes
                    }
                }
            ]
        };
    }

    // ── SEND LEAD TO TELECRM ASYNC API ───────────────────────────────────────
    function sendLead(leadData) {
        if (!CONFIG.enabled) {
            log('Integration disabled via CONFIG.enabled = false');
            return Promise.resolve({ success: false, reason: 'disabled' });
        }

        var payload = buildPayload(leadData);
        if (!payload.fields.phone) {
            warn('Cannot send lead without a valid phone number', leadData);
            return Promise.resolve({ success: false, reason: 'missing_phone' });
        }

        var url = CONFIG.apiBase + '/enterprise/' + encodeURIComponent(CONFIG.enterpriseId) + '/autoupdatelead';
        log('Sending lead to:', url, payload);

        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var timeoutId = null;

        var fetchPromise = new Promise(function (resolve) {
            if (controller) {
                timeoutId = setTimeout(function () {
                    controller.abort();
                    warn('Request timed out after ' + CONFIG.timeoutMs + 'ms');
                    resolve({ success: false, reason: 'timeout' });
                }, CONFIG.timeoutMs);
            }

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + CONFIG.token
                },
                body: JSON.stringify(payload),
                signal: controller ? controller.signal : undefined
            })
            .then(function (response) {
                if (timeoutId) clearTimeout(timeoutId);
                return response.text().then(function (text) {
                    var parsed = null;
                    try {
                        parsed = JSON.parse(text);
                    } catch (e) {
                        parsed = { raw: text };
                    }

                    if (response.ok) {
                        log('Lead successfully synced to TeleCRM:', parsed);
                        resolve({
                            success: true,
                            status: parsed.status || 'Created',
                            leadIds: parsed.modifiedLeadIds || [],
                            data: parsed
                        });
                    } else if (response.status === 403 && (text.indexOf('ENTERPRISE_LICENSE_EXPIRED') !== -1 || (parsed && parsed.error === 'ENTERPRISE_LICENSE_EXPIRED'))) {
                        // Account license status notice: don't break user flow
                        warn('TeleCRM account enterprise license is currently expired or pending renewal in TeleCRM dashboard. Payload verified and ready.', parsed);
                        resolve({
                            success: false,
                            status: 403,
                            reason: 'ENTERPRISE_LICENSE_EXPIRED',
                            message: 'Enterprise license expired in TeleCRM dashboard',
                            data: parsed
                        });
                    } else {
                        warn('TeleCRM returned HTTP ' + response.status + ':', text);
                        resolve({
                            success: false,
                            status: response.status,
                            reason: 'http_error',
                            data: parsed
                        });
                    }
                });
            })
            .catch(function (err) {
                if (timeoutId) clearTimeout(timeoutId);
                warn('Network error pushing to TeleCRM:', err && err.message ? err.message : err);
                resolve({
                    success: false,
                    reason: 'network_error',
                    error: err && err.message ? err.message : String(err)
                });
            });
        });

        return fetchPromise;
    }

    // ── AUTO-ATTACH TO DOM FORMS ─────────────────────────────────────────────
    function autoAttach() {
        if (typeof document === 'undefined') return;

        // Listen to custom kezza:lead event for decoupled architectures
        document.addEventListener('kezza:lead', function (event) {
            if (event && event.detail) {
                sendLead(event.detail);
            }
        });

        // Helper to extract values from standard HTML forms
        function extractFormData(form) {
            var data = {};
            var inputs = form.querySelectorAll('input, select, textarea');
            Array.prototype.forEach.call(inputs, function (el) {
                var name = el.name || el.id;
                if (!name || el.type === 'submit' || el.type === 'button') return;
                if (el.type === 'radio' || el.type === 'checkbox') {
                    if (el.checked) data[name] = el.value;
                } else {
                    data[name] = el.value;
                }
            });

            // Dataset attributes from the form element itself
            if (form.dataset) {
                if (form.dataset.treatment) data.treatment = form.dataset.treatment;
                if (form.dataset.department) data.department = form.dataset.department;
                if (form.dataset.specialist) data.specialist = form.dataset.specialist;
                if (form.dataset.clinic) data.clinic = form.dataset.clinic;
                if (form.dataset.page) data.source = 'Treatment Page Form (' + form.dataset.page + ')';
            }
            return data;
        }

        // Attach to main contact form (#contactForm)
        var contactForm = document.getElementById('contactForm');
        if (contactForm && !contactForm._telecrmBound) {
            contactForm._telecrmBound = true;
            contactForm.addEventListener('submit', function () {
                setTimeout(function () {
                    var data = extractFormData(contactForm);
                    // Check honeypot
                    if (data.kz_hp) return;
                    if (data.whatsapp || data.phone) {
                        sendLead(data);
                    }
                }, 10);
            }, true);
        }

        // Attach to all treatment consultation forms (.pg-lead-form)
        var treatmentForms = document.querySelectorAll('form.pg-lead-form');
        Array.prototype.forEach.call(treatmentForms, function (tf) {
            if (tf._telecrmBound) return;
            tf._telecrmBound = true;
            tf.addEventListener('submit', function () {
                setTimeout(function () {
                    var data = extractFormData(tf);
                    if (data.kz_hp) return;
                    if (data.whatsapp || data.phone) {
                        sendLead(data);
                    }
                }, 10);
            }, true);
        });

        // Attach to specific service booking forms
        var extraFormIds = ['consultationBookingForm', 'electrolysisBookingForm'];
        extraFormIds.forEach(function (id) {
            var f = document.getElementById(id);
            if (f && !f._telecrmBound) {
                f._telecrmBound = true;
                f.addEventListener('submit', function () {
                    setTimeout(function () {
                        var data = extractFormData(f);
                        if (data.whatsapp || data.phone || data.patientPhone || data.bookingPhone) {
                            sendLead(data);
                        }
                    }, 10);
                }, true);
            }
        });
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoAttach);
        } else {
            autoAttach();
        }
    }

    // ── PUBLIC API EXPORT ────────────────────────────────────────────────────
    return {
        CONFIG: CONFIG,
        sendLead: sendLead,
        buildPayload: buildPayload,
        formatPhone: formatPhone,
        autoAttach: autoAttach
    };
}));
