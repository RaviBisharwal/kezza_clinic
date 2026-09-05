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
    answers: {
      name: '',
      whatsapp: '',
      age: '',
      gender: '',
      concern: '',
      duration: '',
      severity: '',
      symptoms: '',
      allergies: '',
      medicines: '',
      clinic: 'Jaipur (Flagship)',
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
                <span class="ks-q-subtrack" id="ksQTrackerText">Question 1 of 11</span>
                <span class="ks-brand-badge"><i class="fas fa-user-doctor"></i> Patient Profile</span>
              </div>

              <!-- Question 1: Full Name -->
              <div class="ks-q-stage ks-active" data-q="1">
                <h3 class="ks-q-title">What is your full name?</h3>
                <p class="ks-q-hint">As you would like it to appear on your clinical report.</p>
                <div class="ks-input-wrap">
                  <input type="text" id="ksInputName" class="ks-input-field" placeholder="e.g. Rahul Sharma" autocomplete="name">
                </div>
              </div>

              <!-- Question 2: WhatsApp Number -->
              <div class="ks-q-stage" data-q="2">
                <h3 class="ks-q-title">What is your WhatsApp number?</h3>
                <p class="ks-q-hint">We will deliver your full diagnostic report directly to this WhatsApp.</p>
                <div class="ks-phone-input-group">
                  <div class="ks-phone-prefix">🇮🇳 +91</div>
                  <input type="tel" id="ksInputWhatsApp" class="ks-phone-input" placeholder="10-digit mobile number" maxlength="10" autocomplete="tel">
                </div>
              </div>

              <!-- Question 3: Age -->
              <div class="ks-q-stage" data-q="3">
                <h3 class="ks-q-title">What is your age?</h3>
                <p class="ks-q-hint">Helps calibrate clinical cell regeneration &amp; treatment response rate.</p>
                <div class="ks-input-wrap">
                  <input type="number" id="ksInputAge" class="ks-input-field" placeholder="e.g. 28" min="1" max="120">
                </div>
              </div>

              <!-- Question 4: Gender -->
              <div class="ks-q-stage" data-q="4">
                <h3 class="ks-q-title">What is your gender?</h3>
                <p class="ks-q-hint">Important for androgenic &amp; hormonal hair/skin analysis.</p>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-gender="Female"><i class="fas fa-venus"></i> Female</button>
                  <button type="button" class="ks-chip-btn" data-gender="Male"><i class="fas fa-mars"></i> Male</button>
                  <button type="button" class="ks-chip-btn" data-gender="Other"><i class="fas fa-genderless"></i> Other</button>
                </div>
              </div>

              <!-- Question 5: Main Concern -->
              <div class="ks-q-stage" data-q="5">
                <h3 class="ks-q-title">What is your primary concern?</h3>
                <p class="ks-q-hint">Select the main condition you wish to treat.</p>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-concern="Acne"><i class="fas fa-spa"></i> Acne</button>
                  <button type="button" class="ks-chip-btn" data-concern="Dark Spots"><i class="fas fa-wand-magic-sparkles"></i> Dark Spots</button>
                  <button type="button" class="ks-chip-btn" data-concern="Pigmentation"><i class="fas fa-sun"></i> Pigmentation</button>
                  <button type="button" class="ks-chip-btn" data-concern="Dryness"><i class="fas fa-droplet"></i> Dryness</button>
                  <button type="button" class="ks-chip-btn" data-concern="Redness"><i class="fas fa-heart-pulse"></i> Redness</button>
                  <button type="button" class="ks-chip-btn" data-concern="Hair/Scalp"><i class="fas fa-dna"></i> Hair/Scalp</button>
                  <button type="button" class="ks-chip-btn" data-concern="Other"><i class="fas fa-ellipsis"></i> Other</button>
                </div>
              </div>

              <!-- Question 6: Duration -->
              <div class="ks-q-stage" data-q="6">
                <h3 class="ks-q-title">How long have you noticed this?</h3>
                <p class="ks-q-hint">Helps determine if the condition is acute or chronic.</p>
                <div class="ks-chips-grid ks-chips-grid-2col">
                  <button type="button" class="ks-chip-btn" data-duration="<1 month"><i class="fas fa-clock"></i> &lt; 1 month</button>
                  <button type="button" class="ks-chip-btn" data-duration="1–6 months"><i class="fas fa-calendar-week"></i> 1–6 months</button>
                  <button type="button" class="ks-chip-btn" data-duration="6–12 months"><i class="fas fa-calendar-days"></i> 6–12 months</button>
                  <button type="button" class="ks-chip-btn" data-duration="1+ years"><i class="fas fa-calendar-check"></i> 1+ years</button>
                </div>
              </div>

              <!-- Question 7: Severity -->
              <div class="ks-q-stage" data-q="7">
                <h3 class="ks-q-title">How severe would you rate it?</h3>
                <p class="ks-q-hint">Your subjective assessment of discomfort or aesthetic impact.</p>
                <div class="ks-chips-grid">
                  <button type="button" class="ks-chip-btn" data-severity="Mild"><i class="fas fa-shield"></i> Mild</button>
                  <button type="button" class="ks-chip-btn" data-severity="Moderate"><i class="fas fa-shield-halved"></i> Moderate</button>
                  <button type="button" class="ks-chip-btn" data-severity="Severe"><i class="fas fa-shield-virus"></i> Severe</button>
                </div>
              </div>

              <!-- Question 8: Existing Symptoms (Optional) -->
              <div class="ks-q-stage" data-q="8">
                <h3 class="ks-q-title">Any symptoms or pain? <span class="ks-gold-text">(Optional)</span></h3>
                <p class="ks-q-hint">e.g. Itching, burning, scaling, excessive hair shedding, tenderness.</p>
                <div class="ks-input-wrap">
                  <textarea id="ksInputSymptoms" class="ks-textarea-field" placeholder="Describe any physical symptoms or triggers..."></textarea>
                </div>
              </div>

              <!-- Question 9: Allergies (Optional) -->
              <div class="ks-q-stage" data-q="9">
                <h3 class="ks-q-title">Known allergies or sensitivities? <span class="ks-gold-text">(Optional)</span></h3>
                <p class="ks-q-hint">e.g. Chemical peels, sulfur, minoxidil, perfumes, sensitive skin.</p>
                <div class="ks-input-wrap">
                  <textarea id="ksInputAllergies" class="ks-textarea-field" placeholder="List any known allergies or skin reactions..."></textarea>
                </div>
              </div>

              <!-- Question 10: Medicines (Optional) -->
              <div class="ks-q-stage" data-q="10">
                <h3 class="ks-q-title">Current medicines or products? <span class="ks-gold-text">(Optional)</span></h3>
                <p class="ks-q-hint">e.g. Retinoids, serums, steroids, supplements, prescription creams.</p>
                <div class="ks-input-wrap">
                  <textarea id="ksInputMedicines" class="ks-textarea-field" placeholder="List any current skincare or hair medications..."></textarea>
                </div>
              </div>

              <!-- Question 11: Clinic & Consent -->
              <div class="ks-q-stage" data-q="11">
                <h3 class="ks-q-title">Preferred Kezza Clinic Location</h3>
                <p class="ks-q-hint">Select the branch most convenient for your consultation.</p>
                
                <div class="ks-clinic-cards-grid">
                  <div class="ks-clinic-card ks-selected" data-clinic="Jaipur (Flagship)">
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

                <!-- Mandatory WhatsApp Consent Line -->
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
  function setupDetailsWizardEvents() {
    const btnBack     = document.getElementById('ksBtnQBack');
    const btnSkip     = document.getElementById('ksBtnQSkip');
    const btnContinue = document.getElementById('ksBtnQContinue');

    // Input listeners to trigger validation
    document.getElementById('ksInputName').addEventListener('input', (e) => {
      state.answers.name = e.target.value.trim();
      updateContinueBtnState();
    });

    document.getElementById('ksInputWhatsApp').addEventListener('input', (e) => {
      // Clean only digits
      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = digits;
      state.answers.whatsapp = digits;
      updateContinueBtnState();
    });

    document.getElementById('ksInputAge').addEventListener('input', (e) => {
      state.answers.age = e.target.value;
      updateContinueBtnState();
    });

    // Gender chips
    document.querySelectorAll('[data-gender]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-gender]').forEach(b => b.classList.remove('ks-selected'));
        btn.classList.add('ks-selected');
        state.answers.gender = btn.getAttribute('data-gender');
        updateContinueBtnState();
      });
    });

    // Concern chips
    document.querySelectorAll('[data-concern]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-concern]').forEach(b => b.classList.remove('ks-selected'));
        btn.classList.add('ks-selected');
        state.answers.concern = btn.getAttribute('data-concern');
        updateContinueBtnState();
      });
    });

    // Duration chips
    document.querySelectorAll('[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-duration]').forEach(b => b.classList.remove('ks-selected'));
        btn.classList.add('ks-selected');
        state.answers.duration = btn.getAttribute('data-duration');
        updateContinueBtnState();
      });
    });

    // Severity chips
    document.querySelectorAll('[data-severity]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-severity]').forEach(b => b.classList.remove('ks-selected'));
        btn.classList.add('ks-selected');
        state.answers.severity = btn.getAttribute('data-severity');
        updateContinueBtnState();
      });
    });

    // Symptoms, Allergies, Medicines (optional)
    document.getElementById('ksInputSymptoms').addEventListener('input', (e) => {
      state.answers.symptoms = e.target.value.trim();
    });
    document.getElementById('ksInputAllergies').addEventListener('input', (e) => {
      state.answers.allergies = e.target.value.trim();
    });
    document.getElementById('ksInputMedicines').addEventListener('input', (e) => {
      state.answers.medicines = e.target.value.trim();
    });

    // Clinic Cards
    document.querySelectorAll('[data-clinic]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('[data-clinic]').forEach(c => c.classList.remove('ks-selected'));
        card.classList.add('ks-selected');
        state.answers.clinic = card.getAttribute('data-clinic');
        updateContinueBtnState();
      });
    });

    // Consent Checkbox
    document.getElementById('ksConsentCheckbox').addEventListener('change', (e) => {
      state.answers.consent = e.target.checked;
      updateContinueBtnState();
    });

    // Wizard Back Button
    btnBack.addEventListener('click', () => {
      if (state.activeQuestion > 1) {
        showQuestion(state.activeQuestion - 1);
      } else {
        setStage(2); // Go back to partial reveal
      }
    });

    // Wizard Skip Button (Optional questions 8, 9, 10)
    btnSkip.addEventListener('click', () => {
      if (state.activeQuestion >= 8 && state.activeQuestion <= 10) {
        showQuestion(state.activeQuestion + 1);
      }
    });

    // Wizard Continue Button
    btnContinue.addEventListener('click', () => {
      if (!isCurrentQuestionValid()) return;

      if (state.activeQuestion < 11) {
        showQuestion(state.activeQuestion + 1);
      } else {
        // Final Submit: Submit lead and unveil full report
        submitLeadAndRevealResults();
      }
    });
  }

  function isCurrentQuestionValid() {
    const q = state.activeQuestion;
    if (q === 1) return state.answers.name.length >= 2;
    if (q === 2) return /^\d{10}$/.test(state.answers.whatsapp);
    const parsedAge = parseInt(state.answers.age, 10);
    if (q === 3) return !isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120;
    if (q === 4) return Boolean(state.answers.gender);
    if (q === 5) return Boolean(state.answers.concern);
    if (q === 6) return Boolean(state.answers.duration);
    if (q === 7) return Boolean(state.answers.severity);
    if (q === 8 || q === 9 || q === 10) return true; // optional
    if (q === 11) return Boolean(state.answers.clinic && state.answers.consent);
    return true;
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
    if (tracker) tracker.textContent = `Question ${qNum} of 11`;

    // Update Progress Fill
    const fill = document.getElementById('ksProgressFill');
    if (fill) fill.style.width = `${50 + (qNum / 11) * 45}%`;

    // Show/Hide Skip button for optional questions
    const btnSkip = document.getElementById('ksBtnQSkip');
    const isOptional = qNum >= 8 && qNum <= 10;
    btnSkip.style.display = isOptional ? 'inline-block' : 'none';

    // Button label
    const btnContinueText = document.getElementById('ksBtnQContinueText');
    if (qNum === 11) {
      btnContinueText.textContent = 'Unlock Full Report';
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
      age: parseInt(state.answers.age, 10),
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
      const msg = encodeURIComponent(
        `Hi Kezza Clinic! My name is ${ans.name}. I just completed the AI Skin & Hair Scan for ${ans.concern || 'Consultation'} (${ans.clinic || 'Jaipur'}). Please share my full report and specialist appointment availability.`
      );
      waCTA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    }
  }

  function setupResultsEvents() {
    document.getElementById('ksBtnRestartScan').addEventListener('click', () => {
      // Reset state
      cancelCountdown();
      state.capturedImageBase64 = null;
      state.aiAnalysis = null;
      state.answers = {
        name: '',
        whatsapp: '',
        age: '',
        gender: '',
        concern: '',
        duration: '',
        severity: '',
        symptoms: '',
        allergies: '',
        medicines: '',
        clinic: 'Jaipur (Flagship)',
        consent: true
      };

      // Reset form inputs
      ['ksInputName', 'ksInputWhatsApp', 'ksInputAge', 'ksInputSymptoms', 'ksInputAllergies', 'ksInputMedicines'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      document.querySelectorAll('.ks-chip-btn').forEach(b => b.classList.remove('ks-selected'));

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
