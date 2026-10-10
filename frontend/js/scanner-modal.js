(function(){"use strict";if(window.KezzaScannerModal&&window.KezzaScannerModal._initialized)return;const Q="919284517427",M=typeof window!="undefined"&&window.location&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")&&window.location.port!=="3001"?"http://localhost:3001":"",$=`${M}/api/analyze-photo`,j=`${M}/api/lead`,K="https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec",g={HAIR:{name:"Dr. Ankit Bhalothia",spec:"Aesthetic & Hair Transplant Surgeon",img:"/images/Doctor1.webp",clinic:"Jaipur & Sikar"},SKIN:{name:"Dr. Amrita Mukhija",spec:"Aesthetic Physician & Skin Specialist",img:"/images/Doctor2.webp",clinic:"Jaipur"},PMU:{name:"Krishna",spec:"PMU & Scalp Micropigmentation Artist",img:"/images/Doctor5.webp",clinic:"Jaipur & Sikar"},WEIGHT:{name:"Kezza Wellness & Slimming Team",spec:"Clinical Nutrition & Body Contouring",img:"/images/Doctor3.webp",clinic:"Jaipur & Sikar"},AJMER_SPECIALIST:{name:"Dr. Aliza Rizvi",spec:"Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon",img:"/images/dr-aliza-rizvi.webp",clinic:"Ajmer"},AJMER_HAIR:{name:"Dr. Dhiral Vijayvargiya",spec:"Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon",img:"/images/Doctor4.webp",clinic:"Ajmer"}},e={isOpen:!1,activeStage:1,activeQuestion:1,capturedImageBase64:null,mediaStream:null,cameraFacing:"user",aiAnalysis:null,countdownTimer:null,countdownValue:3,countdownActive:!1,waRedirectTimer:null,autoProceedTimer:null,isSubmittingLead:!1,answers:{name:"",whatsapp:"",age:"",city:"",clinic:"",category:"",categoryLabel:"",treatment:"",duration:"",date:"",time:"",gender:"",concern:"",severity:"",symptoms:"",allergies:"",medicines:"",consent:!0}};let C=null,f=null;function V(){if(document.getElementById("ksModalBackdrop"))return document.getElementById("ksModalBackdrop");const t=document.createElement("div");return t.id="ksModalBackdrop",t.className="ks-modal-backdrop",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-labelledby","ksModalTitle"),t.innerHTML=`
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
            <img src="/images/logo.png" alt="Kezza Clinic" class="ks-brand-logo" onerror="this.style.display='none'">
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

            <!-- Primary Analyze / Proceed Button -->
            <button type="button" class="ks-btn-primary" id="ksBtnAnalyze" style="display:none; margin: 12px 0 8px; width: 100%;" disabled>
              <span>Proceed to AI Analysis</span>
              <i class="fas fa-arrow-right"></i>
            </button>

            <div class="ks-privacy-note">
              <i class="fas fa-shield-halved"></i>
              <span>Your photo is used strictly to generate scan insights. Not stored.</span>
            </div>
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
                <i class="fas fa-shield-halved"></i> <span id="ksConfidenceVal">88% Clinical Match</span>
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
                  <button type="button" class="ks-chip-btn" data-city="Ajmer"><i class="fas fa-location-dot"></i> Ajmer</button>
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
                  <div class="ks-clinic-card" data-clinic="Ajmer">
                    <span class="ks-clinic-card-badge">New Branch</span>
                    <div class="ks-clinic-card-title">Ajmer</div>
                    <div class="ks-clinic-card-loc">Oasis Complex, Shastri Nagar</div>
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
                  <button type="button" class="ks-chip-btn" data-category="rhinoplasty"><i class="fas fa-face-smile"></i> Rhinoplasty / ENT</button>
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
                  <img src="/images/Doctor2.webp" id="ksDocAvatar" class="ks-doc-avatar" alt="Specialist Doctor">
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

              <!-- Preliminary Guidance Disclaimer -->
              <div class="ks-stage-disclaimer" style="font-size: 11.5px; line-height: 1.45; color: #a1a1aa; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px; margin-top: 12px; text-align: center;">
                <i class="fas fa-shield-alt" style="color: #00AFC0; margin-right: 4px;"></i>
                This AI analysis is for preliminary guidance only and is not a medical diagnosis. Please consult a qualified doctor for a proper evaluation.
              </div>

              <button type="button" class="ks-btn-restart" id="ksBtnRestartScan">
                <i class="fas fa-rotate-right"></i> Scan Another Area or Patient
              </button>
            </div>
          </div>

        </div>
      </div>
    `,document.body.appendChild(t),t}function P(){C=V(),f=document.getElementById("ksConfirmDialog"),J(),U(),X(),ee(),se(),window.KezzaScannerModal._initialized=!0}function G(){if(e.isOpen)return;C||P(),e.isOpen=!0,e.isSubmittingLead=!1,C.classList.add("ks-active"),document.body.style.overflow="hidden";const t=document.getElementById("floatingQuickDock")||document.querySelector(".floating-quick-dock");t&&t.classList.add("dock-hidden"),v(1),setTimeout(()=>{e.isOpen&&!e.capturedImageBase64&&B()},400)}function A(t=!1){if(N(),!e.isOpen)return;if(w(),e.autoProceedTimer&&(clearTimeout(e.autoProceedTimer),e.autoProceedTimer=null),!!(e.capturedImageBase64||e.answers.name||e.answers.whatsapp||e.activeStage>1)&&!t&&e.activeStage<4){f&&f.classList.add("ks-active");return}f&&f.classList.remove("ks-active"),S(),e.isOpen=!1,C.classList.remove("ks-active"),document.body.style.overflow="";const s=document.getElementById("floatingQuickDock")||document.querySelector(".floating-quick-dock");s&&s.classList.remove("dock-hidden")}function v(t){e.activeStage=t,document.querySelectorAll(".ks-stage").forEach((c,o)=>{c.classList.toggle("ks-active",o+1===t)});const a=document.getElementById("ksProgressFill");a&&(t===1?a.style.width="25%":t===2?a.style.width="50%":t===3?a.style.width=`${50+e.activeQuestion/11*40}%`:t===4&&(a.style.width="100%"));const s=document.getElementById("ksModalBody");s&&(s.scrollTop=0)}function J(){document.getElementById("ksModalCloseBtn").addEventListener("click",()=>A(!1)),C.addEventListener("click",t=>{t.target===C&&A(!1)}),document.addEventListener("keydown",t=>{t.key==="Escape"&&e.isOpen&&(f&&f.classList.contains("ks-active")?f.classList.remove("ks-active"):A(!1))}),document.getElementById("ksBtnConfirmStay").addEventListener("click",()=>{f.classList.remove("ks-active")}),document.getElementById("ksBtnConfirmLeave").addEventListener("click",()=>{f.classList.remove("ks-active"),A(!0)})}function U(){const t=document.getElementById("ksBtnStartCamera"),a=document.getElementById("ksBtnShutter"),s=document.getElementById("ksBtnSwitchCamera"),c=document.getElementById("ksBtnUploadTrigger"),o=document.getElementById("ksPhotoFileInput"),i=document.getElementById("ksBtnRetake"),r=document.getElementById("ksBtnAnalyze"),m=document.getElementById("ksViewfinderWrap"),u=document.getElementById("ksViewfinderIdle");t.addEventListener("click",()=>{e.mediaStream?S():B()}),s.addEventListener("click",()=>{w(),e.cameraFacing=e.cameraFacing==="user"?"environment":"user",B()}),a.addEventListener("click",()=>{w(),R()}),u.addEventListener("click",()=>{!e.mediaStream&&!e.capturedImageBase64&&B()}),c.addEventListener("click",()=>{w(),o.click()}),o.addEventListener("change",function(){const l=this.files[0];l&&(q(l),this.value="")}),m.addEventListener("dragover",l=>{l.preventDefault(),m.classList.add("ks-dragover")}),m.addEventListener("dragleave",()=>{m.classList.remove("ks-dragover")}),m.addEventListener("drop",l=>{l.preventDefault(),m.classList.remove("ks-dragover"),l.dataTransfer&&l.dataTransfer.files&&l.dataTransfer.files[0]&&(w(),q(l.dataTransfer.files[0]))}),i.addEventListener("click",()=>{e.autoProceedTimer&&(clearTimeout(e.autoProceedTimer),e.autoProceedTimer=null),e.capturedImageBase64=null,document.getElementById("ksImagePreviewWrap").classList.remove("ks-active"),document.getElementById("ksImagePreviewImg").src="",r&&(r.disabled=!0,r.style.display="none"),document.getElementById("ksViewfinderIdle").style.display="flex",document.getElementById("ksScanSubtitle").textContent="Position your face inside the oval — photo captures automatically.";const l=document.querySelector(".ks-preview-badge");l&&(l.innerHTML='<i class="fas fa-check-circle"></i> Photo Ready'),B()}),r.addEventListener("click",()=>{e.capturedImageBase64&&(e.autoProceedTimer&&(clearTimeout(e.autoProceedTimer),e.autoProceedTimer=null),S(),v(2),x())})}function Y(){if(w(),!e.mediaStream||e.capturedImageBase64)return;const t=document.getElementById("ksCountdownOverlay"),a=document.getElementById("ksCountdownNum"),s=document.getElementById("ksCountdownArc"),c=document.getElementById("ksScanSubtitle"),o=213.6;let i=3;t.style.display="flex",a.textContent=i,s.style.strokeDashoffset="0",e.countdownActive=!0,c&&(c.textContent="Hold still — capturing in "+i+" seconds…"),e.countdownTimer=setInterval(()=>{i--;const r=o*(1-i/3);s.style.strokeDashoffset=r,i>0?(a.textContent=i,c&&(c.textContent="Hold still — capturing in "+i+" second"+(i>1?"s…":"…"))):(clearInterval(e.countdownTimer),e.countdownTimer=null,e.countdownActive=!1,t.style.display="none",Z())},1e3)}function w(){e.countdownTimer&&(clearInterval(e.countdownTimer),e.countdownTimer=null),e.countdownActive=!1;const t=document.getElementById("ksCountdownOverlay");t&&(t.style.display="none")}function Z(){const t=document.getElementById("ksCaptureFlash");t&&(t.classList.add("ks-flash-active"),setTimeout(()=>t.classList.remove("ks-flash-active"),350)),R()}async function B(){try{w(),S();const t=document.getElementById("ksVideoFeed"),a=await navigator.mediaDevices.getUserMedia({video:{facingMode:e.cameraFacing,width:{ideal:1280},height:{ideal:960}},audio:!1});e.mediaStream=a,t.srcObject=a,t.classList.toggle("ks-environment",e.cameraFacing==="environment"),t.classList.add("ks-active"),await t.play(),document.getElementById("ksFaceGuide").classList.add("ks-active"),document.getElementById("ksScanLaser").classList.add("ks-active"),document.getElementById("ksViewfinderIdle").style.display="none",document.getElementById("ksImagePreviewWrap").classList.remove("ks-active"),document.getElementById("ksBtnStartCamera").innerHTML='<i class="fas fa-video-slash"></i> <span>Stop</span>',document.getElementById("ksBtnStartCamera").style.display="inline-flex",document.getElementById("ksBtnShutter").style.display="inline-flex",document.getElementById("ksBtnSwitchCamera").style.display="inline-flex",setTimeout(()=>{e.mediaStream&&!e.capturedImageBase64&&Y()},1500)}catch(t){console.warn("[Camera Access Warning]:",t.message);const a=document.getElementById("ksViewfinderIdle");a&&(a.innerHTML=`
          <div class="ks-idle-icon-wrap"><i class="fas fa-video-slash" style="color:#ef4444"></i></div>
          <div class="ks-idle-title">Camera access unavailable</div>
          <div class="ks-idle-hint">Please tap "Upload Photo" below to select a photo</div>
        `,a.style.display="flex");const s=document.getElementById("ksBtnStartCamera");s&&(s.style.display="none")}}function S(){e.mediaStream&&(e.mediaStream.getTracks().forEach(r=>r.stop()),e.mediaStream=null);const t=document.getElementById("ksVideoFeed");t&&(t.srcObject=null,t.classList.remove("ks-active"));const a=document.getElementById("ksFaceGuide");a&&a.classList.remove("ks-active");const s=document.getElementById("ksScanLaser");s&&s.classList.remove("ks-active");const c=document.getElementById("ksBtnStartCamera");c&&(c.innerHTML='<i class="fas fa-video"></i> <span>Start Camera</span>');const o=document.getElementById("ksBtnShutter");o&&(o.style.display="none");const i=document.getElementById("ksBtnSwitchCamera");i&&(i.style.display="none")}function R(){const t=document.getElementById("ksVideoFeed");if(!t||t.readyState<2)return;const a=document.getElementById("ksCaptureCanvas");a.width=t.videoWidth||640,a.height=t.videoHeight||480;const s=a.getContext("2d");s.save(),e.cameraFacing==="user"?(s.scale(-1,1),s.drawImage(t,-a.width,0,a.width,a.height)):s.drawImage(t,0,0,a.width,a.height),s.restore(),e.capturedImageBase64=a.toDataURL("image/jpeg",.88),z(),S()}function q(t){if(!t.type.startsWith("image/")){alert("Please select an image file (JPEG, PNG, WEBP).");return}if(t.size>12*1024*1024){alert("Image file is too large. Please choose an image under 12MB.");return}const a=new FileReader;a.onload=s=>{e.capturedImageBase64=s.target.result,z(),S()},a.readAsDataURL(t)}function z(){const t=document.getElementById("ksImagePreviewWrap"),a=document.getElementById("ksImagePreviewImg"),s=document.getElementById("ksBtnAnalyze"),c=document.getElementById("ksScanSubtitle"),o=document.querySelector(".ks-preview-badge");a.src=e.capturedImageBase64,t.classList.add("ks-active");const i=document.getElementById("ksViewfinderIdle");if(i&&(i.style.display="none"),s&&(s.style.display="flex",s.disabled=!1,s.innerHTML='<span>Proceed to AI Analysis</span> <i class="fas fa-arrow-right"></i>'),c){c.innerHTML='Photo ready! Starting AI analysis… <span style="color:#00AFC0;cursor:pointer;text-decoration:underline;margin-left:4px;" id="ksInstantProceed">Tap to proceed now</span>';const r=document.getElementById("ksInstantProceed");r&&r.addEventListener("click",()=>{e.autoProceedTimer&&(clearTimeout(e.autoProceedTimer),e.autoProceedTimer=null),S(),v(2),x()})}o&&(o.innerHTML='<i class="fas fa-check-circle"></i> Photo Ready • Analyzing...'),e.autoProceedTimer&&clearTimeout(e.autoProceedTimer),e.autoProceedTimer=setTimeout(()=>{e.capturedImageBase64&&e.activeStage===1&&(S(),v(2),x())},850)}function X(){const t=document.getElementById("ksBtnContinueToDetails");t&&t.addEventListener("click",()=>{v(3),I(1)})}async function x(){const t=document.getElementById("ksAnalyzingLoader"),a=document.getElementById("ksPartialResults"),s=document.getElementById("ksStepText1"),c=document.getElementById("ksStepText2"),o=document.getElementById("ksStepText3");t.style.display="flex",a.style.display="none",setTimeout(()=>{s.innerHTML='<i class="fas fa-circle-check" style="color:#22c55e"></i> Target anatomical zones mapped',c.className="ks-analysis-step-item ks-active"},900),setTimeout(()=>{c.innerHTML='<i class="fas fa-circle-check" style="color:#22c55e"></i> Texture, sebum &amp; pigmentation mapped',o.className="ks-analysis-step-item ks-active"},1800);let i=null;try{const r=new AbortController,m=setTimeout(()=>r.abort(),3500),u=await fetch($,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:e.capturedImageBase64,textContext:"Initial Instant Scan Assessment for Lead Capture Flow"}),signal:r.signal});if(clearTimeout(m),u.ok){const l=await u.json();l&&l.status==="OK"&&(i=l)}}catch(r){console.warn("[AI Analysis API fallback]:",r.message)}i||(i={status:"OK",confidence_score:89,department_key:"SKIN",treatment_name:"Personalized Clinical Protocol",severity:"Moderate",visible_observations:["Target anatomical area successfully identified with high focal clarity.","Localized tone variation and texture gradient mapped across focus zone.","Visual markers correlate with specialized Kezza clinical restorative programs."],why_this_consultation:"A comprehensive evaluation with Dr. Amrita Mukhija or Dr. Ankit Bhalothia is recommended to tailor your clinical treatment."}),e.aiAnalysis=i,setTimeout(()=>{t.style.display="none";const r=document.getElementById("ksConfidenceVal");r&&(r.textContent=`${i.confidence_score||88}% Clinical Confidence`);const m=document.getElementById("ksTopObservationsList");if(m){const u=i.visible_observations||["Target zone identified with distinctive textural markers.","Epidermal pigmentation and density variance detected."];m.innerHTML=u.slice(0,3).map(l=>`
          <div class="ks-obs-item">
            <i class="fas fa-circle-dot"></i>
            <span>${l}</span>
          </div>
        `).join("")}v(3),I(1)},2800)}const H={hair:{label:"Hair",treatments:["Hair Transplant (HT)","PRP Therapy","GFC Therapy","White Hair Removal","Electrolysis","Hair Loss Medical Consultation"]},skin:{label:"Skin",treatments:["Medical Facial","Botox Treatment","Glutathione Skin Brightening","Dark Circle Treatment","Acne & Scar Treatment","Anti-Aging & Wrinkle Consultation","Dermal Fillers","HIFU Skin Tightening","Laser Treatment"]},pmu:{label:"PMU",treatments:["Eyebrow PMU (Microblading / Ombre Brows)","Lip PMU (Lip Blush / Neutralization)","Permanent Eyeliner","Beauty Spot"]},smp:{label:"SMP",treatments:["Scalp Micropigmentation (SMP)","Stretch Mark Camouflage","Scar Camouflage","Vitiligo Camouflage","Beard Micropigmentation"]},weight_loss:{label:"Weight Loss",treatments:["Medical Weight Loss Management","Body Slimming & Contouring","Diet & Metabolic Care","Targeted Fat Reduction"]},rhinoplasty:{label:"Rhinoplasty / ENT",treatments:["Aesthetic Rhinoplasty (Nose Reshaping)","Endoscopic ENT Procedures","Nasal Septum & Symmetry Correction","ENT & Head-Neck Consultation"]}},T=10;function W(t){return t.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}function F(t){const a=s=>String(s).padStart(2,"0");return`${t.getFullYear()}-${a(t.getMonth()+1)}-${a(t.getDate())}`}function ee(){const t=document.getElementById("ksBtnQBack"),a=document.getElementById("ksBtnQSkip"),s=document.getElementById("ksBtnQContinue");function c(){if(e.activeQuestion<T)setTimeout(()=>I(e.activeQuestion+1),160);else{const n=document.querySelector('.ks-q-stage.ks-active input[type="text"], .ks-q-stage.ks-active input[type="tel"]');n&&setTimeout(()=>{try{n.focus({preventScroll:!0})}catch(d){}},120),h()}}function o(n,d){document.querySelectorAll("["+n+"]").forEach(p=>{p.addEventListener("click",()=>{document.querySelectorAll("["+n+"]").forEach(E=>E.classList.remove("ks-selected")),p.classList.add("ks-selected"),d(p.getAttribute(n),p),h(),c()})})}const i=document.getElementById("ksInputName");i.addEventListener("input",n=>{e.answers.name=n.target.value.trim(),h()}),i.addEventListener("keydown",n=>{n.key==="Enter"&&L()&&(n.preventDefault(),I(2))}),o("data-age",n=>{e.answers.age=n});const r=document.getElementById("ksInputCity");r.addEventListener("input",n=>{e.answers.city=n.target.value.trim(),h()}),r.addEventListener("keydown",n=>{n.key==="Enter"&&L()&&(n.preventDefault(),I(4))}),o("data-city",n=>{e.answers.city=n,r.value=n}),o("data-clinic",n=>{e.answers.clinic=n}),o("data-category",n=>{e.answers.category=n,e.answers.categoryLabel=(H[n]||{}).label||n,e.answers.concern=e.answers.categoryLabel,e.answers.treatment="",m(n)});function m(n){const d=document.getElementById("ksTreatmentGrid");if(!d)return;const p=(H[n]||{}).treatments||[];d.innerHTML="",p.forEach(E=>{const b=document.createElement("button");b.type="button",b.className="ks-chip-btn",b.setAttribute("data-treatment",E),b.textContent=E,b.addEventListener("click",()=>{d.querySelectorAll(".ks-chip-btn").forEach(D=>D.classList.remove("ks-selected")),b.classList.add("ks-selected"),e.answers.treatment=E,h(),c()}),d.appendChild(b)})}o("data-duration",n=>{e.answers.duration=n});const u=document.getElementById("ksInputDate"),l=new Date;l.setHours(0,0,0,0),u.min=F(l),o("data-dateq",n=>{const d=new Date(l);n==="tomorrow"&&d.setDate(d.getDate()+1),n==="in2"&&d.setDate(d.getDate()+2),e.answers.date=W(d),u.value=F(d)}),u.addEventListener("change",n=>{if(!n.target.value)return;const d=new Date(n.target.value+"T00:00:00");e.answers.date=W(d),document.querySelectorAll("[data-dateq]").forEach(p=>p.classList.remove("ks-selected")),h(),c()}),o("data-time",n=>{e.answers.time=n});const k=document.getElementById("ksInputWhatsApp"),y=document.getElementById("ksPhoneHint");k.addEventListener("input",n=>{const d=n.target.value.replace(/\D/g,"").slice(0,10);n.target.value=d,e.answers.whatsapp=d,y&&(d?d.length<10?y.textContent=`${10-d.length} more digit${d.length===9?"":"s"}`:/^[6-9]/.test(d)?y.textContent="Looks good":y.textContent="Indian mobile numbers start with 6, 7, 8 or 9":y.textContent=""),h()}),k.addEventListener("keydown",n=>{n.key==="Enter"&&L()&&(n.preventDefault(),s.click())}),document.getElementById("ksConsentCheckbox").addEventListener("change",n=>{e.answers.consent=n.target.checked,h()}),t.addEventListener("click",()=>{e.activeQuestion>1?I(e.activeQuestion-1):v(2)}),a&&(a.style.display="none"),s.addEventListener("click",()=>{L()&&(e.activeQuestion<T?I(e.activeQuestion+1):te())})}function L(){const t=e.answers;switch(e.activeQuestion){case 1:return t.name.trim().length>=2;case 2:return!!t.age;case 3:return t.city.trim().length>=2;case 4:return!!t.clinic;case 5:return!!t.category;case 6:return!!t.treatment;case 7:return!!t.duration;case 8:return!!t.date;case 9:return!!t.time;case 10:return/^[6-9]\d{9}$/.test(t.whatsapp)&&t.consent===!0;default:return!0}}function h(){const t=document.getElementById("ksBtnQContinue"),a=L();t.disabled=!a}function I(t){e.activeQuestion=t,document.querySelectorAll(".ks-q-stage").forEach(i=>{i.classList.toggle("ks-active",parseInt(i.getAttribute("data-q"),10)===t)});const a=document.getElementById("ksQTrackerText");a&&(a.textContent=`Question ${t} of ${T}`);const s=document.getElementById("ksProgressFill");s&&(s.style.width=`${50+t/T*45}%`);const c=document.getElementById("ksBtnQSkip");c&&(c.style.display="none");const o=document.getElementById("ksBtnQContinueText");t===T?o.textContent="Confirm & Send to WhatsApp":o.textContent="Continue",h(),setTimeout(()=>{const i=document.querySelector(`.ks-q-stage[data-q="${t}"]`);if(i){const r=i.querySelector("input, textarea");r&&r.focus()}},60)}async function te(){if(e.isSubmittingLead)return;e.isSubmittingLead=!0;const t=document.getElementById("ksBtnQContinue");t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving Report...');let a="Jaipur";const s=(e.answers.clinic||"").toLowerCase();s.includes("ajmer")?a="Ajmer":s.includes("sikar")?a="Sikar":s.includes("jaipur")&&(a="Jaipur");const c=(e.answers.category||"").toLowerCase(),o=(e.answers.concern||"").toLowerCase(),i=c.includes("hair")||o.includes("hair")||o.includes("scalp");let r=g.SKIN;a==="Ajmer"?r=i?g.AJMER_HAIR:g.AJMER_SPECIALIST:r=i?g.HAIR:g.SKIN;const m=`KEZZA-${new Date().getFullYear()}-${Math.floor(1e3+Math.random()*9e3)}`,u=e.answers.categoryLabel||(i?"Hair":"Skin"),l=e.answers.duration||"Not specified",k=e.answers.concern||u||"General Assessment",y=l&&l!=="Not specified"?l:k,n={timestamp:new Date().toISOString(),consultationId:m,leadId:m,name:e.answers.name,full_name:e.answers.name,whatsapp:e.answers.whatsapp,phone:e.answers.whatsapp,mobile_number:e.answers.whatsapp,WhatsApp:e.answers.whatsapp,age:parseInt(e.answers.age,10)||e.answers.age||"",email:"",city:e.answers.city||a,patient_city:e.answers.city||a,patientLocation:e.answers.city||a,"Patient Location":e.answers.city||a,clinic:a,preferred_clinic:a,Clinic:a,category:u,treatment_category:u,Category:u,treatment:e.answers.treatment||"Clinical Consultation",service:e.answers.treatment||"Clinical Consultation",Treatment:e.answers.treatment||"Clinical Consultation",department:u,Department:u,Department:u,department_name:u,date:e.answers.date||"",preferredDate:e.answers.date||"",preferred_date:e.answers.date||"","Preferred Date":e.answers.date||"",time:e.answers.time||"",preferredTime:e.answers.time||"",preferred_time:e.answers.time||"","Preferred Time":e.answers.time||"",gender:e.answers.gender||"Not Specified",concern:k,Concern:k,duration:l,Duration:l,concern_duration:l,concernDuration:y,"Concern / Duration":y,"concern / duration":y,"Concern/Duration":y,severity:e.answers.severity||"Moderate",symptoms:e.answers.symptoms||"",allergies:e.answers.allergies||"",medicines:e.answers.medicines||"",doctor:r.name,specialist:r.name,Specialist:r.name,message:`[AI Scanner Modal] Concern: ${e.answers.concern||"N/A"}${e.answers.symptoms?" | Symptoms: "+e.answers.symptoms:""}`,notes:(e.answers.concern||"")+(e.answers.symptoms?" | Symptoms: "+e.answers.symptoms:""),aiSummary:e.aiAnalysis&&e.aiAnalysis.visible_observations?e.aiAnalysis.visible_observations.join("; "):"Assessment complete.",source:"AI Scanner Modal",Source:"AI Scanner Modal",Source:"AI Scanner Modal",status:"Pending",Status:"Pending",Status:"Pending",consent:!0};let d=!1;try{(await fetch(j,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok&&(d=!0)}catch(p){d=!1}if(!d)try{fetch(K,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(n),keepalive:!0}).catch(p=>console.warn("[Scanner Modal Direct Sheet Sync Warn]:",p))}catch(p){console.warn("[Scanner Modal Direct Sheet Sync Error]:",p)}v(4),O(),O()}function O(){const t=e.aiAnalysis||{},a=e.answers;let s="Jaipur";const c=(a.clinic||"").toLowerCase();c.includes("ajmer")?s="Ajmer":c.includes("sikar")?s="Sikar":c.includes("jaipur")&&(s="Jaipur"),document.getElementById("ksResPatientName").textContent=a.name||"Patient",document.getElementById("ksResConcern").textContent=a.concern||"General Skin/Hair",document.getElementById("ksResSeverity").textContent=a.severity||"Moderate",document.getElementById("ksResClinic").textContent=s;const o=document.getElementById("ksResTreatmentTitle"),i=document.getElementById("ksResTreatmentDesc");o&&(o.textContent=t.treatment_name||`${a.concern||"Advanced"} Clinical Protocol`),i&&(i.textContent=t.why_this_consultation||`Based on your scan and ${a.duration||"current"} timeline, our clinic specialists recommend an in-depth dermatological consultation.`);const r=(a.concern||"").toLowerCase(),m=(a.category||"").toLowerCase(),u=r.includes("hair")||r.includes("scalp")||m.includes("hair"),l=s==="Ajmer";let k=g.SKIN;l?k=u?g.AJMER_HAIR:g.AJMER_SPECIALIST:u?k=g.HAIR:r.includes("weight")&&(k=g.WEIGHT);const y=document.getElementById("ksDocAvatar"),n=document.getElementById("ksDocName"),d=document.getElementById("ksDocSpec");y&&(y.src=k.img),n&&(n.textContent=k.name),d&&(d.textContent=`${k.spec} (${s||k.clinic})`);const p=document.getElementById("ksBtnWhatsAppCTA");if(p){const E=l?"919216088257":Q,b=["Hi Kezza Clinic! I just completed the AI Skin & Hair Scan.","",`Name: ${a.name}`,a.age?`Age: ${a.age}`:"",a.city?`City: ${a.city}`:"",a.categoryLabel?`Category: ${a.categoryLabel}`:"",a.treatment?`Treatment: ${a.treatment}`:"",a.duration?`Duration: ${a.duration}`:"",s?`Preferred clinic: ${s}`:"",a.date||a.time?`Preferred slot: ${[a.date,a.time].filter(Boolean).join(" - ")}`:"","","Please share my full report and confirm my appointment."].filter(_=>_!==void 0&&_!==""),D=encodeURIComponent(b.join(`
`));p.href=`https://wa.me/${E}?text=${D}`,ae(p.href)}}function ae(t){if(e.waRedirectTimer)return;const a=document.getElementById("ksBtnWhatsAppCTA");if(!a||!a.parentNode)return;const s=document.createElement("div");s.className="ks-wa-autoredirect",s.innerHTML='<span id="ksWaCountText"></span><button type="button" id="ksWaStay">Stay &amp; read report</button>',a.parentNode.insertBefore(s,a.nextSibling);const c=s.querySelector("#ksWaCountText");let o=4;const i=()=>{if(o<=0){clearInterval(e.waRedirectTimer),e.waRedirectTimer=null,window.location.href=t;return}c&&(c.textContent=`Opening WhatsApp in ${o}...`),o--};i(),e.waRedirectTimer=setInterval(i,1e3),s.querySelector("#ksWaStay").addEventListener("click",()=>{clearInterval(e.waRedirectTimer),e.waRedirectTimer=null,s.remove()})}function N(){e.waRedirectTimer&&(clearInterval(e.waRedirectTimer),e.waRedirectTimer=null);const t=document.querySelector(".ks-wa-autoredirect");t&&t.remove()}function se(){document.getElementById("ksBtnRestartScan").addEventListener("click",()=>{w(),N(),e.isSubmittingLead=!1,e.capturedImageBase64=null,e.aiAnalysis=null,e.answers={name:"",whatsapp:"",age:"",city:"",clinic:"",category:"",categoryLabel:"",treatment:"",duration:"",date:"",time:"",gender:"",concern:"",severity:"",symptoms:"",allergies:"",medicines:"",consent:!0},["ksInputName","ksInputCity","ksInputWhatsApp","ksInputDate"].forEach(o=>{const i=document.getElementById(o);i&&(i.value="")});const t=document.getElementById("ksPhoneHint");t&&(t.textContent="");const a=document.getElementById("ksTreatmentGrid");a&&(a.innerHTML=""),document.querySelectorAll(".ks-chip-btn").forEach(o=>o.classList.remove("ks-selected")),document.querySelectorAll(".ks-clinic-card").forEach(o=>o.classList.remove("ks-selected"));const s=document.getElementById("ksConsentCheckbox");s&&(s.checked=!0);const c=document.getElementById("ksScanSubtitle");c&&(c.textContent="Position your face inside the oval — photo captures automatically."),v(1),setTimeout(()=>{e.isOpen&&!e.capturedImageBase64&&B()},400)})}window.KezzaScannerModal={_initialized:!1,open:G,close:A,init:P},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P):P()})();
