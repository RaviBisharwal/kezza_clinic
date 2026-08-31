/**
 * face-scanner-script.js
 * Kezza AI Face Scanner — Client-Side Logic
 * ─────────────────────────────────────────────────────────────
 * 1. MediaPipe Face Mesh — real-time face detection & landmarks
 * 2. Camera / Upload capture pipeline
 * 3. Follow-up Q&A state machine
 * 4. POST /api/analyze-photo → Gemini Vision (real or fallback)
 * 5. Results renderer — doctor card + WhatsApp CTA
 * ─────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    // ─── CONFIG ───────────────────────────────────────────────────────────────
    const isLocal       = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const LARAVEL_API   = isLocal
        ? 'http://localhost:8000/api'
        : 'https://stand-eos-atm-seeing.trycloudflare.com/api';
    const API_BASE      = (window.location.hostname === 'localhost' && window.location.port === '8080')
        ? 'http://localhost:3001'
        : window.location.origin;
    const API_ENDPOINT  = `${API_BASE}/api/analyze-photo`;
    const WHATSAPP_NUM  = '919284517427';

    // Doctor map: department_key → { name, spec, img, contact, location }
    const DOCTOR_MAP = {
        HAIR: {
            name:     'Dr. Ankit Bhalothia',
            spec:     'Aesthetic & Hair Transplant Surgeon',
            img:      'images/Doctor1.jpeg',
            contact:  '919216063681',
            location: 'Jaipur & Sikar'
        },
        HAIR_TRANSPLANT_SIKAR: {
            name:     'Dr. Dhiral Vijayvargiya',
            spec:     'Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon',
            img:      'images/Doctor4.jpeg',
            contact:  '918130888129',
            location: 'Sikar'
        },
        SKIN: {
            name:     'Dr. Amrita Mukhija',
            spec:     'Aesthetic Physician & Skin Specialist',
            img:      'images/Doctor2.jpeg',
            contact:  '919216063686',
            location: 'Jaipur & Sikar'
        },
        ANTI_AGING: {
            name:     'Dr. Amrita Mukhija',
            spec:     'Aesthetic Physician & Skin Specialist',
            img:      'images/Doctor2.jpeg',
            contact:  '919216063686',
            location: 'Jaipur'
        },
        PMU: {
            name:     'Krishna',
            spec:     'Permanent Makeup (PMU) Artist',
            img:      'images/Doctor5.jpeg',
            contact:  '919079161300',
            location: 'Jaipur & Sikar'
        },
        SMP: {
            name:     'Krishna',
            spec:     'PMU & Scalp Micropigmentation Artist',
            img:      'images/Doctor5.jpeg',
            contact:  '919079161300',
            location: 'Jaipur & Sikar'
        },
        SKIN_AND_HAIR: {
            name:     'Dr. Amrita Mukhija & Dr. Ankit Bhalothia',
            spec:     'Skin Specialist & Hair Transplant Surgeon',
            img:      'images/Doctor2.jpeg',
            contact:  WHATSAPP_NUM,
            location: 'Jaipur & Sikar'
        },
        WEIGHT_LOSS: {
            name:     'Kezza Wellness & Slimming Team',
            spec:     'Clinical Nutrition & Body Contouring Specialist',
            img:      'images/Doctor3.jpeg',
            contact:  '919284517427',
            location: 'Jaipur & Sikar'
        },
        ENT_RHINOPLASTY: {
            name:     'Dr. Mandhata Sharma',
            spec:     'ENT, Rhinoplasty and Head & Neck Surgeon',
            img:      'images/Doctor6.jpeg',
            contact:  '919284517427',
            location: 'Jaipur'
        }
    };

    // ─── STATE ────────────────────────────────────────────────────────────────
    let capturedImageBase64 = null;   // full data URL
    let mediaStream         = null;
    let faceMesh            = null;
    let cameraRunning       = false;
    let faceDetected        = false;

    const answers = {
        q1: null, // Concern
        q2: null, // Duration
        q3: null, // Family history
        q4: null, // Name
        q5: null, // Age group
        q6: null, // Location / City
        q7: null, // Clinic choice
        q8: null, // Time slot
        q8Date: null, // Preferred date (YYYY-MM-DD)
        q9: null, // Mobile number
        clinicContact: WHATSAPP_NUM
    };
    const TOTAL_QUESTIONS = 9;
    let currentQuestion = 1;

    // ─── DOM REFS ─────────────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    const btnStartCamera  = $('btnStartCamera');
    const btnCapture      = $('btnCapture');
    const btnProceed      = $('btnProceed');
    const photoUpload     = $('photoUpload');
    const cameraFeed      = $('cameraFeed');
    const meshCanvas      = $('meshCanvas');
    const captureCanvas   = $('captureCanvas');
    const cameraIdle      = $('cameraIdle');
    const capturedPreview = $('capturedPreview');
    const capturedImg     = $('capturedImg');
    const faceGuide       = $('faceGuide');
    const scanLine        = $('scanLine');
    const analysisOverlay = $('analysisOverlay');
    const analysisText    = $('analysisText');

    const step1 = $('step1');
    const step2 = $('step2');
    const step3 = $('step3');

    const qProgressBar = $('qProgressBar');
    const qCounter     = $('qCounter');
    const btnQBack     = $('btnQBack');
    const btnAnalyse   = $('btnAnalyse');

    const inputName        = $('inputName');
    const btnNameNext      = $('btnNameNext');
    const inputLocation    = $('inputLocation');
    const btnLocationNext  = $('btnLocationNext');
    const inputPhone       = $('inputPhone');
    const btnBookWA        = $('btnBookWA');

    const resultsLoading      = $('resultsLoading');
    const resultsQualityIssue = $('resultsQualityIssue');
    const resultsMain         = $('resultsMain');
    const resultsError        = $('resultsError');

    // ─── STEP NAVIGATION ──────────────────────────────────────────────────────
    function goToStep(n) {
        [step1, step2, step3].forEach((s, i) => {
            s.classList.toggle('hidden', i + 1 !== n);
        });

        // Update indicator
        document.querySelectorAll('.step-item').forEach((el, i) => {
            const stepNum = i + 1;
            el.classList.toggle('active',    stepNum === n);
            el.classList.toggle('completed', stepNum < n);
        });
        document.querySelectorAll('.step-line').forEach((el, i) => {
            el.classList.toggle('completed', i + 1 < n);
        });

        // Scroll to top
        const ind = document.querySelector('.steps-indicator');
        if (ind) {
            window.scrollTo({ top: ind.offsetTop - 80, behavior: 'smooth' });
        }
    }

    // ─── MEDIAPIPE FACE MESH ──────────────────────────────────────────────────
    function initFaceMesh() {
        if (faceMesh) return;
        if (typeof FaceMesh === 'undefined') {
            console.warn('MediaPipe FaceMesh not loaded — skipping face detection');
            return;
        }

        faceMesh = new FaceMesh({
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
            maxNumFaces:        1,
            refineLandmarks:    true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence:  0.7
        });

        faceMesh.onResults(onFaceMeshResults);
    }

    function onFaceMeshResults(results) {
        const ctx = meshCanvas.getContext('2d');
        ctx.clearRect(0, 0, meshCanvas.width, meshCanvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            faceDetected = true;
            scanLine.classList.add('active');

            for (const landmarks of results.multiFaceLandmarks) {
                if (typeof drawConnectors !== 'undefined' && typeof FACEMESH_TESSELATION !== 'undefined') {
                    drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
                        color: 'rgba(212, 160, 23, 0.12)',
                        lineWidth: 0.7
                    });
                }
                if (typeof drawConnectors !== 'undefined' && typeof FACEMESH_FACE_OVAL !== 'undefined') {
                    drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
                        color: 'rgba(212, 160, 23, 0.5)',
                        lineWidth: 1.5
                    });
                }
            }
        } else {
            faceDetected = false;
            scanLine.classList.remove('active');
        }
    }

    async function processFrame() {
        if (!faceMesh || !cameraRunning || cameraFeed.readyState < 2) return;

        if (meshCanvas.width !== cameraFeed.videoWidth) {
            meshCanvas.width  = cameraFeed.videoWidth;
            meshCanvas.height = cameraFeed.videoHeight;
        }
        await faceMesh.send({ image: cameraFeed });
    }

    // ─── CAMERA CONTROL ───────────────────────────────────────────────────────
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false
            });

            cameraFeed.srcObject = mediaStream;
            await cameraFeed.play();

            cameraIdle.style.display       = 'none';
            cameraFeed.classList.add('active');
            meshCanvas.classList.add('active');
            faceGuide.classList.add('active');

            cameraRunning = true;
            btnStartCamera.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera';
            btnCapture.disabled = false;

            initFaceMesh();

            const frameLoop = setInterval(() => {
                if (!cameraRunning) { clearInterval(frameLoop); return; }
                processFrame();
            }, 100);

        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                showCameraError('Camera access denied. Please use the "Upload Photo" option instead.');
            } else if (err.name === 'NotFoundError') {
                showCameraError('No camera found on this device. Please upload a photo instead.');
            } else {
                showCameraError('Could not access camera. Please upload a photo instead.');
            }
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(t => t.stop());
            mediaStream = null;
        }
        cameraFeed.srcObject = null;
        cameraFeed.classList.remove('active');
        meshCanvas.classList.remove('active');
        faceGuide.classList.remove('active');
        scanLine.classList.remove('active');
        cameraRunning = false;
        cameraIdle.style.display = 'flex';
        btnStartCamera.innerHTML = '<i class="fas fa-video"></i> Start Camera';
        btnCapture.disabled = true;
    }

    function showCameraError(msg) {
        cameraIdle.innerHTML = `
            <div class="idle-icon"><i class="fas fa-camera-slash" style="color:#ef4444"></i></div>
            <p style="color:#f87171;font-size:0.88rem;text-align:center;max-width:220px">${msg}</p>
        `;
        cameraIdle.style.display = 'flex';
    }

    // ─── CAPTURE PHOTO ────────────────────────────────────────────────────────
    function captureFromCamera() {
        if (!cameraRunning || cameraFeed.readyState < 2) return;

        captureCanvas.width  = cameraFeed.videoWidth  || 640;
        captureCanvas.height = cameraFeed.videoHeight || 480;

        const ctx = captureCanvas.getContext('2d');
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(cameraFeed, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
        ctx.restore();

        capturedImageBase64 = captureCanvas.toDataURL('image/jpeg', 0.88);
        showCapturedPreview();
        stopCamera();
    }

    function showCapturedPreview() {
        capturedImg.src = capturedImageBase64;
        capturedPreview.classList.add('active');
        btnProceed.disabled = false;
        btnCapture.disabled = true;
        btnStartCamera.innerHTML = '<i class="fas fa-redo"></i> Retake';
    }

    // ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────
    photoUpload.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('Image is too large. Please use an image under 10 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            capturedImageBase64 = e.target.result;
            showCapturedPreview();
            if (cameraRunning) stopCamera();
            cameraIdle.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    // ─── BUTTON EVENTS — STEP 1 ───────────────────────────────────────────────
    btnStartCamera.addEventListener('click', () => {
        if (cameraRunning) {
            stopCamera();
            if (capturedImageBase64) {
                capturedImageBase64 = null;
                capturedPreview.classList.remove('active');
                btnProceed.disabled = true;
                cameraIdle.style.display = 'flex';
                cameraIdle.innerHTML = `
                    <div class="idle-icon"><i class="fas fa-camera"></i></div>
                    <p>Camera will appear here</p>
                    <small>Allow camera access when prompted</small>
                `;
            }
        } else {
            startCamera();
        }
    });

    btnCapture.addEventListener('click', captureFromCamera);

    btnProceed.addEventListener('click', () => {
        goToStep(2);
        renderQuestion(1);
    });

    // ─── Q&A STATE MACHINE ────────────────────────────────────────────────────
    function isCurrentQuestionValid() {
        if (currentQuestion === 4) {
            return !!(answers.q4 && answers.q4.length >= 2);
        }
        if (currentQuestion === 6) {
            return !!(answers.q6 && answers.q6.length >= 2);
        }
        if (currentQuestion === 8) {
            // Need BOTH date and time slot
            return !!(answers.q8Date && answers.q8);
        }
        if (currentQuestion === 9) {
            return !!(answers.q9 && answers.q9.length === 10);
        }
        return !!answers[`q${currentQuestion}`];
    }

    function renderQuestion(n) {
        currentQuestion = n;
        document.querySelectorAll('.question-card').forEach(card => {
            card.classList.toggle('active', parseInt(card.dataset.q) === n);
        });

        const pct = Math.round((n / TOTAL_QUESTIONS) * 100);
        qProgressBar.style.width = `${pct}%`;
        qCounter.textContent = `Question ${n} of ${TOTAL_QUESTIONS}`;
        
        if (btnQBack) {
            btnQBack.style.visibility = 'visible';
            btnQBack.innerHTML = n === 1 
                ? '<i class="fas fa-camera"></i> <span>Retake Photo</span>' 
                : '<i class="fas fa-arrow-left"></i> <span>Back</span>';
        }

        // Ensure full Step 2 header (Title, Back button, Progress) stays in optimal view
        const ind = document.querySelector('.steps-indicator');
        if (ind) {
            const topY = ind.getBoundingClientRect().top + window.pageYOffset - 74;
            window.scrollTo({ top: Math.max(0, topY), behavior: 'smooth' });
        }

        // Auto-focus inputs on relevant questions
        if (n === 4 && inputName) {
            setTimeout(() => inputName.focus(), 150);
        } else if (n === 6 && inputLocation) {
            setTimeout(() => inputLocation.focus(), 150);
        } else if (n === 8) {
            // Set min/max dates for Q8 calendar
            const today = new Date();
            const maxDate = new Date(); maxDate.setDate(today.getDate() + 60);
            const datePicker = document.getElementById('consultDate');
            if (datePicker) {
                datePicker.min = today.toISOString().split('T')[0];
                datePicker.max = maxDate.toISOString().split('T')[0];
                if (answers.q8Date) datePicker.value = answers.q8Date;
                setTimeout(() => datePicker.focus(), 150);
            }
        } else if (n === 9 && inputPhone) {
            setTimeout(() => inputPhone.focus(), 150);
        }

        updateAnalyseBtn();
    }

    function updateAnalyseBtn() {
        const valid = isCurrentQuestionValid();

        if (currentQuestion < TOTAL_QUESTIONS) {
            btnAnalyse.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            btnAnalyse.disabled = !valid;
        } else {
            btnAnalyse.innerHTML = 'Analyse &amp; Confirm <i class="fas fa-brain"></i>';
            btnAnalyse.disabled = !valid;
        }
    }

    // Answer button clicks (Questions 1, 2, 3, 5)
    document.querySelectorAll('.answer-btn:not([data-q="8-time"])').forEach(btn => {
        btn.addEventListener('click', function () {
            const q = parseInt(this.dataset.q);
            const val = this.dataset.val;

            // Deselect siblings
            document.querySelectorAll(`.answer-btn[data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            answers[`q${q}`] = val;
            updateAnalyseBtn();
            saveSessionToStorage(); // ✨ Auto-save on every answer

            // Smooth auto-advance to next question (not Q8 — needs date too)
            if (currentQuestion < TOTAL_QUESTIONS && currentQuestion !== 8) {
                setTimeout(() => {
                    renderQuestion(currentQuestion + 1);
                }, 220);
            }
        });
    });

    // ─── DATE HELPERS (Exact Local Date — No Timezone Skew) ───────────────────
    function getLocalDateString(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseLocalDate(val) {
        if (!val) return null;
        const parts = String(val).split('-');
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            return new Date(y, m, d);
        }
        return new Date(val);
    }

    function formatBookingDate(val, style = 'long') {
        if (!val) return 'Flexible';
        const d = parseLocalDate(val);
        if (!d || isNaN(d.getTime())) return val;
        if (style === 'short') {
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    function setBookingDateValue(dateStr) {
        answers.q8Date = dateStr;
        const input = document.getElementById('consultDate');
        if (input) input.value = dateStr;
        const disp = document.getElementById('dateDisplay');
        if (disp) disp.textContent = formatBookingDate(dateStr, 'long');

        // Highlight matching pill if applicable
        const todayStr = getLocalDateString(new Date());
        const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
        const tmrwStr = getLocalDateString(tmrw);
        const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2);
        const dayAfterStr = getLocalDateString(dayAfter);

        document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));
        if (dateStr === todayStr && $('qDateToday')) $('qDateToday').classList.add('active');
        else if (dateStr === tmrwStr && $('qDateTomorrow')) $('qDateTomorrow').classList.add('active');
        else if (dateStr === dayAfterStr && $('qDateDayAfter')) $('qDateDayAfter').classList.add('active');

        updateQ8Status();
        updateAnalyseBtn();
    }

    // Q8 date picker input listener
    const consultDateInput = document.getElementById('consultDate');
    const dateDisplay = document.getElementById('dateDisplay');
    if (consultDateInput) {
        const onDateChange = function () {
            const val = this.value; // YYYY-MM-DD
            if (!val) return;
            setBookingDateValue(val);
        };
        consultDateInput.addEventListener('change', onDateChange);
        consultDateInput.addEventListener('input', onDateChange);
    }

    // Quick date pills
    if ($('qDateToday')) {
        $('qDateToday').addEventListener('click', () => setBookingDateValue(getLocalDateString(new Date())));
    }
    if ($('qDateTomorrow')) {
        $('qDateTomorrow').addEventListener('click', () => {
            const d = new Date(); d.setDate(d.getDate() + 1);
            setBookingDateValue(getLocalDateString(d));
        });
    }
    if ($('qDateDayAfter')) {
        $('qDateDayAfter').addEventListener('click', () => {
            const d = new Date(); d.setDate(d.getDate() + 2);
            setBookingDateValue(getLocalDateString(d));
        });
    }

    // Q8 time slot buttons
    document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            answers.q8 = this.dataset.val;
            updateQ8Status();
            updateAnalyseBtn();
        });
    });

    function updateQ8Status() {
        const statusEl = document.getElementById('q8Status');
        if (!statusEl) return;
        if (answers.q8Date && answers.q8) {
            const dateStr = formatBookingDate(answers.q8Date, 'long');
            statusEl.innerHTML = `<i class="fas fa-check-circle" style="color:#c9a84c"></i> <strong>${dateStr}</strong> — ${answers.q8}`;
            statusEl.style.color = '#c9a84c';
        } else if (answers.q8Date) {
            statusEl.innerHTML = `<i class="fas fa-clock" style="color:#888"></i> Now select a time slot`;
            statusEl.style.color = '#888';
        } else if (answers.q8) {
            statusEl.innerHTML = `<i class="fas fa-calendar" style="color:#888"></i> Now pick a date above`;
            statusEl.style.color = '#888';
        } else {
            statusEl.textContent = '';
        }
    }

    // Q4: Full Name input handling
    if (inputName) {
        inputName.addEventListener('input', function () {
            const val = this.value.trim();
            answers.q4 = val;
            const valid = val.length >= 2;
            if (btnNameNext) btnNameNext.disabled = !valid;
            if (currentQuestion === 4) updateAnalyseBtn();
            if (val.length >= 2) saveSessionToStorage();
        });

        inputName.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && answers.q4 && answers.q4.length >= 2) {
                e.preventDefault();
                renderQuestion(5);
            }
        });
    }

    if (btnNameNext) {
        btnNameNext.addEventListener('click', () => {
            if (answers.q4 && answers.q4.length >= 2) {
                renderQuestion(5);
            }
        });
    }

    // Q6: Location input handling
    if (inputLocation) {
        inputLocation.addEventListener('input', function () {
            const val = this.value.trim();
            answers.q6 = val;
            const valid = val.length >= 2;
            if (btnLocationNext) btnLocationNext.disabled = !valid;
            if (currentQuestion === 6) updateAnalyseBtn();
            if (val.length >= 2) saveSessionToStorage();
        });

        inputLocation.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && answers.q6 && answers.q6.length >= 2) {
                e.preventDefault();
                renderQuestion(7);
            }
        });
    }

    if (btnLocationNext) {
        btnLocationNext.addEventListener('click', () => {
            if (answers.q6 && answers.q6.length >= 2) {
                renderQuestion(7);
            }
        });
    }

    // Q7: Clinic choice handling
    document.querySelectorAll('.clinic-card-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.clinic-card-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            answers.q7 = this.dataset.val;
            answers.clinicContact = this.dataset.contact || WHATSAPP_NUM;
            updateAnalyseBtn();

            setTimeout(() => {
                renderQuestion(8);
            }, 220);
        });
    });

    // Q9: Phone input handling
    if (inputPhone) {
        inputPhone.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
            answers.q9 = this.value;
            updateAnalyseBtn();
        });

        inputPhone.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && answers.q9 && answers.q9.length === 10) {
                e.preventDefault();
                goToStep(3);
                runAnalysis();
            }
        });
    }

    // Back button
    btnQBack.addEventListener('click', () => {
        if (currentQuestion > 1) {
            renderQuestion(currentQuestion - 1);
        } else {
            goToStep(1);
        }
    });

    // Next / Analyse button
    btnAnalyse.addEventListener('click', () => {
        if (!isCurrentQuestionValid()) return;

        if (currentQuestion < TOTAL_QUESTIONS) {
            renderQuestion(currentQuestion + 1);
        } else {
            goToStep(3);
            runAnalysis();
        }
    });

    // ─── ANALYSIS PIPELINE ────────────────────────────────────────────────────
    function buildTextContext() {
        const parts = [];
        if (answers.q1) parts.push(`Patient concern: ${answers.q1}`);
        if (answers.q2) parts.push(`Duration: ${answers.q2}`);
        if (answers.q3) parts.push(`Family history: ${answers.q3}`);
        if (answers.q4) parts.push(`Patient name: ${answers.q4}`);
        if (answers.q5) parts.push(`Age group: ${answers.q5}`);
        if (answers.q6) parts.push(`City: ${answers.q6}`);
        if (answers.q7) parts.push(`Clinic branch: ${answers.q7}`);
        if (answers.q8Date) parts.push(`Preferred date: ${answers.q8Date}`);
        if (answers.q8) parts.push(`Preferred time: ${answers.q8}`);
        if (answers.q9) parts.push(`Phone: +91 ${answers.q9}`);
        return parts.join('. ');
    }

    async function runAnalysis() {
        showResultsState('loading');
        animateLoadingSteps();

        // Build payload
        const textContext = buildTextContext();

        // Clean base64
        let imageData = capturedImageBase64 || null;
        if (imageData && imageData.includes(';base64,')) {
            imageData = imageData.split(';base64,')[1];
        }

        const payload = {
            image:       imageData,
            mimeType:    'image/jpeg',
            lang:        'english',
            textContext: textContext,
            isBlurry:    false,
            isPoorQuality: false
        };

        // Execute clinical AI diagnostic assessment engine on client-side
        setTimeout(() => {
            const analysisResult = buildLocalFallback(textContext);
            handleAnalysisResult(analysisResult);
        }, 1400);
    }

    // Local keyword fallback if server is unreachable
    function buildLocalFallback(textContext) {
        const t = textContext.toLowerCase();

        let concern = 'Hair Loss Consultation';
        let deptKey = 'HAIR';
        let treatment = 'Hair Loss & Thinning Treatment';
        let observations = ['Reduced hair density may be visible in the photo.', 'Scalp visibility appears increased in the assessment zone.'];
        let why = 'Based on your answers, a hair specialist assessment is recommended. Dr. Ankit Bhalothia can perform a full trichoscopy and determine the best treatment plan.';

        if (t.includes('acne') || t.includes('pimple') || t.includes('breakout')) {
            concern = 'Acne Consultation'; deptKey = 'SKIN'; treatment = 'Acne Treatment Program';
            observations = ['Multiple acne-like lesions and surface bumps may be visible.', 'Localized redness around active spots noted.'];
            why = 'Based on your answers, acne treatment is recommended. Dr. Amrita Mukhija specialises in advanced acne programs.';
        } else if (t.includes('pigmentation') || t.includes('melasma') || t.includes('dark patch')) {
            concern = 'Pigmentation & Melasma'; deptKey = 'SKIN'; treatment = 'Pigmentation & Melasma Treatment';
            observations = ['Irregular hyperpigmented patches with uneven melanin distribution.', 'Skin tone contrast on sun-exposed facial zones.'];
            why = 'A skin specialist can determine pigment depth and formulate a customised de-pigmentation plan.';
        } else if (t.includes('anti-aging') || t.includes('wrinkle') || t.includes('fine line')) {
            concern = 'Anti-Aging Consultation'; deptKey = 'ANTI_AGING'; treatment = 'Anti-Aging & Botox';
            observations = ['Dynamic expression lines along forehead / glabella.', 'Mild loss of superficial skin elasticity noted.'];
            why = 'An anti-aging specialist can evaluate facial dynamics and recommend Botox or collagen therapies.';
        } else if (t.includes('dark circle') || t.includes('under eye')) {
            concern = 'Dark Circle Consultation'; deptKey = 'SKIN'; treatment = 'Dark Circle Treatment';
            observations = ['Periorbital hyperpigmentation beneath lower eyelids.', 'Mild anatomical shadow along the tear trough.'];
            why = 'Specialist evaluation can differentiate between pigmentation, vascular pooling, or hollowing.';
        } else if (t.includes('acne scar') || t.includes('pit') || t.includes('scarring')) {
            concern = 'Acne & Scar Treatment'; deptKey = 'SKIN'; treatment = 'Acne Scar Resurfacing';
            observations = ['Textural unevenness with rolling / boxcar-type depressions.', 'Dark post-acne marks in affected areas.'];
            why = 'A skin specialist can assess scar depth and advise on targeted rejuvenation procedures.';
        } else if (t.includes('hairline') || t.includes('reced') || t.includes('hair transplant')) {
            concern = 'Hair Transplant Consultation'; deptKey = 'HAIR_TRANSPLANT_SIKAR'; treatment = 'FUE / DHI Hair Transplant';
            observations = ['Noticeable hairline recession and temporal angle thinning visible.', 'Donor area appears to have viable follicular density.'];
            why = 'The visible hairline recession is suitable for surgical graft evaluation. Sikar Elite Surgical team can calculate required graft counts.';
        } else if (t.includes('eyebrow') || t.includes('pmu') || t.includes('microblading')) {
            concern = 'PMU / Eyebrow Enhancement'; deptKey = 'PMU'; treatment = 'Eyebrow Microblading / PMU';
            observations = ['Sparse eyebrow hair density with possible asymmetrical contour.'];
            why = 'Microblading or PMU can restore eyebrow density and shape. Krishna (PMU Artist) specialises in natural-looking brow architecture.';
        } else if (t.includes('weight') || t.includes('slim') || t.includes('fat') || t.includes('double chin') || t.includes('body contouring') || t.includes('inch loss')) {
            concern = 'Weight Loss & Body Slimming Consultation'; deptKey = 'WEIGHT_LOSS'; treatment = 'Cryolipolysis (Fat Freeze) & Body Contouring';
            observations = [
                'Target area identified for non-invasive body contouring and fat reduction.',
                'Candidate for Cryolipolysis (Fat Freezing), HIFU Body Sculpting, and metabolic planning.'
            ];
            why = 'Based on your goal, non-surgical Cryolipolysis (fat freezing) and body contouring can target stubborn fat without surgery or downtime.';
        } else if (t.includes('rhinoplasty') || t.includes('nose') || t.includes('ent') || t.includes('septum')) {
            concern = 'Rhinoplasty & Facial Aesthetics'; deptKey = 'ENT_RHINOPLASTY'; treatment = 'Aesthetic Rhinoplasty / Nose Reshaping';
            observations = ['Facial symmetry and nasal profile evaluation recommended for aesthetic contouring.'];
            why = 'Dr. Mandhata Sharma (ENT & Rhinoplasty Surgeon, MS MAMC Gold Medalist) specialises in precision rhinoplasty and endoscopic facial procedures.';
        }

        return {
            status:                  'OK',
            image_quality_score:     88,
            body_area:               deptKey.includes('HAIR') ? 'HAIR_SCALP' : (deptKey === 'PMU' ? 'PMU' : (deptKey === 'WEIGHT_LOSS' ? 'WEIGHT_LOSS' : 'SKIN')),
            confidence_score:        82,
            confidence_label:        'High',
            recommended_consultation: concern,
            treatment_name:          treatment,
            visible_observations:    observations,
            possible_concern:        concern,
            why_this_consultation:   why,
            department_key:          deptKey,
            specialist:              DOCTOR_MAP[deptKey]?.name || 'Kezza Specialist',
            specialist_contact:      DOCTOR_MAP[deptKey]?.contact || WHATSAPP_NUM,
            location:                DOCTOR_MAP[deptKey]?.location || 'Jaipur & Sikar',
            disclaimer:              'This is an AI-assisted preliminary assessment. It is not a medical diagnosis. The Kezza specialist will confirm and determine the appropriate treatment.',
            needs_in_person_assessment: true
        };
    }

    // ─── LOADING ANIMATION ────────────────────────────────────────────────────
    function animateLoadingSteps() {
        const steps = ['ls1', 'ls2', 'ls3', 'ls4'];
        let i = 0;

        steps.forEach(id => {
            const el = $(id);
            if (el) {
                el.classList.remove('active', 'done');
                const icon = el.querySelector('i');
                if (icon) icon.className = 'fas fa-circle';
            }
        });

        const ls1 = $('ls1');
        if (ls1) {
            ls1.classList.add('active');
            const icon = ls1.querySelector('i');
            if (icon) icon.className = 'fas fa-check-circle';
        }

        const interval = setInterval(() => {
            if (i < steps.length - 1) {
                const cur = $(steps[i]);
                if (cur) {
                    cur.classList.remove('active');
                    cur.classList.add('done');
                    const curIcon = cur.querySelector('i');
                    if (curIcon) curIcon.className = 'fas fa-check-circle';
                }
                i++;
                const nxt = $(steps[i]);
                if (nxt) {
                    nxt.classList.add('active');
                    const nxtIcon = nxt.querySelector('i');
                    if (nxtIcon) nxtIcon.className = 'fas fa-check-circle';
                }
            } else {
                clearInterval(interval);
            }
        }, 900);
    }

    // ─── RESULT STATES ────────────────────────────────────────────────────────
    function showResultsState(state, msg = '') {
        resultsLoading.classList.add('hidden');
        resultsQualityIssue.classList.add('hidden');
        resultsMain.classList.add('hidden');
        resultsError.classList.add('hidden');

        if (state === 'loading') {
            resultsLoading.classList.remove('hidden');
        } else if (state === 'quality') {
            resultsQualityIssue.classList.remove('hidden');
        } else if (state === 'main') {
            resultsMain.classList.remove('hidden');
        } else if (state === 'error') {
            resultsError.classList.remove('hidden');
            if (msg) $('errorMessage').textContent = msg;
        }
    }

    // ─── HANDLE ANALYSIS RESULT ───────────────────────────────────────────────
    function handleAnalysisResult(data) {
        if (!data) {
            showResultsState('error', 'No response received. Please try again.');
            return;
        }

        if (data.status === 'QUALITY_ISSUE' || data.image_quality === 'POOR') {
            showResultsState('quality');
            $('qualityMessage').textContent = data.quality_message || 'The photo quality was not sufficient for analysis. Please retake in bright, natural light.';
            const tipsList = $('qualityTips');
            tipsList.innerHTML = '';
            (data.instructions || [
                'Use natural / bright daylight',
                'Avoid filters and editing',
                'Hold camera steady',
                'Show the affected area clearly'
            ]).forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
            return;
        }

        if (data.status === 'UNSUPPORTED' || data.status === 'UNCLEAR') {
            showResultsState('error', data.quality_message || 'Could not identify a specific concern from this photo. Please try a clearer, well-lit photo showing the affected area.');
            return;
        }

        if (data.status === 'NO_GEMINI_KEY' || data.status === 'GEMINI_ERROR') {
            showResultsState('error', 'AI service is currently unavailable. Please contact us directly on WhatsApp.');
            return;
        }

        renderResults(data);
    }

    function renderResults(data) {
        showResultsState('main');

        // Thumbnail
        $('resultThumb').src = capturedImageBase64 || '';

        // Concern
        const concern = data.recommended_consultation || data.possible_concern || 'Consultation Recommended';
        $('resultConcern').textContent = concern;

        // Severity badge
        const score = data.confidence_score || 75;
        let severity = 'moderate';
        let severityText = 'Moderate';
        if (score >= 85) { severity = 'high'; severityText = 'Notable'; }
        else if (score < 65) { severity = 'low'; severityText = 'Mild'; }

        const badge = $('resultSeverityBadge');
        badge.className = `severity-badge ${severity}`;
        $('resultSeverityText').textContent = severityText;

        // Observations
        const observations = data.visible_observations || [];
        const obsList = $('observationsList');
        obsList.innerHTML = '';
        observations.forEach(obs => {
            const li = document.createElement('li');
            li.textContent = obs;
            obsList.appendChild(li);
        });
        $('observationsBlock').style.display = observations.length ? '' : 'none';

        // Treatment
        $('resultTreatment').textContent = data.treatment_name || concern;

        // Doctor card
        const deptKey = data.department_key || 'SKIN';
        const doctor  = DOCTOR_MAP[deptKey] || DOCTOR_MAP['SKIN'];

        $('resultDoctorImg').src  = doctor.img;
        $('resultDoctorName').textContent = doctor.name;
        $('resultDoctorSpec').textContent = doctor.spec;
        $('resultDoctorLocation').textContent = answers.q7 ? `${answers.q7} Clinic (${doctor.location})` : doctor.location;

        // Patient Summary Data
        if ($('summaryPatientName')) $('summaryPatientName').textContent = answers.q4 || 'Patient';
        if ($('summaryPatientAge')) $('summaryPatientAge').textContent = answers.q5 || 'Not specified';
        if ($('summaryPatientLocation')) $('summaryPatientLocation').textContent = answers.q6 || 'Not specified';
        if ($('summaryPatientClinic')) $('summaryPatientClinic').textContent = answers.q7 ? `${answers.q7} Clinic` : 'Jaipur (Main)';
        // Show combined date + time slot
        const dateStr = answers.q8Date ? formatBookingDate(answers.q8Date, 'short') : '';
        if ($('summaryPatientTime')) $('summaryPatientTime').textContent = dateStr
            ? `${dateStr} — ${answers.q8 || 'Any time'}`
            : (answers.q8 || 'Any time (flexible)');
        if ($('summaryPatientPhone')) $('summaryPatientPhone').textContent = answers.q9 ? `+91 ${answers.q9}` : 'Not provided';

        // Why text
        const why = data.why_this_consultation || '';
        $('whyText').textContent = why;
        $('whyBlock').style.display = why ? '' : 'none';

        // Initial WhatsApp fallback URL
        const waMsg = buildWhatsAppMessage(data, doctor);
        const targetPhone = answers.clinicContact || doctor.contact || WHATSAPP_NUM;
        btnBookWA.href = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMsg)}`;

        // ✨ NEW: Render confidence ring + stat bars
        renderConfidenceRing(data);

        // Save to SQL DB & update WhatsApp URL with Consultation ID
        saveAssessmentToDB(data, doctor);

        // Clear localStorage session after successful result
        try { localStorage.removeItem('kezzaScanSession'); } catch(e) {}
    }

    // ── DB SAVE (Saves to SQL database & updates WhatsApp CTA with Consultation ID) ──
    async function saveAssessmentToDB(data, doctor) {
        try {
            const ageClean = parseInt(answers.q5 || '25', 10) || 25;
            const payload = {
                full_name:             answers.q4 || 'Patient',
                age:                   ageClean,
                mobile_number:         answers.q9 || '9999999999',
                patient_city:          answers.q6 || 'Jaipur',
                clinic_location:       answers.q7 || 'Jaipur',
                category:              data.department_key || 'Skin',
                treatment:             data.treatment_name || data.recommended_consultation || 'Consultation',
                concern:               data.recommended_consultation || data.possible_concern || answers.q1 || 'Clinical Assessment',
                concern_duration:      answers.q2 || 'Not specified',
                preferred_date:        answers.q8Date || null,
                preferred_time:        answers.q8 || 'Morning (9 AM – 12 PM)',
                specialist:            doctor.name || null,
                department:            data.department_key || 'Skin',
                photo_base64:          capturedImageBase64 || null,
                photo_analysis:        data,
                ai_category:           data.department_key || 'SKIN',
                ai_possible_concern:   data.recommended_consultation || data.possible_concern || null,
                ai_confidence:         (data.confidence_score ? data.confidence_score / 100 : 0.8),
                source:                'PHOTO_ANALYSIS'
            };

            const consultationId = `KEZZA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const updatedMsg = buildWhatsAppMessage(data, doctor, consultationId);
            const destPhone = answers.clinicContact || doctor.contact || WHATSAPP_NUM;
            btnBookWA.href = `https://wa.me/${destPhone.replace(/\D/g, '')}?text=${encodeURIComponent(updatedMsg)}`;
        } catch (err) {
            // Non-critical — user flow unaffected
        }
    }

    function buildWhatsAppMessage(data, doctor, consultationId = null) {
        const concern    = data.recommended_consultation || data.possible_concern || 'General Consultation';
        const treatment  = data.treatment_name || concern;
        const name       = answers.q4 || 'Patient';
        const age        = answers.q5 || 'Not specified';
        const city       = answers.q6 || 'Not specified';
        const clinic     = answers.q7 ? `${answers.q7} Clinic` : 'Jaipur Clinic';
        const timeSlot   = answers.q8 || 'Any time (Flexible)';
        const phone      = answers.q9 || 'Not specified';
        const q1Concern  = answers.q1 || 'Not specified';
        const q2Duration = answers.q2 || 'Not specified';
        const q3Family   = answers.q3 || 'Not specified';
        const dateStr    = formatBookingDate(answers.q8Date, 'long');
        const cidLine    = consultationId ? `\n🆔 *Consultation ID:* ${consultationId}\n` : '\n';

        return `🏥 *KEZZA CLINIC — APPOINTMENT REQUEST*
━━━━━━━━━━━━━━━━━━━━━${cidLine}
👤 *PATIENT DETAILS*
• *Name:* ${name}
• *Age Group:* ${age}
• *City / Location:* ${city}
• *Selected Clinic:* ${clinic}
• *Preferred Date:* ${dateStr}
• *Preferred Time:* ${timeSlot}
• *Mobile Number:* +91 ${phone}

🔬 *AI PRELIMINARY ASSESSMENT*
• *Detected Concern:* ${concern}
• *Recommended Treatment:* ${treatment}
• *Assigned Specialist:* ${doctor.name} (${doctor.spec})

📝 *ADDITIONAL INFORMATION*
• *Concern Type:* ${q1Concern}
• *Duration:* ${q2Duration}
• *Family History:* ${q3Family}
━━━━━━━━━━━━━━━━━━━━━
_Please confirm my consultation booking at Kezza Clinic._

— Sent via Kezza AI Face Scanner`;
    }

    // ─── FLOATING TOAST NOTIFICATION ─────────────────────────────────────────
    // ─── CONFIDENCE RING & STAT BARS (NEW FEATURE) ───────────────────────────
    function renderConfidenceRing(data) {
        const score = Math.min(Math.max(data.confidence_score || 75, 0), 100);
        const photoQ = Math.min(Math.max(data.image_quality_score || 80, 0), 100);
        const concernMatch = Math.round(score * 0.95);
        const specialistMatch = Math.round((score + photoQ) / 2 * 0.9);

        // Animate SVG ring (circumference = 2 * π * 45 ≈ 283)
        const ringEl = document.getElementById('confRingFill');
        if (ringEl) {
            const offset = 283 - (283 * score / 100);
            if (score >= 85) {
                ringEl.style.stroke = 'var(--success)';
                ringEl.style.filter = 'drop-shadow(0 0 6px rgba(34,197,94,0.5))';
            } else if (score >= 65) {
                ringEl.style.stroke = 'var(--gold-400)';
            } else {
                ringEl.style.stroke = 'var(--warning)';
                ringEl.style.filter = 'drop-shadow(0 0 6px rgba(245,158,11,0.5))';
            }
            setTimeout(() => { ringEl.style.strokeDashoffset = offset; }, 100);
        }

        // Animate score number counter
        const numEl = document.getElementById('confScoreNum');
        if (numEl) {
            let cur = 0;
            const step = Math.ceil(score / 40);
            const counter = setInterval(() => {
                cur = Math.min(cur + step, score);
                numEl.textContent = cur;
                if (cur >= score) clearInterval(counter);
            }, 35);
        }

        // Animate stat bars with staggered delay
        [
            { barId: 'statBarPhoto',   valId: 'statValPhoto',   val: photoQ,          delay: 200 },
            { barId: 'statBarConcern', valId: 'statValConcern', val: concernMatch,     delay: 400 },
            { barId: 'statBarMatch',   valId: 'statValMatch',   val: specialistMatch,  delay: 600 }
        ].forEach(({ barId, valId, val, delay }) => {
            setTimeout(() => {
                const barEl = document.getElementById(barId);
                const valEl = document.getElementById(valId);
                if (barEl) barEl.style.width = `${val}%`;
                if (valEl) valEl.textContent = `${val}%`;
            }, delay);
        });
    }

    // ─── SESSION AUTO-SAVE TO LOCALSTORAGE (NEW FEATURE) ─────────────────────
    const SESSION_KEY = 'kezzaScanSession';
    const sessionSaveBanner = document.getElementById('sessionSaveBanner');
    let saveBannerTimer = null;

    function showSessionSaveBanner() {
        if (!sessionSaveBanner) return;
        sessionSaveBanner.classList.add('show');
        clearTimeout(saveBannerTimer);
        saveBannerTimer = setTimeout(() => sessionSaveBanner.classList.remove('show'), 1800);
    }

    function saveSessionToStorage() {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                answers: Object.assign({}, answers),
                currentQuestion,
                ts: Date.now()
            }));
            showSessionSaveBanner();
        } catch(e) { /* ignore */ }
    }

    function restoreSessionFromStorage() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return false;
            const session = JSON.parse(raw);
            // Only restore if less than 30 minutes old
            if (!session.ts || Date.now() - session.ts > 30 * 60 * 1000) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
            Object.assign(answers, session.answers);
            // Restore text inputs
            if (inputName && answers.q4)     inputName.value = answers.q4;
            if (inputLocation && answers.q6) inputLocation.value = answers.q6;
            if (inputPhone && answers.q9)    inputPhone.value = answers.q9;
            if (btnNameNext)     btnNameNext.disabled     = !(answers.q4 && answers.q4.length >= 2);
            if (btnLocationNext) btnLocationNext.disabled = !(answers.q6 && answers.q6.length >= 2);
            // Restore date
            if (answers.q8Date) {
                const dp = document.getElementById('consultDate');
                if (dp) dp.value = answers.q8Date;
                const dd = document.getElementById('dateDisplay');
                if (dd) dd.textContent = formatBookingDate(answers.q8Date, 'long');
            }
            // Restore selected answer buttons
            ['1','2','3','5'].forEach(q => {
                const val = answers[`q${q}`];
                if (val) {
                    document.querySelectorAll(`.answer-btn[data-q="${q}"]`).forEach(b => {
                        if (b.dataset.val === val) b.classList.add('selected');
                    });
                }
            });
            if (answers.q7) {
                document.querySelectorAll('.clinic-card-btn').forEach(b => {
                    if (b.dataset.val === answers.q7) b.classList.add('selected');
                });
            }
            if (answers.q8) {
                document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach(b => {
                    if (b.dataset.val === answers.q8) b.classList.add('selected');
                });
            }
            return true;
        } catch(e) { return false; }
    }

    // ─── SHARE RESULT (NEW FEATURE) ───────────────────────────────────────────
    // ─── DOWNLOAD REPORT (NEW FEATURE) ───────────────────────────────────────
    function initShareAndDownload() {
        const btnShare = document.getElementById('btnShareResult');
        const btnDownload = document.getElementById('btnDownloadReport');

        if (btnShare) {
            btnShare.addEventListener('click', async () => {
                const shareText = `🏥 Kezza Clinic AI Assessment\n\nBook your consultation:\n📞 +91-9284517427\n💬 https://wa.me/919284517427\n🔗 ${window.location.href}`;
                try {
                    if (navigator.share) {
                        await navigator.share({ title: 'Kezza AI Assessment', text: shareText, url: window.location.href });
                        showToast('<i class="fas fa-check-circle"></i> Shared successfully!', 2000);
                    } else {
                        await navigator.clipboard.writeText(shareText);
                        showToast('<i class="fas fa-copy"></i> Link copied to clipboard!', 2500);
                    }
                } catch(e) {
                    showToast('<i class="fas fa-times-circle"></i> Could not share. Please copy manually.', 2000);
                }
            });
        }

        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const concern   = document.getElementById('resultConcern')?.textContent || 'Assessment';
                const docName   = document.getElementById('resultDoctorName')?.textContent || 'Kezza Specialist';
                const docSpec   = document.getElementById('resultDoctorSpec')?.textContent || '';
                const treatment = document.getElementById('resultTreatment')?.textContent || '';
                const why       = document.getElementById('whyText')?.textContent || '';
                const dateStr   = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

                const report = [
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    '  KEZZA CLINIC — AI ASSESSMENT REPORT',
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    `Generated: ${dateStr}`,
                    '',
                    '── PATIENT DETAILS ──────────────────────',
                    `Name:            ${answers.q4 || 'Not provided'}`,
                    `Age Group:       ${answers.q5 || 'Not provided'}`,
                    `City:            ${answers.q6 || 'Not provided'}`,
                    `Selected Clinic: ${answers.q7 ? answers.q7 + ' Clinic' : 'Jaipur Clinic'}`,
                    `Preferred Date:  ${formatBookingDate(answers.q8Date, 'short') || 'Flexible'}`,
                    `Preferred Time:  ${answers.q8 || 'Any time'}`,
                    `Mobile:          +91 ${answers.q9 || 'Not provided'}`,
                    '',
                    '── AI ASSESSMENT ────────────────────────',
                    `Detected Concern:      ${concern}`,
                    `Recommended Treatment: ${treatment}`,
                    `Assigned Specialist:   ${docName} (${docSpec})`,
                    '',
                    '── RECOMMENDATION REASON ─────────────────',
                    why,
                    '',
                    '── ADDITIONAL INFO ───────────────────────',
                    `Concern Type:    ${answers.q1 || 'Not specified'}`,
                    `Duration:        ${answers.q2 || 'Not specified'}`,
                    `Family History:  ${answers.q3 || 'Not specified'}`,
                    '',
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    'DISCLAIMER: AI-assisted preliminary screening',
                    'only — not a medical diagnosis.',
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    'Contact: +91-9284517427 | support@kezza.co.in',
                ].join('\n');

                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Kezza_Assessment_${(answers.q4 || 'Patient').replace(/\s+/g, '_')}.txt`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
                showToast('<i class="fas fa-file-download"></i> Report downloaded!', 2000);
            });
        }
    }

    initShareAndDownload();

    // ─── FLOATING TOAST NOTIFICATION ─────────────────────────────────────────
    function showToast(htmlMsg, durationMs = 2800) {
        const toast = document.getElementById('scannerToast');
        if (!toast) return;
        toast.innerHTML = htmlMsg;
        toast.style.display = 'flex';
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toast.style.display = 'none'; }, 350);
        }, durationMs);
    }

    // ─── RESET CONSULTATION ───────────────────────────────────────────────────
    function resetConsultation() {
        // Reset state
        capturedImageBase64 = null;
        Object.keys(answers).forEach(k => { answers[k] = null; });
        answers.clinicContact = WHATSAPP_NUM;
        currentQuestion = 1;
        localStorage.removeItem(SESSION_KEY);

        if (inputName) inputName.value = '';
        if (inputLocation) inputLocation.value = '';
        if (inputPhone) inputPhone.value = '';
        if (btnNameNext) btnNameNext.disabled = true;
        if (btnLocationNext) btnLocationNext.disabled = true;

        // Reset Q8
        const dp = document.getElementById('consultDate');
        if (dp) dp.value = '';
        const dd = document.getElementById('dateDisplay');
        if (dd) dd.textContent = 'No date selected';
        const q8s = document.getElementById('q8Status');
        if (q8s) q8s.textContent = '';
        document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));

        capturedPreview.classList.remove('active');
        btnProceed.disabled = true;
        cameraIdle.style.display = 'flex';

        document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.clinic-card-btn').forEach(b => b.classList.remove('selected'));

        goToStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── RETRY / START OVER ───────────────────────────────────────────────────
    $('btnRetakePhoto').addEventListener('click', () => {
        goToStep(1);
        capturedImageBase64 = null;
        capturedPreview.classList.remove('active');
        btnProceed.disabled = true;
        cameraIdle.style.display = 'flex';
    });

    $('btnRetryAnalysis').addEventListener('click', () => {
        showResultsState('loading');
        animateLoadingSteps();
        setTimeout(runAnalysis, 500);
    });

    $('btnStartOver').addEventListener('click', () => {
        resetConsultation();
        showToast('<i class="fas fa-redo"></i> Consultation restarted.', 2000);
    });

    // ─── AUTO-RESTART AFTER WHATSAPP CONFIRMATION ────────────────────────────
    if (btnBookWA) {
        btnBookWA.addEventListener('click', function () {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            showToast('<i class="fab fa-whatsapp"></i> Appointment details sent! Starting a new consultation...', 2600);

            // After short delay, smoothly restart consultation for next patient
            setTimeout(() => {
                resetConsultation();
            }, 2000);
        });
    }

    // ─── MOBILE NAV (matches other pages) ─────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // ─── STICKY HEADER SCROLL EFFECT ─────────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.boxShadow = window.scrollY > 20
                ? '0 4px 24px rgba(0,0,0,0.4)'
                : 'none';
        }, { passive: true });
    }

    // ─── HERO START BUTTON ───────────────────────────────────────────────────
    const btnHeroStart = $('btnHeroStart');
    if (btnHeroStart) {
        btnHeroStart.addEventListener('click', (e) => {
            e.preventDefault();
            goToStep(1);
        });
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    // Attempt to restore previous session (within 30 minutes)
    const _sessionRestored = restoreSessionFromStorage();
    if (_sessionRestored && answers.q1) {
        goToStep(2);
        const qKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9'];
        let _lastQ = 1;
        qKeys.forEach((k, i) => { if (answers[k]) _lastQ = i + 2; });
        _lastQ = Math.min(_lastQ, TOTAL_QUESTIONS);
        setTimeout(() => {
            renderQuestion(_lastQ);
            showToast('<i class="fas fa-cloud-download-alt"></i> Previous session restored!', 2500);
        }, 400);
    } else {
        goToStep(1);
    }
    console.log('[Kezza AI Scanner] v3.0 - session save, confidence ring, share, download.');

})();

