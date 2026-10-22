/**
 * Kezza Clinic — Automated WhatsApp Follow-up & Confirmation Modal Engine
 * Handles post-lead clinical confirmation, instant WhatsApp dispatch, and clinic directions.
 */
(function() {
  'use strict';

  var CLINIC_INFO = {
    'Jaipur': {
      phone: '919284517427',
      displayPhone: '+91-9284517427',
      address: 'A-7, 1st Floor, Hanuman Nagar, Sirsi Road, Khatipura, Jaipur (Near Vaishali Nagar)',
      mapUrl: 'https://maps.app.goo.gl/4eUGixic35V777yd8'
    },
    'Sikar': {
      phone: '918130888129',
      displayPhone: '+91-8130888129 / +91-9284517427',
      address: '4th Floor, Shakambhari Heights, Opposite S.K. Hospital, Silver Jubilee Road, Sikar',
      mapUrl: 'https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6'
    },
    'Ajmer': {
      phone: '919216088257',
      displayPhone: '+91-9216088257',
      address: '1st Floor, Hotel Oasis Complex, Shastri Nagar, Jawahar Nagar, Ajmer',
      mapUrl: 'https://maps.app.goo.gl/zMajvKmT5N7coswJA'
    }
  };

  function createModalHtml() {
    if (document.getElementById('kz-wa-followup-modal')) return;

    var wrap = document.createElement('div');
    wrap.id = 'kz-wa-followup-modal';
    wrap.className = 'wa-followup-backdrop';
    wrap.innerHTML = 
      '<div class="wa-followup-modal" role="dialog" aria-modal="true" aria-labelledby="kz-wa-title">' +
        '<button type="button" class="wa-modal-close" id="kz-wa-close-btn" aria-label="Close dialog">&times;</button>' +
        '<div class="wa-modal-icon"><i class="fas fa-check"></i></div>' +
        '<h3 id="kz-wa-title">Appointment Request Received!</h3>' +
        '<p id="kz-wa-subtitle">We have saved your details. Our clinical team is ready on WhatsApp to confirm your preferred slot.</p>' +
        '<div class="wa-summary-box" id="kz-wa-summary-box">' +
          '<div><strong>Patient:</strong> <span id="kz-wa-patient-name">—</span></div>' +
          '<div><strong>Treatment:</strong> <span id="kz-wa-treatment-name">—</span></div>' +
          '<div><strong>Clinic:</strong> <span id="kz-wa-clinic-name">Kezza Jaipur</span></div>' +
          '<div id="kz-wa-slot-row" style="display:none;"><strong>Slot:</strong> <span id="kz-wa-slot-time">—</span></div>' +
          '<div id="kz-wa-estimate-row" style="display:none;"><strong>Estimate:</strong> <span id="kz-wa-estimate-val">—</span></div>' +
          '<div><strong>Location:</strong> <span id="kz-wa-address-val">—</span></div>' +
        '</div>' +
        '<a href="#" target="_blank" rel="noopener noreferrer" class="wa-action-btn-primary" id="kz-wa-direct-btn">' +
          '<i class="fab fa-whatsapp"></i> Open WhatsApp to Confirm Slot' +
        '</a>' +
        '<div style="display:flex; justify-content:center; gap:16px; margin-top:8px;">' +
          '<a href="#" target="_blank" rel="noopener noreferrer" class="wa-action-calendar-btn" id="kz-wa-map-link">' +
            '<i class="fas fa-map-marker-alt"></i> Clinic Directions' +
          '</a>' +
          '<a href="javascript:void(0)" class="wa-action-calendar-btn" id="kz-wa-cal-btn" style="display:none;">' +
            '<i class="fas fa-calendar-plus"></i> Add to Calendar' +
          '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('kz-wa-close-btn').addEventListener('click', function() {
      wrap.classList.remove('active');
    });

    wrap.addEventListener('click', function(e) {
      if (e.target === wrap) {
        wrap.classList.remove('active');
      }
    });
  }

  function showFollowupModal(details) {
    createModalHtml();
    var backdrop = document.getElementById('kz-wa-followup-modal');
    if (!backdrop) return;

    var clinicKey = details.clinic || 'Jaipur';
    var clinic = CLINIC_INFO[clinicKey] || CLINIC_INFO['Jaipur'];

    document.getElementById('kz-wa-patient-name').textContent = details.name || 'Valued Patient';
    document.getElementById('kz-wa-treatment-name').textContent = details.treatment || 'Consultation';
    document.getElementById('kz-wa-clinic-name').textContent = 'Kezza ' + clinicKey + ' Clinic';
    document.getElementById('kz-wa-address-val').textContent = clinic.address;
    document.getElementById('kz-wa-map-link').href = clinic.mapUrl;

    // Slot details
    var slotRow = document.getElementById('kz-wa-slot-row');
    if (details.date || details.time) {
      slotRow.style.display = 'block';
      document.getElementById('kz-wa-slot-time').textContent = (details.date ? details.date + ' ' : '') + (details.time || '');
    } else {
      slotRow.style.display = 'none';
    }

    // Estimate details
    var estRow = document.getElementById('kz-wa-estimate-row');
    if (details.estimate) {
      estRow.style.display = 'block';
      document.getElementById('kz-wa-estimate-val').textContent = details.estimate;
    } else {
      estRow.style.display = 'none';
    }

    // WhatsApp Message
    var leadId = details.leadId || ('KEZZA-' + Math.floor(1000 + Math.random() * 9000));
    var msgLines = [
      'Hi Kezza Clinic (' + clinicKey + '), I just booked a consultation on your website.',
      '',
      '👤 Name: ' + (details.name || ''),
      '🩺 Treatment: ' + (details.treatment || ''),
      '📍 Clinic: Kezza ' + clinicKey,
      details.date ? '📅 Date: ' + details.date : '',
      details.time ? '⏰ Preferred Slot: ' + details.time : '',
      details.estimate ? '💰 Online Estimate: ' + details.estimate : '',
      '🆔 Reference: ' + leadId,
      '',
      'Please confirm my appointment and share the clinic Google Maps location.'
    ].filter(Boolean).join('\n');

    var waUrl = details.whatsappUrl || ('https://wa.me/' + clinic.phone + '?text=' + encodeURIComponent(msgLines));
    var directBtn = document.getElementById('kz-wa-direct-btn');
    directBtn.href = waUrl;

    // Calendar (.ics) setup if date is present
    var calBtn = document.getElementById('kz-wa-cal-btn');
    if (details.date) {
      calBtn.style.display = 'inline-flex';
      calBtn.onclick = function() {
        downloadIcsFile(details, clinic);
      };
    } else {
      calBtn.style.display = 'none';
    }

    backdrop.classList.add('active');
  }

  function downloadIcsFile(details, clinic) {
    var title = 'Kezza Clinic Consultation: ' + (details.treatment || 'Consultation');
    var desc = 'Doctor consultation at Kezza Clinic (' + (details.clinic || 'Jaipur') + '). Phone: ' + clinic.displayPhone;
    var loc = clinic.address;
    
    var d = details.date ? new Date(details.date) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    var dtStr = d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 8);

    var icsContent = 
      'BEGIN:VCALENDAR\n' +
      'VERSION:2.0\n' +
      'PRODID:-//Kezza Clinic//Consultation Scheduler//EN\n' +
      'BEGIN:VEVENT\n' +
      'SUMMARY:' + title + '\n' +
      'DESCRIPTION:' + desc + '\n' +
      'LOCATION:' + loc + '\n' +
      'DTSTART;VALUE=DATE:' + dtStr + '\n' +
      'DTEND;VALUE=DATE:' + dtStr + '\n' +
      'STATUS:CONFIRMED\n' +
      'END:VEVENT\n' +
      'END:VCALENDAR';

    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kezza-consultation-' + (details.leadId || 'booking') + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Expose globally
  window.KezzaFollowUp = {
    show: showFollowupModal,
    downloadIcs: downloadIcsFile,
    clinics: CLINIC_INFO
  };

  // Auto-init modal markup on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModalHtml);
  } else {
    createModalHtml();
  }

})();
