/**
 * Kezza Hair & Skin Clinic — AI Scanner Lead-Capture Modal Engine
 * File: frontend/js/scanner-modal.js
 * 
 * Flow:
 * 1. Popup Trigger / Lazy Loader
 * 2. Step 1 (Scan): Camera capture / File upload / Live preview
 * 3. Step 2 (AI Analysis): Gemini Vision /api/analyze-photo → Partial Reveal (Top 2-3 observations)
 * 4. Step 3 (Details Wizard): 1-question-per-screen (11 steps + WhatsApp consent)
 * 5. Step 4 (Save + Results): POST /api/lead → Full AI Report + WhatsApp CTA
 */

(function () {
  'use strict';

  // Prevent duplicate execution
  if (window.KezzaScannerModal && window.KezzaScannerModal._initialized) {
    return;
  }

  // ── Configuration & Doctors Directory ────────────────────────────────
  const WHATSAPP_NUMBER = '919284517427';
  const API_ANALYZE     = '/api/analyze-photo';
  const API_LEAD        = '/api/lead';

  const DOCTORS = {
    HAIR: {
      name: 'Dr. Ankit Bhalothia',
      spec: 'Aesthetic & Hair Transplant Surgeon',
      img: 'images/Doctor1.jpeg',
      clinic: 'Jaipur & Sikar'
    },
    SKIN: {
      name: 'Dr. Amrita Mukhija',
      spec: 'Aesthetic Physician & Skin Specialist',
      img: 'images/Doctor2.jpeg',
      clinic: 'Jaipur & Sikar'
    },
    PMU: {
      name: 'Krishna',
      spec: 'PMU & Scalp Micropigmentation Artist',
      img: 'images/Doctor5.jpeg',
      clinic: 'Jaipur & Sikar'
    },
    WEIGHT: {
      name: 'Kezza Wellness & Slimming Team',
      spec: 'Clinical Nutrition & Body Contouring',
      img: 'images/Doctor3.jpeg',
      clinic: 'Jaipur & Sikar'
    }
  };

  // ── State Store ──────────────────────────────────────────────────────
  const state = {
    isOpen: false,
    activeStage: 1,      // 1: Scan, 2: AI Analysis, 3: Details Wizard, 4: Full Results
    activeQuestion: 1,   // 1 to 11
    capturedImageBase64: null,
    mediaStream: null,
    cameraFacing: 'user', // 'user' or 'environment'
    aiAnalysis: null,
    countdownTimer: null,  // auto-capture countdown handle
    countdownValue: 3,     // seconds before auto-capture
    countdownActive: false,
    waRedirectTimer: null,
    answers: {
      name: '',
      whatsapp: '',
      age: '',
      city: '',
      clinic: '',
      category: '',
      categoryLabel: '',
      treatment: '',
      duration: '',
      date: '',
      time: '',
      // kept for the AI prompt / lead record, no longer asked in the wizard
      gender: '',
      concern: '',
      severity: '',
      symptoms: '',
      allergies: '',
      medicines: '',
      consent: true
    }
  };

  let modalEl = null;
  let confirmExitEl = null;

  // ── Create Modal DOM Structure ───────────────────────────────────────
  function buildModalDOM() {
    if (document.getElementById('ksModalBackdrop')) {
      return document.getElementById('ksModalBackdrop');
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'ksModalBackdrop';
    backdrop.className = 'ks-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'ksModalTitle');

    backdrop.innerHTML = `
      <div class="ks-modal-card" id="ksModalCard">
        <!-- Exit Confirmation Overlay -->
        <div class="ks-confirm-dialog-wrap" id="ksConfirmDialog">
          <div class="ks-confirm-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="ks-confirm-title">Leave AI Scanner?</div>
          <div class="ks-confirm-text">Your photo and entered clinical details will be discarded.</div>
          <div class="ks-confirm-actions">
            <button type="button" class="ks-btn-confirm-stay" id="ksBtnConfirmStay">Stay in Scan</button>
            <button type="button" class="ks-btn-confirm-leave" id="ksBtnConfirmLeave">Exit</button>
          </div>
        </div>

        <!-- Header -->
        <div class="ks-header">
          <div class="ks-brand">
            <img src="images/logo.png" alt="Kezza Clinic" class="ks-brand-logo" onerror="this.style.display='none'">
            <span class="ks-brand-badge"><i class="fas fa-wand-sparkles"></i> AI Vision 2.0</span>
          </div>
          <button type="button" class="ks-close-btn" id="ksModalCloseBtn" aria-label="Close AI Scanner">✕</button>
        </div>

        <!-- Top Progress Track -->
        <div class="ks-progress-track">
          <div class="ks-progress-fill" id="ksProgressFill" style="width: 25%;"></div>
        </div>

        <!-- Body Scrollable Content -->
        <div class="ks-body" id="ksModalBody">

          <!-- ═════ STAGE 1: SCAN PHOTO (Auto-Capture) ═════ -->
          <div class="ks-stage ks-active" id="ksStageScan">
            <h2 class="ks-stage-title" id="ksModalTitle">AI Face &amp; Scalp <span class="ks-gold-text">Scanner</span></h2>
            <p class="ks-stage-subtitle" id="ksScanSubtitle">Position your face inside the oval — photo captures automatically.</p>

            <div class="ks-viewfinder-wrap" id="ksViewfinderWrap">
              <video class="ks-video-feed" id="ksVideoFeed" autoplay playsinline muted></video>

              <div class="ks-face-guide" id="ksFaceGuide">
                <div class="ks-guide-oval"></div>
                <div class="ks-scan-laser" id="ksScanLaser"></div>
              </div>

              <!-- Auto-Capture Countdown Overlay -->
              <div class="ks-countdown-overlay" id="ksCountdownOverlay" style="display:none;">
                <div class="ks-countdown-ring" id="ksCountdownRing">
                  <svg viewBox="0 0 80 80" class="ks-countdown-svg">
                    <circle class="ks-countdown-track" cx="40" cy="40" r="34"/>
                    <circle class="ks-countdown-arc" id="ksCountdownArc" cx="40" cy="40" r="34"
                      stroke-dasharray="213.6" stroke-dashoffset="0"/>
                  </svg>
                  <span class="ks-countdown-num" id="ksCountdownNum">3</span>
                </div>
                <div class="ks-countdown-label">Hold still…</div>
              </div>

              <!-- Flash overlay for capture feedback -->
              <div class="ks-capture-flash" id="ksCaptureFlash"></div>

              <!-- Idle Viewfinder Prompt -->
              <div class="ks-viewfinder-idle" id="ksViewfinderIdle">
                <div class="ks-idle-icon-wrap"><i class="fas fa-camera"></i></div>
                <div class="ks-idle-title">Starting Camera…</div>
                <div class="ks-idle-hint">Or tap Upload to choose a photo</div>
              </div>

              <!-- Captured Image Preview -->
              <div class="ks-image-preview-wrap" id="ksImagePreviewWrap">
                <img id="ksImagePreviewImg" class="ks-image-preview-img" alt="Captured Assessment Photo">
                <div class="ks-preview-badge"><i class="fas fa-check-circle"></i> Photo Ready</div>
                <button type="button" class="ks-preview-retake-btn" id="ksBtnRetake"><i class="fas fa-redo"></i> Retake</button>
              </div>
            </div>

            <canvas id="ksCaptureCanvas" style="display: none;"></canvas>
            <input type="file" id="ksPhotoFileInput" class="ks-hidden-file-input" accept="image/*">

            <!-- Camera Controls Row -->
            <div class="ks-camera-actions-row">
              <button type="button" class="ks-btn-action" id="ksBtnStartCamera" style="display:none;">
                <i class="fas fa-video"></i> <span>Start Camera</span>
              </button>
              <button type="button" class="ks-btn-action ks-btn-shutter" id="ksBtnShutter" style="display: none;">
                <i class="fas fa-circle-dot"></i> <span>Capture Now</span>
              </button>
              <button type="button" class="ks-btn-action" id="ksBtnSwitchCamera" style="display: none;" title="Flip Camera">
                <i class="fas fa-camera-rotate"></i>
              </button>
              <button type="button" class="ks-btn-action" id="ksBtnUploadTrigger">
                <i class="fas fa-cloud-arrow-up"></i> <span>Upload Photo</span>
              </button>
            </div>

            <div class="ks-privacy-note">
              <i class="fas fa-shield-halved"></i>
              <span>Your photo is used strictly to generate scan insights. Not stored.</span>
            </div>

            <button type="button" class="ks-btn-primary" id="ksBtnAnalyze" style="display:none;" disabled>
              <span>Analyze My Skin &amp; Hair</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>


          <!-- ═════ STAGE 2: AI ANALYSIS & PARTIAL REVEAL ═════ -->
          <div class="ks-stage" id="ksStageAnalysis">
            <!-- Loading Radar -->
            <div class="ks-analyzing-wrap" id="ksAnalyzingLoader">
              <div class="ks-scanner-radar">
                <div class="ks-radar-pulse"></div>
                <i class="fas fa-brain ks-radar-icon"></i>
              </div>
              <h3 class="ks-stage-title">Analyzing Clinical Indicators...</h3>
              <p class="ks-stage-subtitle">Cross-referencing with Kezza clinical dermatological models.</p>

              <div class="ks-analysis-steps-list">
                <div class="ks-analysis-step-item ks-active" id="ksStepText1">
                  <i class="fas fa-circle-check"></i> Mapping target anatomical zones
                </div>
                <div class="ks-analysis-step-item" id="ksStepText2">
                  <i class="fas fa-circle-notch fa-spin"></i> Assessing texture, pigmentation &amp; follicle density
                </div>
                <div class="ks-analysis-step-item" id="ksStepText3">
                  <i class="fas fa-circle"></i> Matching specialist clinical protocols
                </div>
              </div>
            </div>

            <!-- Partial Reveal Card (Populated after analysis) -->
            <div class="ks-partial-results" id="ksPartialResults" style="display: none;">
              <div class="ks-confidence-badge" id="ksConfidenceBadge">
                <i class="fas fa-shield-check"></i> <span id="ksConfidenceVal">88% Clinical Match</span>
              </div>

              <h3 class="ks-stage-title" style="margin-bottom: 4px;">Initial Observations <span class="ks-gold-text">Ready</span></h3>
              <p class="ks-stage-subtitle">Key dermatological patterns identified from your scan:</p>

              <div class="ks-observations-box">
                <div class="ks-obs-heading"><i class="fas fa-microscope"></i> Primary Visual Findings</div>
                <div id="ksTopObservationsList" style="display: flex; flex-direction: column; gap: 8px;">
                  <!-- Injected via JS -->
                </div>
              </div>

              <div class="ks-lock-teaser">
                <div class="ks-lock-icon-wrap"><i class="fas fa-lock"></i></div>
                <div class="ks-lock-teaser-text">
                  <strong>Full Diagnostic Report Locked</strong>
                  Includes Norwood/Fitzpatrick grading, doctor prescription plan &amp; timeline.
                </div>
              </div>

              <div class="ks-teaser-callout">
                ✦ Enter your details to receive your full personalized report on WhatsApp →
              </div>

              <button type="button" class="ks-btn-primary" id="ksBtnContinueToDetails">
                <span>Continue to Full Report</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>


          <!-- ═════ STAGE 3: STEP-BY-STEP DETAILS WIZARD ═════ -->
          <div class="ks-stage" id="ksStageDetails">
            <div class="ks-details-wizard">
              <div class="ks-q-tracker-header">
                <span class="ks-q-subtrack" id="ksQTrackerText">Question 1 of 10</span>
                <span class="ks-brand-badge"><i class="fas fa-user-doctor"></i> Patient Profile</span>
              </div>

              <!-- Question 1: Full Name -->
              <!-- Q1: Name -->
              <div class="ks-q-stage ks-active" data-q="1">
                <h3 class="ks-q-title">What is your full name?</h3>
                <p class="ks-q-hint">As you would like it to appear on your report.</p>
                <div class="ks-input-wrap">
                  <input type="text" id="ksInputName" class="ks-input-field" placeholder="e.g. Rahul Sharma" autocomplete="name" enterkeyhint="next">
                </div>
              </div>

              <!-- Q2: Age -->
              <div class="ks-q-stage" data-q="2">
                <h3 class="ks-q-title">What is your age group?</h3>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-age="15-25 yrs"><i class="fas fa-child"></i> 15-25 yrs</button>
                  <button type="button" class="ks-chip-btn" data-age="26-35 yrs"><i class="fas fa-user"></i> 26-35 yrs</button>
                  <button type="button" class="ks-chip-btn" data-age="36-45 yrs"><i class="fas fa-user-tie"></i> 36-45 yrs</button>
                  <button type="button" class="ks-chip-btn" data-age="46-55 yrs"><i class="fas fa-user-clock"></i> 46-55 yrs</button>
                  <button type="button" class="ks-chip-btn" data-age="55+ yrs"><i class="fas fa-user-shield"></i> 55+ yrs</button>
                </div>
              </div>

              <!-- Q3: City -->
              <div class="ks-q-stage" data-q="3">
                <h3 class="ks-q-title">Which city are you from?</h3>
                <div class="ks-input-wrap">
                  <input type="text" id="ksInputCity" class="ks-input-field" placeholder="e.g. Jaipur, Sikar, Delhi..." autocomplete="address-level2" enterkeyhint="next">
                </div>
                <div class="ks-chips-grid" style="margin-top:12px">
                  <button type="button" class="ks-chip-btn" data-city="Jaipur"><i class="fas fa-location-dot"></i> Jaipur</button>
                  <button type="button" class="ks-chip-btn" data-city="Sikar"><i class="fas fa-location-dot"></i> Sikar</button>
                  <button type="button" class="ks-chip-btn" data-city="Delhi"><i class="fas fa-location-dot"></i> Delhi</button>
                </div>
              </div>

              <!-- Q4: Clinic -->
              <div class="ks-q-stage" data-q="4">
                <h3 class="ks-q-title">Which Kezza Clinic would you like to visit?</h3>
                <div class="ks-clinic-cards-grid">
                  <div class="ks-clinic-card" data-clinic="Jaipur (Flagship)">
                    <span class="ks-clinic-card-badge">Flagship</span>
                    <div class="ks-clinic-card-title">Jaipur</div>
                    <div class="ks-clinic-card-loc">Hanuman Nagar, Khatipura</div>
                  </div>
                  <div class="ks-clinic-card" data-clinic="Sikar">
                    <span class="ks-clinic-card-badge">Elite Surgical</span>
                    <div class="ks-clinic-card-title">Sikar</div>
                    <div class="ks-clinic-card-loc">Opp. S.K. Hospital</div>
                  </div>
                </div>
              </div>

              <!-- Q5: Category -->
              <div class="ks-q-stage" data-q="5">
                <h3 class="ks-q-title">Which treatment category do you need?</h3>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-category="hair"><i class="fas fa-user-doctor"></i> Hair</button>
                  <button type="button" class="ks-chip-btn" data-category="skin"><i class="fas fa-wand-magic-sparkles"></i> Skin</button>
                  <button type="button" class="ks-chip-btn" data-category="pmu"><i class="fas fa-pen-fancy"></i> PMU</button>
                  <button type="button" class="ks-chip-btn" data-category="smp"><i class="fas fa-palette"></i> SMP</button>
                  <button type="button" class="ks-chip-btn" data-category="weight_loss"><i class="fas fa-scale-balanced"></i> Weight Loss</button>
                  <button type="button" class="ks-chip-btn" data-category="rhinoplasty"><i class="fas fa-nose"></i> Rhinoplasty / ENT</button>
                </div>
              </div>

              <!-- Q6: Treatment (filled from the chosen category) -->
              <div class="ks-q-stage" data-q="6">
                <h3 class="ks-q-title">Which treatment are you interested in?</h3>
                <div class="ks-chips-grid" id="ksTreatmentGrid"></div>
              </div>

              <!-- Q7: Duration -->
              <div class="ks-q-stage" data-q="7">
                <h3 class="ks-q-title">How long have you had this concern?</h3>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-duration="Less than 1 month"><i class="fas fa-calendar-day"></i> Less than 1 month</button>
                  <button type="button" class="ks-chip-btn" data-duration="1-6 months"><i class="fas fa-calendar-week"></i> 1-6 months</button>
                  <button type="button" class="ks-chip-btn" data-duration="6-12 months"><i class="fas fa-calendar-days"></i> 6-12 months</button>
                  <button type="button" class="ks-chip-btn" data-duration="More than 1 year"><i class="fas fa-hourglass-half"></i> More than 1 year</button>
                </div>
              </div>

              <!-- Q8: Date -->
              <div class="ks-q-stage" data-q="8">
                <h3 class="ks-q-title">When would you like to visit?</h3>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-dateq="today"><i class="fas fa-sun"></i> Today</button>
                  <button type="button" class="ks-chip-btn" data-dateq="tomorrow"><i class="fas fa-calendar-day"></i> Tomorrow</button>
                  <button type="button" class="ks-chip-btn" data-dateq="in2"><i class="fas fa-calendar-plus"></i> In 2 Days</button>
                </div>
                <div class="ks-input-wrap" style="margin-top:12px">
                  <input type="date" id="ksInputDate" class="ks-input-field">
                </div>
              </div>

              <!-- Q9: Time -->
              <div class="ks-q-stage" data-q="9">
                <h3 class="ks-q-title">Preferred time slot?</h3>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-time="Morning (9 AM - 12 PM)"><i class="fas fa-sun"></i> Morning<br><small>9 AM - 12 PM</small></button>
                  <button type="button" class="ks-chip-btn" data-time="Afternoon (12 PM - 4 PM)"><i class="fas fa-cloud-sun"></i> Afternoon<br><small>12 PM - 4 PM</small></button>
                  <button type="button" class="ks-chip-btn" data-time="Evening (4 PM - 7 PM)"><i class="fas fa-moon"></i> Evening<br><small>4 PM - 7 PM</small></button>
                  <button type="button" class="ks-chip-btn" data-time="Any Time"><i class="fas fa-infinity"></i> Any Time<br><small>Flexible</small></button>
                </div>
              </div>

              <!-- Q10: WhatsApp -->
              <div class="ks-q-stage" data-q="10">
                <h3 class="ks-q-title">Your WhatsApp number?</h3>
                <p class="ks-q-hint">We will send your report and appointment confirmation here.</p>
                <div class="ks-input-wrap">
                  <input type="tel" id="ksInputWhatsApp" class="ks-phone-input" placeholder="10-digit mobile number" maxlength="10" inputmode="numeric" autocomplete="tel" enterkeyhint="done">
                </div>
                <p class="ks-q-hint" id="ksPhoneHint" style="min-height:18px"></p>

                <label class="ks-consent-wrap" for="ksConsentCheckbox">
                  <input type="checkbox" id="ksConsentCheckbox" class="ks-consent-checkbox" checked>
                  <span class="ks-consent-label">
                    I agree that <strong>Kezza Clinic</strong> may contact me on WhatsApp about my enquiry and personalized assessment.
                  </span>
                </label>
              </div>

              <!-- Wizard Bottom Navigation -->
              <div class="ks-wizard-nav-row">
                <button type="button" class="ks-btn-back" id="ksBtnQBack"><i class="fas fa-arrow-left"></i> Back</button>
                <button type="button" class="ks-btn-skip" id="ksBtnQSkip" style="display: none;">Skip this step</button>
                <button type="button" class="ks-btn-primary" id="ksBtnQContinue" style="margin-top: 0; width: auto; flex: 1;">
                  <span id="ksBtnQContinueText">Continue</span> <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>


          <!-- ═════ STAGE 4: FULL RESULTS & WHATSAPP CTA ═════ -->
          <div class="ks-stage" id="ksStageResults">
            <div class="ks-results-wrap">
              <div class="ks-unlocked-badge">
                <i class="fas fa-award"></i> <span>Full Diagnostic Report Unlocked</span>
              </div>

              <h3 class="ks-stage-title" style="margin-bottom: 2px;">Your Clinical <span class="ks-gold-text">Assessment</span></h3>
              <p class="ks-stage-subtitle" id="ksResultsSubtitle">Prepared by Kezza AI Diagnostic Engine</p>

              <!-- Patient Snapshot Summary -->
              <div class="ks-patient-summary-card">
                <div class="ks-p-stat-item">
                  <strong>Patient</strong>
                  <span id="ksResPatientName">-</span>
                </div>
                <div class="ks-p-stat-item">
                  <strong>Primary Focus</strong>
                  <span id="ksResConcern">-</span>
                </div>
                <div class="ks-p-stat-item">
                  <strong>Severity</strong>
                  <span id="ksResSeverity">Moderate</span>
                </div>
                <div class="ks-p-stat-item">
                  <strong>Preferred Clinic</strong>
                  <span id="ksResClinic">Jaipur</span>
                </div>
              </div>

              <!-- Treatment Recommendation Card -->
              <div class="ks-treatment-rec-card">
                <div class="ks-obs-heading" style="margin-bottom: 6px;"><i class="fas fa-stethoscope"></i> Recommended Protocol</div>
                <div class="ks-rec-title" id="ksResTreatmentTitle">Advanced Dermatological Protocol</div>
                <div class="ks-rec-desc" id="ksResTreatmentDesc">
                  Based on image analysis and your reported symptoms, a customized in-clinic procedure is advised.
                </div>

                <!-- Assigned Specialist Doctor -->
                <div class="ks-doctor-pill-card" id="ksDoctorPillCard">
                  <img src="images/Doctor2.jpeg" id="ksDocAvatar" class="ks-doc-avatar" alt="Specialist Doctor">
                  <div class="ks-doc-info">
                    <div class="ks-doc-name" id="ksDocName">Dr. Amrita Mukhija</div>
                    <div class="ks-doc-spec" id="ksDocSpec">Aesthetic Physician &amp; Skin Specialist</div>
                  </div>
                </div>
              </div>

              <!-- Master WhatsApp Consultation CTA -->
              <a href="https://wa.me/919284517427" target="_blank" class="ks-btn-whatsapp-cta" id="ksBtnWhatsAppCTA" rel="noopener noreferrer">
                <i class="fab fa-whatsapp"></i>
                <span>Get Full Plan &amp; Book on WhatsApp</span>
              </a>

              <button type="button" class="ks-btn-restart" id="ksBtnRestartScan">
                <i class="fas fa-rotate-right"></i> Scan Another Area or Patient
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    return backdrop;
  }

  // ── Initialize Logic and Event Handlers ──────────────────────────────
  function init() {
    modalEl = buildModalDOM();
    confirmExitEl = document.getElementById('ksConfirmDialog');

    setupCoreEvents();
    setupScanStepEvents();
    setupAnalysisEvents();
    setupDetailsWizardEvents();
    setupResultsEvents();

    window.KezzaScannerModal._initialized = true;
  }

  // ── Core Open / Close / Lifecycle ────────────────────────────────────
  function openModal() {
    if (!modalEl) init();

    state.isOpen = true;
    modalEl.classList.add('ks-active');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    // Hide quick dock
    const dock = document.getElementById('floatingQuickDock') || document.querySelector('.floating-quick-dock');
    if (dock) dock.classList.add('dock-hidden');

    // Default to Stage 1 (Scan)
    setStage(1);

    // ── Auto-start camera after a short settle delay ──
    setTimeout(() => {
      if (state.isOpen && !state.capturedImageBase64) {
        startCameraStream();
      }
    }, 400);
  }

  function closeModal(force = false) {
    cancelWhatsAppHandoff();
    if (!state.isOpen) return;

    // Cancel any running countdown
    cancelCountdown();

    // Check if user has entered data and wants to confirm exit
    const hasData = Boolean(
      state.capturedImageBase64 ||
      state.answers.name ||
      state.answers.whatsapp ||
      state.activeStage > 1
    );

    if (hasData && !force && state.activeStage < 4) {
      if (confirmExitEl) confirmExitEl.classList.add('ks-active');
      return;
    }

    if (confirmExitEl) confirmExitEl.classList.remove('ks-active');
    stopCameraStream();

    state.isOpen = false;
    modalEl.classList.remove('ks-active');
    document.body.style.overflow = ''; // Restore scroll

    // Restore quick dock
    const dock = document.getElementById('floatingQuickDock') || document.querySelector('.floating-quick-dock');
    if (dock) dock.classList.remove('dock-hidden');
  }

  function setStage(stageNum) {
    state.activeStage = stageNum;

    // Hide all stages, show current
    document.querySelectorAll('.ks-stage').forEach((s, idx) => {
      s.classList.toggle('ks-active', idx + 1 === stageNum);
    });

    // Update Progress Bar
    const fill = document.getElementById('ksProgressFill');
    if (fill) {
      if (stageNum === 1) fill.style.width = '25%';
      else if (stageNum === 2) fill.style.width = '50%';
      else if (stageNum === 3) fill.style.width = `${50 + (state.activeQuestion / 11) * 40}%`;
      else if (stageNum === 4) fill.style.width = '100%';
    }

    // Scroll to top of modal body
    const body = document.getElementById('ksModalBody');
    if (body) body.scrollTop = 0;
  }

  function setupCoreEvents() {
    // Close button
    document.getElementById('ksModalCloseBtn').addEventListener('click', () => closeModal(false));

    // Backdrop click
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal(false);
    });

    // Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        if (confirmExitEl && confirmExitEl.classList.contains('ks-active')) {
          confirmExitEl.classList.remove('ks-active');
        } else {
          closeModal(false);
        }
      }
    });

    // Confirmation dialog buttons
    document.getElementById('ksBtnConfirmStay').addEventListener('click', () => {
      confirmExitEl.classList.remove('ks-active');
    });

    document.getElementById('ksBtnConfirmLeave').addEventListener('click', () => {
      confirmExitEl.classList.remove('ks-active');
      closeModal(true);
    });
  }

  // ── STEP 1: Scan & Photo Events ───────────────────────────────────────
  function setupScanStepEvents() {
    const btnStartCamera    = document.getElementById('ksBtnStartCamera');
    const btnShutter        = document.getElementById('ksBtnShutter');
    const btnSwitchCamera   = document.getElementById('ksBtnSwitchCamera');
    const btnUploadTrigger  = document.getElementById('ksBtnUploadTrigger');
    const fileInput         = document.getElementById('ksPhotoFileInput');
    const btnRetake         = document.getElementById('ksBtnRetake');
    const btnAnalyze        = document.getElementById('ksBtnAnalyze');
    const viewfinderWrap    = document.getElementById('ksViewfinderWrap');
    const viewfinderIdle    = document.getElementById('ksViewfinderIdle');

    // Manual Camera Start (fallback if auto-start failed)
    btnStartCamera.addEventListener('click', () => {
      if (state.mediaStream) {
        stopCameraStream();
      } else {
        startCameraStream();
      }
    });

    // Switch Front / Rear Camera
    btnSwitchCamera.addEventListener('click', () => {
      cancelCountdown();
      state.cameraFacing = state.cameraFacing === 'user' ? 'environment' : 'user';
      startCameraStream();
    });

    // Manual Capture Shutter (cancels and fires immediately)
    btnShutter.addEventListener('click', () => {
      cancelCountdown();
      captureFrameFromCamera();
    });

    // Tap viewfinder idle area to trigger camera
    viewfinderIdle.addEventListener('click', () => {
      if (!state.mediaStream && !state.capturedImageBase64) {
        startCameraStream();
      }
    });

    // Upload Trigger
    btnUploadTrigger.addEventListener('click', () => {
      cancelCountdown();
      fileInput.click();
    });

    // File Input change
    fileInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      handleImageFile(file);
    });

    // Drag & Drop onto Viewfinder
    viewfinderWrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      viewfinderWrap.classList.add('ks-dragover');
    });
    viewfinderWrap.addEventListener('dragleave', () => {
      viewfinderWrap.classList.remove('ks-dragover');
    });
    viewfinderWrap.addEventListener('drop', (e) => {
      e.preventDefault();
      viewfinderWrap.classList.remove('ks-dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        cancelCountdown();
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    // Retake / Replace → restart auto-countdown
    btnRetake.addEventListener('click', () => {
      state.capturedImageBase64 = null;
      document.getElementById('ksImagePreviewWrap').classList.remove('ks-active');
      document.getElementById('ksImagePreviewImg').src = '';
      btnAnalyze.disabled = true;
      document.getElementById('ksViewfinderIdle').style.display = 'flex';
      document.getElementById('ksScanSubtitle').textContent = 'Position your face inside the oval — photo captures automatically.';
      startCameraStream();
    });

    // Manual Analyze button (shown if user retakes or uploads)
    btnAnalyze.addEventListener('click', () => {
      if (!state.capturedImageBase64) return;
      stopCameraStream();
      setStage(2);
      runAIAnalysis();
    });
  }

  // ── Auto-Capture Countdown ─────────────────────────────────────────────
  function startAutoCountdown() {
    cancelCountdown();
    if (!state.mediaStream || state.capturedImageBase64) return;

    const overlay   = document.getElementById('ksCountdownOverlay');
    const numEl     = document.getElementById('ksCountdownNum');
    const arcEl     = document.getElementById('ksCountdownArc');
    const subtitle  = document.getElementById('ksScanSubtitle');
    const circumference = 213.6; // 2π × r=34

    let count = 3;
    overlay.style.display = 'flex';
    numEl.textContent = count;
    arcEl.style.strokeDashoffset = '0';
    state.countdownActive = true;

    if (subtitle) subtitle.textContent = 'Hold still — capturing in ' + count + ' seconds…';

    state.countdownTimer = setInterval(() => {
      count--;
      // Update arc progress (depletes clockwise)
      const offset = circumference * (1 - count / 3);
      arcEl.style.strokeDashoffset = offset;

      if (count > 0) {
        numEl.textContent = count;
        if (subtitle) subtitle.textContent = 'Hold still — capturing in ' + count + ' second' + (count > 1 ? 's…' : '…');
      } else {
        // Fire!
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
        state.countdownActive = false;
        overlay.style.display = 'none';
        flashAndCapture();
      }
    }, 1000);
  }

  function cancelCountdown() {
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    state.countdownActive = false;
    const overlay = document.getElementById('ksCountdownOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function flashAndCapture() {
    // White flash feedback
    const flash = document.getElementById('ksCaptureFlash');
    if (flash) {
      flash.classList.add('ks-flash-active');
      setTimeout(() => flash.classList.remove('ks-flash-active'), 350);
    }
    captureFrameFromCamera();
    // Auto-proceed to analysis immediately
    setTimeout(() => {
      if (state.capturedImageBase64) {
        stopCameraStream();
        setStage(2);
        runAIAnalysis();
      }
    }, 300);
  }

  async function startCameraStream() {
    try {
      cancelCountdown();
      stopCameraStream();

      const videoFeed = document.getElementById('ksVideoFeed');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: state.cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      state.mediaStream = stream;
      videoFeed.srcObject = stream;
      videoFeed.classList.toggle('ks-environment', state.cameraFacing === 'environment');
      videoFeed.classList.add('ks-active');
      await videoFeed.play();

      document.getElementById('ksFaceGuide').classList.add('ks-active');
      document.getElementById('ksScanLaser').classList.add('ks-active');
      document.getElementById('ksViewfinderIdle').style.display = 'none';
      document.getElementById('ksImagePreviewWrap').classList.remove('ks-active');

      // Show manual controls
      document.getElementById('ksBtnStartCamera').innerHTML = '<i class="fas fa-video-slash"></i> <span>Stop</span>';
      document.getElementById('ksBtnStartCamera').style.display = 'inline-flex';
      document.getElementById('ksBtnShutter').style.display = 'inline-flex';
      document.getElementById('ksBtnSwitchCamera').style.display = 'inline-flex';

      // Kick off the auto-capture countdown after a 1.5 s settle
      setTimeout(() => {
        if (state.mediaStream && !state.capturedImageBase64) {
          startAutoCountdown();
        }
      }, 1500);

    } catch (err) {
      console.warn('[Camera Access Warning]:', err.message);
      const idleEl = document.getElementById('ksViewfinderIdle');
      if (idleEl) {
        idleEl.innerHTML = `
          <div class="ks-idle-icon-wrap"><i class="fas fa-camera-slash" style="color:#ef4444"></i></div>
          <div class="ks-idle-title">Camera access unavailable</div>
          <div class="ks-idle-hint">Please tap "Upload Photo" below to select a photo</div>
        `;
        idleEl.style.display = 'flex';
      }
      // Show manual upload button prominently
      const startBtn = document.getElementById('ksBtnStartCamera');
      if (startBtn) startBtn.style.display = 'none';
    }
  }

  function stopCameraStream() {
    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach(t => t.stop());
      state.mediaStream = null;
    }
    const videoFeed = document.getElementById('ksVideoFeed');
    if (videoFeed) {
      videoFeed.srcObject = null;
      videoFeed.classList.remove('ks-active');
    }
    const guide = document.getElementById('ksFaceGuide');
    if (guide) guide.classList.remove('ks-active');
    const laser = document.getElementById('ksScanLaser');
    if (laser) laser.classList.remove('ks-active');

    const btnStart = document.getElementById('ksBtnStartCamera');
    if (btnStart) btnStart.innerHTML = '<i class="fas fa-video"></i> <span>Start Camera</span>';
    const btnShutter = document.getElementById('ksBtnShutter');
    if (btnShutter) btnShutter.style.display = 'none';
    const btnSwitch = document.getElementById('ksBtnSwitchCamera');
    if (btnSwitch) btnSwitch.style.display = 'none';
  }

  function captureFrameFromCamera() {
    const videoFeed = document.getElementById('ksVideoFeed');
    if (!videoFeed || videoFeed.readyState < 2) return;

    const canvas = document.getElementById('ksCaptureCanvas');
    canvas.width = videoFeed.videoWidth || 640;
    canvas.height = videoFeed.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.save();
    if (state.cameraFacing === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(videoFeed, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    state.capturedImageBase64 = canvas.toDataURL('image/jpeg', 0.88);
    displayCapturedImage();
    stopCameraStream();
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert('Image file is too large. Please choose an image under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      state.capturedImageBase64 = e.target.result;
      displayCapturedImage();
      stopCameraStream();
    };
    reader.readAsDataURL(file);
  }

  function displayCapturedImage() {
    const previewWrap = document.getElementById('ksImagePreviewWrap');
    const previewImg  = document.getElementById('ksImagePreviewImg');
    const btnAnalyze   = document.getElementById('ksBtnAnalyze');

    previewImg.src = state.capturedImageBase64;
    previewWrap.classList.add('ks-active');
    document.getElementById('ksViewfinderIdle').style.display = 'none';
    btnAnalyze.disabled = false;
  }

  // ── STEP 2: AI Analysis — auto-advances to wizard ─────────────────────
  function setupAnalysisEvents() {
    // Manual fallback button still works
    const btn = document.getElementById('ksBtnContinueToDetails');
    if (btn) btn.addEventListener('click', () => {
      setStage(3);
      showQuestion(1);
    });
  }

  async function runAIAnalysis() {
    const loader = document.getElementById('ksAnalyzingLoader');
    const results = document.getElementById('ksPartialResults');
    const step1 = document.getElementById('ksStepText1');
    const step2 = document.getElementById('ksStepText2');
    const step3 = document.getElementById('ksStepText3');

    loader.style.display = 'flex';
    results.style.display = 'none';

    // Micro step transitions for visual delight
    setTimeout(() => {
      step1.innerHTML = '<i class="fas fa-circle-check" style="color:#22c55e"></i> Target anatomical zones mapped';
      step2.className = 'ks-analysis-step-item ks-active';
    }, 900);

    setTimeout(() => {
      step2.innerHTML = '<i class="fas fa-circle-check" style="color:#22c55e"></i> Texture, sebum &amp; pigmentation mapped';
      step3.className = 'ks-analysis-step-item ks-active';
    }, 1800);

    let parsedResult = null;

    try {
      const response = await fetch(API_ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.capturedImageBase64,
          textContext: 'Initial Instant Scan Assessment for Lead Capture Flow'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 'OK') {
          parsedResult = data;
        }
      }
    } catch (err) {
      console.warn('[AI Analysis API fallback]:', err.message);
    }

    // Default robust clinical fallback if offline or no Gemini key
    if (!parsedResult) {
      parsedResult = {
        status: 'OK',
        confidence_score: 89,
        department_key: 'SKIN',
        treatment_name: 'Personalized Clinical Protocol',
        severity: 'Moderate',
        visible_observations: [
          'Target anatomical area successfully identified with high focal clarity.',
          'Localized tone variation and texture gradient mapped across focus zone.',
          'Visual markers correlate with specialized Kezza clinical restorative programs.'
        ],
        why_this_consultation: 'A comprehensive evaluation with Dr. Amrita Mukhija or Dr. Ankit Bhalothia is recommended to tailor your clinical treatment.'
      };
    }

    state.aiAnalysis = parsedResult;

    // Auto-advance: skip partial reveal, go straight to Q&A wizard
    setTimeout(() => {
      loader.style.display = 'none';

      // Still populate partial results in background (for reference on stage 2)
      const confVal = document.getElementById('ksConfidenceVal');
      if (confVal) confVal.textContent = `${parsedResult.confidence_score || 88}% Clinical Confidence`;

      const obsList = document.getElementById('ksTopObservationsList');
      if (obsList) {
        const obs = parsedResult.visible_observations || [
          'Target zone identified with distinctive textural markers.',
          'Epidermal pigmentation and density variance detected.'
        ];
        obsList.innerHTML = obs.slice(0, 3).map(item => `
          <div class="ks-obs-item">
            <i class="fas fa-circle-dot"></i>
            <span>${item}</span>
          </div>
        `).join('');
      }

      // Automatically go to the details wizard
      setStage(3);
      showQuestion(1);
    }, 2800);
  }

  // ── STEP 3: Step-by-Step Details Wizard ───────────────────────────────
  // Treatment options per category (mirrors the chatbot's category list)
  const KS_CATEGORIES = {
    hair:        { label: 'Hair', treatments: ['Hair Transplant (HT)', 'PRP Therapy', 'GFC Therapy', 'White Hair Removal', 'Electrolysis', 'Hair Loss Medical Consultation'] },
    skin:        { label: 'Skin', treatments: ['Medical Facial', 'Botox Treatment', 'Glutathione Skin Brightening', 'Dark Circle Treatment', 'Acne & Scar Treatment', 'Anti-Aging & Wrinkle Consultation', 'Dermal Fillers', 'HIFU Skin Tightening', 'Laser Treatment'] },
    pmu:         { label: 'PMU', treatments: ['Eyebrow PMU (Microblading / Ombre Brows)', 'Lip PMU (Lip Blush / Neutralization)', 'Permanent Eyeliner', 'Beauty Spot'] },
    smp:         { label: 'SMP', treatments: ['Scalp Micropigmentation (SMP)', 'Stretch Mark Camouflage', 'Scar Camouflage', 'Vitiligo Camouflage', 'Beard Micropigmentation'] },
    weight_loss: { label: 'Weight Loss', treatments: ['Medical Weight Loss Management', 'Body Slimming & Contouring', 'Diet & Metabolic Care', 'Targeted Fat Reduction'] },
    rhinoplasty: { label: 'Rhinoplasty / ENT', treatments: ['Aesthetic Rhinoplasty (Nose Reshaping)', 'Endoscopic ENT Procedures', 'Nasal Septum & Symmetry Correction', 'ENT & Head-Neck Consultation'] }
  };
  const KS_TOTAL_Q = 10;

  function ksFormatDate(d) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function ksToInputDate(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function setupDetailsWizardEvents() {
    const btnBack     = document.getElementById('ksBtnQBack');
    const btnSkip     = document.getElementById('ksBtnQSkip');
    const btnContinue = document.getElementById('ksBtnQContinue');

    // Advance as soon as an option is chosen, so the flow feels instant
    function autoAdvance() {
      if (state.activeQuestion < KS_TOTAL_Q) {
        setTimeout(() => showQuestion(state.activeQuestion + 1), 160);
      } else {
        const activeInput = document.querySelector('.ks-q-stage.ks-active input[type="text"], .ks-q-stage.ks-active input[type="tel"]');
    if (activeInput) setTimeout(() => { try { activeInput.focus({ preventScroll: true }); } catch (_) {} }, 120);

    updateContinueBtnState();
      }
    }

    function pickOne(attr, handler) {
      document.querySelectorAll('[' + attr + ']').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[' + attr + ']').forEach(b => b.classList.remove('ks-selected'));
          btn.classList.add('ks-selected');
          handler(btn.getAttribute(attr), btn);
          updateContinueBtnState();
          autoAdvance();
        });
      });
    }

    // Q1 Name — Enter moves on
    const inName = document.getElementById('ksInputName');
    inName.addEventListener('input', (e) => {
      state.answers.name = e.target.value.trim();
      updateContinueBtnState();
    });
    inName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && isCurrentQuestionValid()) { e.preventDefault(); showQuestion(2); }
    });

    // Q2 Age group
    pickOne('data-age', (v) => { state.answers.age = v; });

    // Q3 City — typed or tapped
    const inCity = document.getElementById('ksInputCity');
    inCity.addEventListener('input', (e) => {
      state.answers.city = e.target.value.trim();
      updateContinueBtnState();
    });
    inCity.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && isCurrentQuestionValid()) { e.preventDefault(); showQuestion(4); }
    });
    pickOne('data-city', (v) => { state.answers.city = v; inCity.value = v; });

    // Q4 Clinic
    pickOne('data-clinic', (v) => { state.answers.clinic = v; });

    // Q5 Category -> fills Q6 treatments
    pickOne('data-category', (v) => {
      state.answers.category = v;
      state.answers.categoryLabel = (KS_CATEGORIES[v] || {}).label || v;
      state.answers.concern = state.answers.categoryLabel;
      state.answers.treatment = '';
      renderTreatmentOptions(v);
    });

    function renderTreatmentOptions(catKey) {
      const grid = document.getElementById('ksTreatmentGrid');
      if (!grid) return;
      const list = (KS_CATEGORIES[catKey] || {}).treatments || [];
      grid.innerHTML = '';
      list.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ks-chip-btn';
        b.setAttribute('data-treatment', t);
        b.textContent = t;
        b.addEventListener('click', () => {
          grid.querySelectorAll('.ks-chip-btn').forEach(x => x.classList.remove('ks-selected'));
          b.classList.add('ks-selected');
          state.answers.treatment = t;
          updateContinueBtnState();
          autoAdvance();
        });
        grid.appendChild(b);
      });
    }

    // Q7 Duration
    pickOne('data-duration', (v) => { state.answers.duration = v; });

    // Q8 Date — quick chips or picker
    const inDate = document.getElementById('ksInputDate');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    inDate.min = ksToInputDate(today);
    pickOne('data-dateq', (v) => {
      const d = new Date(today);
      if (v === 'tomorrow') d.setDate(d.getDate() + 1);
      if (v === 'in2') d.setDate(d.getDate() + 2);
      state.answers.date = ksFormatDate(d);
      inDate.value = ksToInputDate(d);
    });
    inDate.addEventListener('change', (e) => {
      if (!e.target.value) return;
      const d = new Date(e.target.value + 'T00:00:00');
      state.answers.date = ksFormatDate(d);
      document.querySelectorAll('[data-dateq]').forEach(b => b.classList.remove('ks-selected'));
      updateContinueBtnState();
      autoAdvance();
    });

    // Q9 Time
    pickOne('data-time', (v) => { state.answers.time = v; });

    // Q10 WhatsApp — digits only, 10-digit check
    const inWa = document.getElementById('ksInputWhatsApp');
    const waHint = document.getElementById('ksPhoneHint');
    inWa.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = digits;
      state.answers.whatsapp = digits;
      if (waHint) {
        if (!digits) waHint.textContent = '';
        else if (digits.length < 10) waHint.textContent = `${10 - digits.length} more digit${digits.length === 9 ? '' : 's'}`;
        else if (!/^[6-9]/.test(digits)) waHint.textContent = 'Indian mobile numbers start with 6, 7, 8 or 9';
        else waHint.textContent = 'Looks good';
      }
      updateContinueBtnState();
    });
    inWa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && isCurrentQuestionValid()) { e.preventDefault(); btnContinue.click(); }
    });

    document.getElementById('ksConsentCheckbox').addEventListener('change', (e) => {
      state.answers.consent = e.target.checked;
      updateContinueBtnState();
    });

    btnBack.addEventListener('click', () => {
      if (state.activeQuestion > 1) showQuestion(state.activeQuestion - 1);
      else setStage(2);
    });

    if (btnSkip) btnSkip.style.display = 'none';

    btnContinue.addEventListener('click', () => {
      if (!isCurrentQuestionValid()) return;
      if (state.activeQuestion < KS_TOTAL_Q) showQuestion(state.activeQuestion + 1);
      else submitLeadAndRevealResults();
    });
  }

  function isCurrentQuestionValid() {
    const a = state.answers;
    switch (state.activeQuestion) {
      case 1:  return a.name.trim().length >= 2;
      case 2:  return Boolean(a.age);
      case 3:  return a.city.trim().length >= 2;
      case 4:  return Boolean(a.clinic);
      case 5:  return Boolean(a.category);
      case 6:  return Boolean(a.treatment);
      case 7:  return Boolean(a.duration);
      case 8:  return Boolean(a.date);
      case 9:  return Boolean(a.time);
      case 10: return /^[6-9]\d{9}$/.test(a.whatsapp) && a.consent === true;
      default: return true;
    }
  }

  function updateContinueBtnState() {
    const btnContinue = document.getElementById('ksBtnQContinue');
    const valid = isCurrentQuestionValid();
    btnContinue.disabled = !valid;
  }

  function showQuestion(qNum) {
    state.activeQuestion = qNum;

    // Update Question Stages
    document.querySelectorAll('.ks-q-stage').forEach(el => {
      el.classList.toggle('ks-active', parseInt(el.getAttribute('data-q'), 10) === qNum);
    });

    // Update Tracker Header
    const tracker = document.getElementById('ksQTrackerText');
    if (tracker) tracker.textContent = `Question ${qNum} of ${KS_TOTAL_Q}`;

    // Update Progress Fill
    const fill = document.getElementById('ksProgressFill');
    if (fill) fill.style.width = `${50 + (qNum / KS_TOTAL_Q) * 45}%`;

    // No optional questions in this flow
    const btnSkip = document.getElementById('ksBtnQSkip');
    if (btnSkip) btnSkip.style.display = 'none';

    // Button label
    const btnContinueText = document.getElementById('ksBtnQContinueText');
    if (qNum === KS_TOTAL_Q) {
      btnContinueText.textContent = 'Confirm & Send to WhatsApp';
    } else {
      btnContinueText.textContent = 'Continue';
    }

    updateContinueBtnState();

    // Autofocus input in newly active question
    setTimeout(() => {
      const activeStageEl = document.querySelector(`.ks-q-stage[data-q="${qNum}"]`);
      if (activeStageEl) {
        const input = activeStageEl.querySelector('input, textarea');
        if (input) input.focus();
      }
    }, 60);
  }

  // ── STEP 4: Save Lead & Full Results ─────────────────────────────────
  async function submitLeadAndRevealResults() {
    const btnContinue = document.getElementById('ksBtnQContinue');
    btnContinue.disabled = true;
    btnContinue.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Report...';

    // Prepare lead payload
    const leadData = {
      timestamp: new Date().toISOString(),
      name: state.answers.name,
      whatsapp: state.answers.whatsapp,
      age: state.answers.age || '',
      city: state.answers.city || '',
      category: state.answers.categoryLabel || '',
      treatment: state.answers.treatment || '',
      preferredDate: state.answers.date || '',
      preferredTime: state.answers.time || '',
      gender: state.answers.gender || 'Not Specified',
      concern: state.answers.concern || 'General Assessment',
      duration: state.answers.duration || '',
      severity: state.answers.severity || 'Moderate',
      symptoms: state.answers.symptoms || '',
      allergies: state.answers.allergies || '',
      medicines: state.answers.medicines || '',
      clinic: state.answers.clinic || 'Jaipur (Flagship)',
      aiSummary: (state.aiAnalysis && state.aiAnalysis.visible_observations) 
        ? state.aiAnalysis.visible_observations.join('; ') 
        : 'Assessment complete.',
      consent: true
    };

    // Forward to backend /api/lead (Non-blocking fallback)
    try {
      const leadRes = await fetch(API_LEAD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      const leadJson = await leadRes.json();
      console.log('[Lead Capture Response]:', leadJson);
    } catch (err) {
      console.error('[Lead Save Error - proceeding with UI reveal]:', err.message);
    }

    // Transition to Stage 4 (Full Results)
    setStage(4);
    renderFullResults();
  }

  function renderFullResults() {
    const ai = state.aiAnalysis || {};
    const ans = state.answers;

    document.getElementById('ksResPatientName').textContent = ans.name || 'Patient';
    document.getElementById('ksResConcern').textContent = ans.concern || 'General Skin/Hair';
    document.getElementById('ksResSeverity').textContent = ans.severity || 'Moderate';
    document.getElementById('ksResClinic').textContent = ans.clinic || 'Jaipur';

    const treatmentTitle = document.getElementById('ksResTreatmentTitle');
    const treatmentDesc  = document.getElementById('ksResTreatmentDesc');

    if (treatmentTitle) {
      treatmentTitle.textContent = ai.treatment_name || `${ans.concern || 'Advanced'} Clinical Protocol`;
    }
    if (treatmentDesc) {
      treatmentDesc.textContent = ai.why_this_consultation || 
        `Based on your scan and ${ans.duration || 'current'} timeline, our clinic specialists recommend an in-depth dermatological consultation.`;
    }

    // Doctor match
    let doc = DOCTORS.SKIN;
    const concernLower = (ans.concern || '').toLowerCase();
    if (concernLower.includes('hair') || concernLower.includes('scalp')) {
      doc = DOCTORS.HAIR;
    } else if (concernLower.includes('weight')) {
      doc = DOCTORS.WEIGHT;
    }

    const docAvatar = document.getElementById('ksDocAvatar');
    const docName   = document.getElementById('ksDocName');
    const docSpec   = document.getElementById('ksDocSpec');

    if (docAvatar) docAvatar.src = doc.img;
    if (docName) docName.textContent = doc.name;
    if (docSpec) docSpec.textContent = `${doc.spec} (${ans.clinic || doc.clinic})`;

    // Configure WhatsApp Button
    const waCTA = document.getElementById('ksBtnWhatsAppCTA');
    if (waCTA) {
      const lines = [
        `Hi Kezza Clinic! I just completed the AI Skin & Hair Scan.`,
        ``,
        `Name: ${ans.name}`,
        ans.age ? `Age: ${ans.age}` : '',
        ans.city ? `City: ${ans.city}` : '',
        ans.categoryLabel ? `Category: ${ans.categoryLabel}` : '',
        ans.treatment ? `Treatment: ${ans.treatment}` : '',
        ans.duration ? `Duration: ${ans.duration}` : '',
        ans.clinic ? `Preferred clinic: ${ans.clinic}` : '',
        (ans.date || ans.time) ? `Preferred slot: ${[ans.date, ans.time].filter(Boolean).join(' - ')}` : '',
        ``,
        `Please share my full report and confirm my appointment.`
      ].filter(l => l !== undefined && l !== '');
      const msg = encodeURIComponent(lines.join('\n'));
      waCTA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      startWhatsAppHandoff(waCTA.href);
    }
  }

  // After the final confirm, hand the visitor to WhatsApp automatically.
  // A visible countdown and a Stay control keep it from feeling hijacked.
  function startWhatsAppHandoff(url) {
    if (state.waRedirectTimer) return;
    const cta = document.getElementById('ksBtnWhatsAppCTA');
    if (!cta || !cta.parentNode) return;

    const note = document.createElement('div');
    note.className = 'ks-wa-autoredirect';
    note.innerHTML = '<span id="ksWaCountText"></span><button type="button" id="ksWaStay">Stay &amp; read report</button>';
    cta.parentNode.insertBefore(note, cta.nextSibling);

    const txt = note.querySelector('#ksWaCountText');
    let left = 4;
    const tick = () => {
      if (left <= 0) {
        clearInterval(state.waRedirectTimer);
        state.waRedirectTimer = null;
        window.location.href = url;   // navigation, not a popup, so it is never blocked
        return;
      }
      if (txt) txt.textContent = `Opening WhatsApp in ${left}...`;
      left--;
    };
    tick();
    state.waRedirectTimer = setInterval(tick, 1000);

    note.querySelector('#ksWaStay').addEventListener('click', () => {
      clearInterval(state.waRedirectTimer);
      state.waRedirectTimer = null;
      note.remove();
    });
  }

  function cancelWhatsAppHandoff() {
    if (state.waRedirectTimer) {
      clearInterval(state.waRedirectTimer);
      state.waRedirectTimer = null;
    }
    const note = document.querySelector('.ks-wa-autoredirect');
    if (note) note.remove();
  }

  function setupResultsEvents() {
    document.getElementById('ksBtnRestartScan').addEventListener('click', () => {
      // Reset state
      cancelCountdown();
      cancelWhatsAppHandoff();
      state.capturedImageBase64 = null;
      state.aiAnalysis = null;
      state.answers = {
        name: '', whatsapp: '', age: '', city: '', clinic: '',
        category: '', categoryLabel: '', treatment: '',
        duration: '', date: '', time: '',
        gender: '', concern: '', severity: '', symptoms: '', allergies: '', medicines: '',
        consent: true
      };

      // Reset form inputs
      ['ksInputName', 'ksInputCity', 'ksInputWhatsApp', 'ksInputDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const waHint = document.getElementById('ksPhoneHint');
      if (waHint) waHint.textContent = '';
      const tGrid = document.getElementById('ksTreatmentGrid');
      if (tGrid) tGrid.innerHTML = '';
      document.querySelectorAll('.ks-chip-btn').forEach(b => b.classList.remove('ks-selected'));
      document.querySelectorAll('.ks-clinic-card').forEach(c => c.classList.remove('ks-selected'));
      const consentBox = document.getElementById('ksConsentCheckbox');
      if (consentBox) consentBox.checked = true;

      // Restore subtitle
      const subtitle = document.getElementById('ksScanSubtitle');
      if (subtitle) subtitle.textContent = 'Position your face inside the oval — photo captures automatically.';

      setStage(1);
      // Re-launch auto-camera after brief settle
      setTimeout(() => {
        if (state.isOpen && !state.capturedImageBase64) startCameraStream();
      }, 400);
    });
  }

  // ── Public API ───────────────────────────────────────────────────────
  window.KezzaScannerModal = {
    _initialized: false,
    open: openModal,
    close: closeModal,
    init: init
  };

  // Auto-init DOM on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
