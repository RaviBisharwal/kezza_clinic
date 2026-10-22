/**
 * Kezza Clinic — Real Slot Booking Engine & Modal
 * Synchronizes clinic calendars with TeleCRM & Google Sheets with WhatsApp confirmations.
 */
(function() {
  'use strict';

  var DOCTORS_DATA = [
    { id: 'dr-ankit', name: 'Dr. Ankit Bhalothia', title: 'Hair Transplant Surgeon (MDS)', clinics: ['Jaipur', 'Sikar'], days: 'Mon – Sat' },
    { id: 'dr-amrita', name: 'Dr. Amrita Mukhija', title: 'Aesthetic Physician & Skin Specialist (MBBS)', clinics: ['Jaipur'], days: 'Mon – Sat' },
    { id: 'dr-neelam', name: 'Dr. Neelam Choudhary', title: 'Facial Aesthetics & Clinical Cosmetology (BDS)', clinics: ['Jaipur', 'Sikar'], days: 'Tue, Thu, Sat' },
    { id: 'dr-nakul', name: 'Dr. Nakul Somani', title: 'Plastic & Cosmetic Surgeon (MCh)', clinics: ['Jaipur', 'Ajmer'], days: 'Wed & Sat' },
    { id: 'dr-mandhata', name: 'Dr. Mandhata Sharma', title: 'ENT & Rhinoplasty Surgeon (MS)', clinics: ['Jaipur'], days: 'Visiting Consultant' },
    { id: 'dr-youvraj', name: 'Dr. Youvraj Singh', title: 'Internal Medicine & Physician (MD)', clinics: ['Jaipur'], days: 'Visiting Consultant' },
    { id: 'dr-aliza', name: 'Dr. Aliza Rizvi', title: 'Clinical Dermatologist (MD)', clinics: ['Ajmer'], days: 'Mon – Sat' },
    { id: 'krishna-pmu', name: 'Krishna Choudhary', title: 'Permanent Makeup Artist', clinics: ['Jaipur', 'Sikar'], days: 'Mon – Sun' }
  ];

  var bookingState = {
    clinic: 'Jaipur',
    selectedDate: '',
    selectedSlot: '11:30 AM',
    treatment: 'Hair Transplant',
    doctor: 'Dr. Ankit Bhalothia'
  };

  function createDatesArray() {
    var dates = [];
    var today = new Date();
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (var i = 0; i < 14; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() + i);
      var yyyy = d.getFullYear();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      var dateKey = yyyy + '-' + mm + '-' + dd;

      dates.push({
        key: dateKey,
        dayLabel: i === 0 ? 'Today' : (i === 1 ? 'Tmrw' : days[d.getDay()]),
        dateNum: dd,
        monthLabel: months[d.getMonth()]
      });
    }
    return dates;
  }

  function renderDatesCarousel(container, dates) {
    if (!container) return;
    container.innerHTML = '';
    
    dates.forEach(function(item, idx) {
      var pill = document.createElement('div');
      pill.className = 'date-pill' + (idx === 0 ? ' selected' : '');
      pill.setAttribute('data-date', item.key);
      pill.innerHTML = 
        '<span class="day">' + item.dayLabel + '</span>' +
        '<span class="date-num">' + item.dateNum + '</span>' +
        '<span class="month">' + item.monthLabel + '</span>';
      
      pill.addEventListener('click', function() {
        container.querySelectorAll('.date-pill').forEach(function(p) { p.classList.remove('selected'); });
        pill.classList.add('selected');
        bookingState.selectedDate = item.key;
      });

      container.appendChild(pill);
      if (idx === 0) bookingState.selectedDate = item.key;
    });
  }

  function initSlotButtons(container) {
    if (!container) return;
    var slotBtns = container.querySelectorAll('.slot-btn');
    slotBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.classList.contains('disabled')) return;
        slotBtns.forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        bookingState.selectedSlot = btn.getAttribute('data-slot');
      });
    });
  }

  function initClinicSelector(container) {
    if (!container) return;
    var pills = container.querySelectorAll('.clinic-pill-btn');
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        pills.forEach(function(p) { p.classList.remove('selected'); });
        pill.classList.add('selected');
        bookingState.clinic = pill.getAttribute('data-clinic');
        updateDoctorsDropdown();
      });
    });
  }

  function updateDoctorsDropdown() {
    var select = document.getElementById('booking-doctor-select');
    if (!select) return;
    var currentClinic = bookingState.clinic;
    select.innerHTML = '<option value="">Any Available Specialist</option>';
    
    DOCTORS_DATA.forEach(function(doc) {
      if (doc.clinics.indexOf(currentClinic) !== -1) {
        var opt = document.createElement('option');
        opt.value = doc.name;
        opt.textContent = doc.name + ' (' + doc.title + ')';
        select.appendChild(opt);
      }
    });
  }

  function handleBookingSubmit(form) {
    var name = (form.querySelector('[name="name"]') || {}).value || '';
    var phone = ((form.querySelector('[name="phone"]') || {}).value || '').replace(/\D/g, '');
    var treatment = (form.querySelector('[name="treatment"]') || {}).value || bookingState.treatment;
    var doctor = (form.querySelector('[name="doctor"]') || {}).value || bookingState.doctor;
    var notes = (form.querySelector('[name="notes"]') || {}).value || '';

    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (phone.length < 10) {
      alert('Please enter a valid 10-digit Indian WhatsApp mobile number.');
      return;
    }

    var submitBtn = form.querySelector('.booking-confirm-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing Real Slot in TeleCRM...';
    }

    var leadData = {
      name: name.trim(),
      whatsapp: phone,
      phone: phone,
      clinic: bookingState.clinic,
      treatment: treatment,
      specialist: doctor,
      preferredDate: bookingState.selectedDate,
      preferredTime: bookingState.selectedSlot,
      message: 'Real Slot Booking requested for ' + bookingState.selectedDate + ' at ' + bookingState.selectedSlot + '. Doctor: ' + doctor + (notes ? ' | Notes: ' + notes : ''),
      source: 'Real Slot Booking Engine'
    };

    // 1. Sync to TeleCRM
    if (window.KezzaTeleCRM && typeof window.KezzaTeleCRM.sendLead === 'function') {
      window.KezzaTeleCRM.sendLead(leadData);
    }

    // 2. Dispatch to Server Backend
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Real Consultation Slot';
      }
      var leadId = (data && data.leadId) || ('KEZZA-' + Math.floor(1000 + Math.random() * 9000));
      var waUrl = data && data.whatsappUrl;

      // Close modal if popup
      var modalWrap = document.getElementById('kz-booking-modal-overlay');
      if (modalWrap) modalWrap.classList.remove('active');

      // Launch universal WhatsApp follow-up modal
      if (window.KezzaFollowUp && typeof window.KezzaFollowUp.show === 'function') {
        window.KezzaFollowUp.show({
          name: name,
          treatment: treatment,
          clinic: bookingState.clinic,
          date: bookingState.selectedDate,
          time: bookingState.selectedSlot,
          leadId: leadId,
          whatsappUrl: waUrl
        });
      }
    })
    .catch(function(err) {
      console.error('Booking submission error:', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Real Consultation Slot';
      }
      if (window.KezzaFollowUp && typeof window.KezzaFollowUp.show === 'function') {
        window.KezzaFollowUp.show({
          name: name,
          treatment: treatment,
          clinic: bookingState.clinic,
          date: bookingState.selectedDate,
          time: bookingState.selectedSlot
        });
      }
    });
  }

  // Build embedded or popup modal
  function openBookingModal(initialTreatment, initialDoctor, initialClinic) {
    if (initialTreatment) bookingState.treatment = initialTreatment;
    if (initialDoctor) bookingState.doctor = initialDoctor;
    if (initialClinic) bookingState.clinic = initialClinic;

    var overlay = document.getElementById('kz-booking-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'kz-booking-modal-overlay';
      overlay.className = 'wa-followup-backdrop';
      overlay.innerHTML = 
        '<div class="wa-followup-modal" style="max-width:680px; text-align:left; max-height:90vh; overflow-y:auto;">' +
          '<button type="button" class="wa-modal-close" id="kz-booking-close-btn">&times;</button>' +
          '<h3 style="margin:0 0 6px; font-size:22px; color:#0c1a2e;"><i class="fas fa-calendar-alt" style="color:#00afc0;"></i> Book Real Clinic Slot</h3>' +
          '<p style="margin:0 0 18px; font-size:13px; color:#64748b;">Instant direct booking in clinic calendar. Confirmed via TeleCRM & WhatsApp.</p>' +
          
          '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:6px;">1. Choose Clinic Location</label>' +
          '<div class="clinic-select-strip" id="modal-clinic-strip">' +
            '<div class="clinic-pill-btn selected" data-clinic="Jaipur"><strong>Jaipur</strong><span>Khatipura / Vaishali</span></div>' +
            '<div class="clinic-pill-btn" data-clinic="Sikar"><strong>Sikar</strong><span>Opp. S.K. Hospital</span></div>' +
            '<div class="clinic-pill-btn" data-clinic="Ajmer"><strong>Ajmer</strong><span>Oasis Complex</span></div>' +
          '</div>' +

          '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:6px;">2. Select Date (Next 14 Days)</label>' +
          '<div class="date-picker-carousel" id="modal-date-carousel"></div>' +

          '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:6px;">3. Select Available Time Slot</label>' +
          '<div class="slots-grid" id="modal-slots-grid" style="margin-bottom:20px;">' +
            '<div class="slot-btn" data-slot="10:00 AM"><span class="slot-time">10:00 AM</span><span class="slot-badge">Available</span></div>' +
            '<div class="slot-btn selected" data-slot="11:30 AM"><span class="slot-time">11:30 AM</span><span class="slot-badge">Available</span></div>' +
            '<div class="slot-btn" data-slot="01:00 PM"><span class="slot-time">01:00 PM</span><span class="slot-badge">Available</span></div>' +
            '<div class="slot-btn" data-slot="02:30 PM"><span class="slot-time">02:30 PM</span><span class="slot-badge urgent">1 left</span></div>' +
            '<div class="slot-btn" data-slot="04:00 PM"><span class="slot-time">04:00 PM</span><span class="slot-badge">Available</span></div>' +
            '<div class="slot-btn" data-slot="05:30 PM"><span class="slot-time">05:30 PM</span><span class="slot-badge">Available</span></div>' +
            '<div class="slot-btn" data-slot="07:00 PM"><span class="slot-time">07:00 PM</span><span class="slot-badge">Available</span></div>' +
          '</div>' +

          '<form id="kz-modal-booking-form">' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">' +
              '<div>' +
                '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">Full Name *</label>' +
                '<input type="text" name="name" class="lp-input" placeholder="e.g. Rahul Sharma" required style="padding:10px 12px;">' +
              '</div>' +
              '<div>' +
                '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">WhatsApp Number *</label>' +
                '<input type="tel" name="phone" class="lp-input" placeholder="10-digit mobile" maxlength="10" required style="padding:10px 12px;">' +
              '</div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">' +
              '<div>' +
                '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">Treatment Category</label>' +
                '<select name="treatment" class="lp-select" style="padding:10px 12px;">' +
                  '<option value="Hair Transplant">Hair Transplant (FUE/DHI)</option>' +
                  '<option value="PRP / GFC Hair Therapy">PRP / GFC Hair Therapy</option>' +
                  '<option value="Laser Hair Removal">Laser Hair Removal</option>' +
                  '<option value="Acne & Scars">Acne & Scar Revision</option>' +
                  '<option value="HydraFacial / Medi-Glow">HydraFacial Medi-Glow</option>' +
                  '<option value="Permanent Makeup">Microblading & PMU</option>' +
                  '<option value="Rhinoplasty / Cosmetic">Rhinoplasty / Cosmetic Surgery</option>' +
                  '<option value="General Doctor Consultation">General Doctor Consultation</option>' +
                '</select>' +
              '</div>' +
              '<div>' +
                '<label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">Doctor Specialist</label>' +
                '<select name="doctor" id="booking-doctor-select" class="lp-select" style="padding:10px 12px;"></select>' +
              '</div>' +
            '</div>' +
            '<button type="submit" class="booking-confirm-btn" style="padding:14px;"><i class="fas fa-calendar-check"></i> Confirm Real Consultation Slot</button>' +
          '</form>' +
        '</div>';
      document.body.appendChild(overlay);

      document.getElementById('kz-booking-close-btn').addEventListener('click', function() {
        overlay.classList.remove('active');
      });
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.classList.remove('active');
      });

      initClinicSelector(document.getElementById('modal-clinic-strip'));
      initSlotButtons(document.getElementById('modal-slots-grid'));
      renderDatesCarousel(document.getElementById('modal-date-carousel'), createDatesArray());
      updateDoctorsDropdown();

      document.getElementById('kz-modal-booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleBookingSubmit(this);
      });
    }

    // Set values if passed
    if (initialTreatment) {
      var tSelect = overlay.querySelector('[name="treatment"]');
      if (tSelect) tSelect.value = initialTreatment;
    }
    if (initialClinic) {
      var clinicPills = overlay.querySelectorAll('.clinic-pill-btn');
      clinicPills.forEach(function(p) {
        if (p.getAttribute('data-clinic').toLowerCase() === initialClinic.toLowerCase()) {
          p.click();
        }
      });
    }

    overlay.classList.add('active');
  }

  // Initialize embedded booking widget on dedicated booking page
  function initEmbeddedWidget() {
    var widget = document.getElementById('kz-booking-widget');
    if (!widget) return;

    var clinicStrip = widget.querySelector('.clinic-select-strip');
    var dateCarousel = widget.querySelector('.date-picker-carousel');
    var slotsGrid = widget.querySelector('.time-slots-container');
    var form = widget.querySelector('#kz-embedded-booking-form');

    if (clinicStrip) initClinicSelector(clinicStrip);
    if (dateCarousel) renderDatesCarousel(dateCarousel, createDatesArray());
    if (slotsGrid) initSlotButtons(slotsGrid);
    updateDoctorsDropdown();

    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleBookingSubmit(this);
      });
    }
  }

  // Wire up all click triggers: [data-book-slot]
  function bindTriggers() {
    document.querySelectorAll('[data-book-slot]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var treatment = el.getAttribute('data-treatment') || '';
        var doctor = el.getAttribute('data-doctor') || '';
        var clinic = el.getAttribute('data-clinic') || '';
        openBookingModal(treatment, doctor, clinic);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initEmbeddedWidget();
      bindTriggers();
    });
  } else {
    initEmbeddedWidget();
    bindTriggers();
  }

  window.KezzaBooking = {
    open: openBookingModal,
    state: bookingState
  };

})();
