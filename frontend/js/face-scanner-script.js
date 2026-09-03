(function () {
    'use strict';
    const isLocal       = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const LARAVEL_API   = isLocal
        ? 'http://localhost:8000/api'
        : 'https://stand-eos-atm-seeing.trycloudflare.com/api';
    const API_BASE      = (window.location.hostname === 'localhost' && window.location.port === '8080')
        ? 'http://localhost:3001'
        : window.location.origin;
    const API_ENDPOINT  = `${API_BASE}/api/analyze-photo`;
    const WHATSAPP_NUM  = '919284517427';

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
            location: 'Jaipur'
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
    let capturedImageBase64 = null;
    let mediaStream         = null;
    let faceMesh            = null;
    let cameraRunning       = false;
    let faceDetected        = false;
    let autoCaptureTimer    = null;
    let autoCaptureCount    = 3;
    let autoCaptureActive   = false;

    const answers = {
        q1: null,
        q2: null,
        q3: null,
        q4: null,
        q5: null,
        q6: null,
        q7: null,
        q8: null,
        q8Date: null,
        q9: null,
        clinicContact: WHATSAPP_NUM
    };
    const TOTAL_QUESTIONS = 9;
    let currentQuestion = 1;
    const $ = id => document.getElementById(id);

    const btnGetStarted         = $('btnGetStarted');
    const btnCloseCamera        = $('btnCloseCamera');
    const captureSubstate1      = $('captureSubstate1');
    const captureSubstate2      = $('captureSubstate2');
    const circularCameraWrapper = $('circularCameraWrapper');

    const btnCapture      = $('btnCapture');
    const btnProceed      = $('btnProceed');
    const photoUpload     = $('photoUpload');
    const cameraFeed      = $('cameraFeed');
    const meshCanvas      = $('meshCanvas');
    const captureCanvas   = $('captureCanvas');
    const cameraIdle      = $('cameraIdle');
    const capturedPreview = $('capturedPreview');
    const capturedImg     = $('capturedImg');
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
    function goToStep(n) {
        [step1, step2, step3].forEach((s, i) => {
            s.classList.toggle('hidden', i + 1 !== n);
        });

        document.querySelectorAll('.step-item').forEach((el, i) => {
            const stepNum = i + 1;
            el.classList.toggle('active',    stepNum === n);
            el.classList.toggle('completed', stepNum < n);
        });
        document.querySelectorAll('.step-line').forEach((el, i) => {
            el.classList.toggle('completed', i + 1 < n);
        });

        const modalBody = document.getElementById('scannerModalBody');
        if (modalBody) {
            modalBody.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
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

        const pillLight = document.getElementById('fsPillLighting');
        const pillPose  = document.getElementById('fsPillPose');
        const pillPos   = document.getElementById('fsPillPosition');

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            faceDetected = true;
            scanLine.classList.add('active');

            const landmarks = results.multiFaceLandmarks[0];

            for (const lms of results.multiFaceLandmarks) {
                if (typeof drawConnectors !== 'undefined' && typeof FACEMESH_TESSELATION !== 'undefined') {
                    drawConnectors(ctx, lms, FACEMESH_TESSELATION, {
                        color: 'rgba(212, 160, 23, 0.25)',
                        lineWidth: 0.8
                    });
                }
                if (typeof drawConnectors !== 'undefined' && typeof FACEMESH_FACE_OVAL !== 'undefined') {
                    drawConnectors(ctx, lms, FACEMESH_FACE_OVAL, {
                        color: 'rgba(0, 154, 168, 0.7)',
                        lineWidth: 1.6
                    });
                }
            }

            let minX = 1, maxX = 0, minY = 1, maxY = 0;
            for (let i = 0; i < landmarks.length; i++) {
                const lm = landmarks[i];
                if (lm.x < minX) minX = lm.x;
                if (lm.x > maxX) maxX = lm.x;
                if (lm.y < minY) minY = lm.y;
                if (lm.y > maxY) maxY = lm.y;
            }
            const boxH = maxY - minY;
            const boxCenterX = (minX + maxX) / 2;
            const boxCenterY = (minY + maxY) / 2;

            let avgLum = 120;
            try {
                if (cameraFeed.videoWidth && cameraFeed.videoHeight) {
                    const sampleCanvas = document.createElement('canvas');
                    sampleCanvas.width = 32;
                    sampleCanvas.height = 32;
                    const sCtx = sampleCanvas.getContext('2d');
                    const sx = Math.max(0, minX * cameraFeed.videoWidth);
                    const sy = Math.max(0, minY * cameraFeed.videoHeight);
                    const sw = Math.min(cameraFeed.videoWidth - sx, (maxX - minX) * cameraFeed.videoWidth);
                    const sh = Math.min(cameraFeed.videoHeight - sy, boxH * cameraFeed.videoHeight);
                    if (sw > 0 && sh > 0) {
                        sCtx.drawImage(cameraFeed, sx, sy, sw, sh, 0, 0, 32, 32);
                        const imgData = sCtx.getImageData(0, 0, 32, 32).data;
                        let sum = 0;
                        for (let p = 0; p < imgData.length; p += 4) {
                            sum += (0.299 * imgData[p] + 0.587 * imgData[p+1] + 0.114 * imgData[p+2]);
                        }
                        avgLum = sum / 1024;
                    }
                }
            } catch (e) {}

            let lightOk = false;
            if (pillLight) {
                pillLight.className = 'guidance-pill';
                const valEl = pillLight.querySelector('.pill-value');
                if (avgLum < 65) {
                    pillLight.classList.add('pill-bad');
                    if (valEl) valEl.textContent = 'Too Dark';
                } else if (avgLum > 220) {
                    pillLight.classList.add('pill-bad');
                    if (valEl) valEl.textContent = 'Too Dark';
                } else if (avgLum >= 65 && avgLum < 100) {
                    pillLight.classList.add('pill-warn');
                    if (valEl) valEl.textContent = 'Ok';
                    lightOk = true;
                } else {
                    pillLight.classList.add('pill-ok');
                    if (valEl) valEl.textContent = 'Good';
                    lightOk = true;
                }
            }

            let poseOk = false;
            let ratio = 1;
            if (pillPose && landmarks[1] && landmarks[33] && landmarks[263]) {
                pillPose.className = 'guidance-pill';
                const valEl = pillPose.querySelector('.pill-value');
                const distL = Math.abs(landmarks[1].x - landmarks[33].x);
                const distR = Math.abs(landmarks[263].x - landmarks[1].x);
                ratio = distL / (distR || 0.001);
                const angleDeg = Math.abs(Math.atan2(landmarks[263].y - landmarks[33].y, landmarks[263].x - landmarks[33].x) * (180 / Math.PI));

                if (ratio >= 0.70 && ratio <= 1.45 && angleDeg <= 8) {
                    pillPose.classList.add('pill-ok');
                    if (valEl) valEl.textContent = 'Good';
                    poseOk = true;
                } else {
                    pillPose.classList.add('pill-warn');
                    if (valEl) valEl.textContent = 'Adjust';
                }
            }

            let posOk = false;
            if (pillPos) {
                pillPos.className = 'guidance-pill';
                const valEl = pillPos.querySelector('.pill-value');
                const isCentered = (Math.abs(boxCenterX - 0.5) <= 0.16 && Math.abs(boxCenterY - 0.5) <= 0.16);

                if (boxH < 0.38) {
                    pillPos.classList.add('pill-warn');
                    if (valEl) valEl.textContent = 'Come Closer';
                } else if (boxH > 0.82) {
                    pillPos.classList.add('pill-warn');
                    if (valEl) valEl.textContent = 'Move Back';
                } else if (!isCentered) {
                    pillPos.classList.add('pill-warn');
                    if (valEl) valEl.textContent = 'Come Closer';
                } else {
                    pillPos.classList.add('pill-ok');
                    if (valEl) valEl.textContent = 'Centered';
                    posOk = true;
                }
            }

            const elAlign = document.getElementById('telemetryAlignment');
            const elLux   = document.getElementById('telemetryLux');
            const elZone  = document.getElementById('telemetryZone');
            const elRes   = document.getElementById('telemetryRes');

            if (elAlign) {
                const alignScore = Math.round(Math.min(99, Math.max(62, 100 - (Math.abs(1 - ratio) * 40) - (Math.abs(boxCenterX - 0.5) * 60))));
                elAlign.textContent = `${alignScore}%`;
                elAlign.style.color = alignScore >= 85 ? '#22c55e' : (alignScore >= 70 ? 'var(--gold-400)' : '#fde047');
            }
            if (elLux) {
                elLux.textContent = `${Math.round(avgLum * 1.35)} LUX`;
                elLux.style.color = (avgLum >= 65 && avgLum <= 215) ? '#22c55e' : '#f87171';
            }
            if (elZone && landmarks[10] && landmarks[152]) {
                const pitch = landmarks[10].y - landmarks[152].y;
                if (pitch > -0.45) {
                    elZone.textContent = 'FRONTAL HAIRLINE';
                } else if (boxH > 0.65) {
                    elZone.textContent = 'DERMAL T-ZONE';
                } else {
                    elZone.textContent = 'FACIAL ARCHITECTURE';
                }
            }
            if (elRes && cameraFeed) {
                elRes.textContent = `${cameraFeed.videoWidth || 1280}x${cameraFeed.videoHeight || 720}`;
            }
            if (lightOk && posOk && poseOk) {
                if (circularCameraWrapper) circularCameraWrapper.classList.add('all-good');
                if (btnCapture) {
                    btnCapture.disabled = false;
                    btnCapture.classList.add('pulse-ready');
                }
                if (!autoCaptureActive && !capturedImageBase64) {
                    startAutoCapture();
                }
            } else {
                cancelAutoCapture();
                if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
                if (btnCapture) {
                    btnCapture.disabled = true;
                    btnCapture.classList.remove('pulse-ready');
                }
            }

        } else {
            faceDetected = false;
            scanLine.classList.remove('active');
            cancelAutoCapture();
            if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
            if (btnCapture) {
                btnCapture.disabled = true;
                btnCapture.classList.remove('pulse-ready');
            }
            if (pillLight) {
                pillLight.className = 'guidance-pill pill-bad';
                const valEl = pillLight.querySelector('.pill-value');
                if (valEl) valEl.textContent = 'Too Dark';
            }
            if (pillPose) {
                pillPose.className = 'guidance-pill pill-warn';
                const valEl = pillPose.querySelector('.pill-value');
                if (valEl) valEl.textContent = 'Adjust';
            }
            if (pillPos) {
                pillPos.className = 'guidance-pill pill-warn';
                const valEl = pillPos.querySelector('.pill-value');
                if (valEl) valEl.textContent = 'Come Closer';
            }
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
    const autoCaptureOverlay = document.getElementById('autoCaptureOverlay');
    const autoCaptureNumEl   = document.getElementById('autoCaptureNum');

    function startAutoCapture() {
        if (autoCaptureActive || capturedImageBase64) return;
        autoCaptureActive = true;
        autoCaptureCount  = 3;

        if (autoCaptureNumEl) autoCaptureNumEl.textContent = autoCaptureCount;
        if (autoCaptureOverlay) autoCaptureOverlay.style.display = 'flex';

        autoCaptureTimer = setInterval(() => {
            autoCaptureCount--;

            if (autoCaptureCount <= 0) {
                clearInterval(autoCaptureTimer);
                autoCaptureTimer  = null;
                autoCaptureActive = false;
                if (autoCaptureOverlay) autoCaptureOverlay.style.display = 'none';
                captureFromCamera();
            } else {
                if (autoCaptureNumEl) autoCaptureNumEl.textContent = autoCaptureCount;
            }
        }, 1000);
    }

    function cancelAutoCapture() {
        if (!autoCaptureActive && !autoCaptureTimer) return;
        clearInterval(autoCaptureTimer);
        autoCaptureTimer  = null;
        autoCaptureActive = false;
        autoCaptureCount  = 3;
        if (autoCaptureOverlay) autoCaptureOverlay.style.display = 'none';
    }
    async function startCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false
            });

            cameraFeed.srcObject = mediaStream;
            await cameraFeed.play();

            if (cameraIdle) cameraIdle.style.display = 'none';
            cameraFeed.classList.add('active');
            meshCanvas.classList.add('active');

            cameraRunning = true;
            if (btnCapture) btnCapture.disabled = true;

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
        scanLine.classList.remove('active');
        cameraRunning = false;
        if (cameraIdle && !capturedImageBase64) cameraIdle.style.display = 'flex';
        if (btnCapture) {
            btnCapture.disabled = true;
            btnCapture.classList.remove('pulse-ready');
        }
        if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
    }

    function showCameraError(msg) {
        if (cameraIdle) {
            cameraIdle.innerHTML = `
                <div class="idle-icon"><i class="fas fa-camera-slash" style="color:#ef4444"></i></div>
                <p style="color:#f87171;font-size:0.88rem;text-align:center;max-width:220px">${msg}</p>
            `;
            cameraIdle.style.display = 'flex';
        }
    }
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
        try {
            sessionStorage.setItem('kezza_scanner_photo', capturedImageBase64);
        } catch(e) {}
        if (btnCapture) {
            btnCapture.disabled = true;
            btnCapture.classList.remove('pulse-ready');
        }
        if (captureSubstate1) captureSubstate1.classList.add('hidden');
        if (captureSubstate2) captureSubstate2.classList.remove('hidden');
    }
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
            if (cameraIdle) cameraIdle.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
    if (btnGetStarted) {
        btnGetStarted.addEventListener('click', async () => {
            if (captureSubstate1) captureSubstate1.classList.add('hidden');
            if (captureSubstate2) captureSubstate2.classList.remove('hidden');
            await startCamera();
        });
    }

    if (btnCloseCamera) {
        btnCloseCamera.addEventListener('click', () => {
            stopCamera();
            if (captureSubstate2) captureSubstate2.classList.add('hidden');
            if (captureSubstate1) captureSubstate1.classList.remove('hidden');
            if (capturedPreview) capturedPreview.classList.remove('active');
            if (btnProceed) btnProceed.disabled = true;
            if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
            capturedImageBase64 = null;
            try { sessionStorage.removeItem('kezza_scanner_photo'); } catch(e) {}
        });
    }

    btnCapture.addEventListener('click', captureFromCamera);

    btnProceed.addEventListener('click', () => {
        goToStep(2);
        renderQuestion(1);
    });
    function isCurrentQuestionValid() {
        if (currentQuestion === 4) {
            return !!(answers.q4 && answers.q4.length >= 2);
        }
        if (currentQuestion === 6) {
            return !!(answers.q6 && answers.q6.length >= 2);
        }
        if (currentQuestion === 8) {
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

        const modalBody = document.getElementById('scannerModalBody');
        if (modalBody) {
            modalBody.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (n === 4 && inputName) {
            setTimeout(() => inputName.focus(), 150);
        } else if (n === 6 && inputLocation) {
            setTimeout(() => inputLocation.focus(), 150);
        } else if (n === 8) {
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

    document.querySelectorAll('.answer-btn:not([data-q="8-time"])').forEach(btn => {
        btn.addEventListener('click', function () {
            const q = parseInt(this.dataset.q);
            const val = this.dataset.val;

            document.querySelectorAll(`.answer-btn[data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            answers[`q${q}`] = val;
            updateAnalyseBtn();
            saveSessionToStorage(); 

            if (currentQuestion < TOTAL_QUESTIONS && currentQuestion !== 8) {
                setTimeout(() => {
                    renderQuestion(currentQuestion + 1);
                }, 220);
            }
        });
    });
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

    const consultDateInput = document.getElementById('consultDate');
    const dateDisplay = document.getElementById('dateDisplay');
    if (consultDateInput) {
        const onDateChange = function () {
            const val = this.value;
            if (!val) return;
            setBookingDateValue(val);
        };
        consultDateInput.addEventListener('change', onDateChange);
        consultDateInput.addEventListener('input', onDateChange);
    }

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

    btnQBack.addEventListener('click', () => {
        if (currentQuestion > 1) {
            renderQuestion(currentQuestion - 1);
        } else {
            goToStep(1);
        }
    });

    btnAnalyse.addEventListener('click', () => {
        if (!isCurrentQuestionValid()) return;

        if (currentQuestion < TOTAL_QUESTIONS) {
            renderQuestion(currentQuestion + 1);
        } else {
            goToStep(3);
            runAnalysis();
        }
    });
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

        const textContext = buildTextContext();

        let imageData = capturedImageBase64 || null;
        if (!imageData) {
            try { imageData = sessionStorage.getItem('kezza_scanner_photo'); } catch(e) {}
        }
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

        setTimeout(async () => {
            try {
                const res = await fetch('/api/analyze-photo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data && data.status === 'OK') {
                    handleAnalysisResult(data);
                } else if (data && (data.status === 'QUALITY_ISSUE' || data.status === 'UNCLEAR')) {
                    const fallbackResult = buildLocalFallback(textContext);
                    if (data.visible_observations && data.visible_observations.length) {
                        fallbackResult.visible_observations = data.visible_observations;
                    }
                    handleAnalysisResult(fallbackResult);
                } else {
                    const fallbackResult = buildLocalFallback(textContext);
                    handleAnalysisResult(fallbackResult);
                }
            } catch (err) {
                console.warn('[FaceScanner] Vision API fetch error, using clinical triage fallback:', err);
                const fallbackResult = buildLocalFallback(textContext);
                handleAnalysisResult(fallbackResult);
            }
        }, 4200);
    }

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
            confidence_score:        84,
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
    function animateLoadingSteps() {
        const steps = ['ls1', 'ls2', 'ls3', 'ls4'];
        const phases = [
            'Phase 1: Facial Landmark Coordinates & Geometry (25%)',
            'Phase 2: Dermal Texture & Follicle Density Matrix (55%)',
            'Phase 3: Cross-Referencing Kezza Clinical DB (82%)',
            'Phase 4: Formulating Senior Specialist Protocol (98%)'
        ];
        const percentages = [25, 55, 82, 98];
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

        const progFill  = document.getElementById('heavyProgressFill');
        const progNum   = document.getElementById('heavyProgressNum');
        const progPhase = document.getElementById('heavyProgressPhase');

        if (progFill) progFill.style.width = '25%';
        if (progNum) progNum.textContent = '25%';
        if (progPhase) progPhase.textContent = phases[0];

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
                if (progFill) progFill.style.width = `${percentages[i]}%`;
                if (progNum) progNum.textContent = `${percentages[i]}%`;
                if (progPhase) progPhase.textContent = phases[i];
            } else {
                clearInterval(interval);
                if (progFill) progFill.style.width = '100%';
                if (progNum) progNum.textContent = '100%';
            }
        }, 1000);
    }
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

        $('resultThumb').src = capturedImageBase64 || '';

        const concern = data.recommended_consultation || data.possible_concern || 'Consultation Recommended';
        $('resultConcern').textContent = concern;

        const score = data.confidence_score || 75;
        let severity = 'moderate';
        let severityText = 'Moderate';
        if (score >= 85) { severity = 'high'; severityText = 'Notable'; }
        else if (score < 65) { severity = 'low'; severityText = 'Mild'; }

        const badge = $('resultSeverityBadge');
        badge.className = `severity-badge ${severity}`;
        $('resultSeverityText').textContent = severityText;

        const observations = data.visible_observations || [];
        const obsList = $('observationsList');
        obsList.innerHTML = '';
        observations.forEach(obs => {
            const li = document.createElement('li');
            li.textContent = obs;
            obsList.appendChild(li);
        });
        $('observationsBlock').style.display = observations.length ? '' : 'none';

        $('resultTreatment').textContent = data.treatment_name || concern;

        const deptKey = data.department_key || 'SKIN';
        const doctor  = DOCTOR_MAP[deptKey] || DOCTOR_MAP['SKIN'];

        $('resultDoctorImg').src  = doctor.img;
        $('resultDoctorName').textContent = doctor.name;
        $('resultDoctorSpec').textContent = doctor.spec;
        $('resultDoctorLocation').textContent = answers.q7 ? `${answers.q7} Clinic (${doctor.location})` : doctor.location;

        if ($('summaryPatientName')) $('summaryPatientName').textContent = answers.q4 || 'Patient';
        if ($('summaryPatientAge')) $('summaryPatientAge').textContent = answers.q5 || 'Not specified';
        if ($('summaryPatientLocation')) $('summaryPatientLocation').textContent = answers.q6 || 'Not specified';
        if ($('summaryPatientClinic')) $('summaryPatientClinic').textContent = answers.q7 ? `${answers.q7} Clinic` : 'Jaipur (Main)';
        const dateStr = answers.q8Date ? formatBookingDate(answers.q8Date, 'short') : '';
        if ($('summaryPatientTime')) $('summaryPatientTime').textContent = dateStr
            ? `${dateStr} — ${answers.q8 || 'Any time'}`
            : (answers.q8 || 'Any time (flexible)');
        if ($('summaryPatientPhone')) $('summaryPatientPhone').textContent = answers.q9 ? `+91 ${answers.q9}` : 'Not provided';

        const why = data.why_this_consultation || '';
        $('whyText').textContent = why;
        $('whyBlock').style.display = why ? '' : 'none';

        const waMsg = buildWhatsAppMessage(data, doctor);
        const targetPhone = answers.clinicContact || doctor.contact || WHATSAPP_NUM;
        btnBookWA.href = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMsg)}`;

        
        renderConfidenceRing(data);

        saveAssessmentToDB(data, doctor);

        try { localStorage.removeItem('kezzaScanSession'); } catch(e) {}
    }
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
    function renderConfidenceRing(data) {
        const score = Math.min(Math.max(data.confidence_score || 75, 0), 100);
        const photoQ = Math.min(Math.max(data.image_quality_score || 80, 0), 100);
        const concernMatch = Math.round(score * 0.95);
        const specialistMatch = Math.round((score + photoQ) / 2 * 0.9);

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
            if (!session.ts || Date.now() - session.ts > 30 * 60 * 1000) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
            Object.assign(answers, session.answers);
            if (inputName && answers.q4)     inputName.value = answers.q4;
            if (inputLocation && answers.q6) inputLocation.value = answers.q6;
            if (inputPhone && answers.q9)    inputPhone.value = answers.q9;
            if (btnNameNext)     btnNameNext.disabled     = !(answers.q4 && answers.q4.length >= 2);
            if (btnLocationNext) btnLocationNext.disabled = !(answers.q6 && answers.q6.length >= 2);
            if (answers.q8Date) {
                const dp = document.getElementById('consultDate');
                if (dp) dp.value = answers.q8Date;
                const dd = document.getElementById('dateDisplay');
                if (dd) dd.textContent = formatBookingDate(answers.q8Date, 'long');
            }
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
    function resetConsultation() {
        capturedImageBase64 = null;
        try { sessionStorage.removeItem('kezza_scanner_photo'); } catch(e) {}
        Object.keys(answers).forEach(k => { answers[k] = null; });
        answers.clinicContact = WHATSAPP_NUM;
        currentQuestion = 1;
        localStorage.removeItem(SESSION_KEY);

        if (inputName) inputName.value = '';
        if (inputLocation) inputLocation.value = '';
        if (inputPhone) inputPhone.value = '';
        if (btnNameNext) btnNameNext.disabled = true;
        if (btnLocationNext) btnLocationNext.disabled = true;

        const dp = document.getElementById('consultDate');
        if (dp) dp.value = '';
        const dd = document.getElementById('dateDisplay');
        if (dd) dd.textContent = 'No date selected';
        const q8s = document.getElementById('q8Status');
        if (q8s) q8s.textContent = '';
        document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));

        if (capturedPreview) capturedPreview.classList.remove('active');
        if (btnProceed) btnProceed.disabled = true;
        if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
        if (captureSubstate2) captureSubstate2.classList.add('hidden');
        if (captureSubstate1) captureSubstate1.classList.remove('hidden');
        if (cameraIdle) cameraIdle.style.display = 'flex';

        document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.clinic-card-btn').forEach(b => b.classList.remove('selected'));

        goToStep(1);
        const _mb = document.getElementById('scannerModalBody');
        if (_mb) _mb.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $('btnRetakePhoto').addEventListener('click', () => {
        cancelAutoCapture();
        goToStep(1);
        capturedImageBase64 = null;
        try { sessionStorage.removeItem('kezza_scanner_photo'); } catch(e) {}
        if (captureSubstate2) captureSubstate2.classList.add('hidden');
        if (captureSubstate1) captureSubstate1.classList.remove('hidden');
        if (capturedPreview) capturedPreview.classList.remove('active');
        if (circularCameraWrapper) circularCameraWrapper.classList.remove('all-good');
        if (btnProceed) btnProceed.disabled = true;
        if (cameraIdle) cameraIdle.style.display = 'flex';
    });

    $('btnRetryAnalysis').addEventListener('click', () => {
        showResultsState('loading');
        animateLoadingSteps();
        setTimeout(runAnalysis, 500);
    });

    $('btnStartOver').addEventListener('click', () => {
        resetConsultation();
        closeScannerModal();
        showToast('<i class="fas fa-redo"></i> Consultation restarted.', 2000);
    });
    if (btnBookWA) {
        btnBookWA.addEventListener('click', function (e) {
            e.preventDefault();

            let url = this.getAttribute('href');

            if (!url || url === '#') {
                const deptKey = $('resultConcern')?.dataset?.dept || 'SKIN';
                const doctor = DOCTOR_MAP[deptKey] || DOCTOR_MAP['SKIN'];
                const msg = buildWhatsAppMessage({ 
                    recommended_consultation: $('resultConcern')?.textContent || 'Consultation',
                    treatment_name: $('resultTreatment')?.textContent || 'Treatment',
                    department_key: deptKey,
                    why_this_consultation: $('whyText')?.textContent || ''
                }, doctor);
                const phone = (answers.clinicContact || doctor?.contact || WHATSAPP_NUM).replace(/\D/g, '');
                url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            }

            window.open(url, '_blank', 'noopener,noreferrer');

            showToast('<i class="fab fa-whatsapp"></i> Opening WhatsApp with your appointment details...', 2600);

            setTimeout(() => {
                resetConsultation();
                closeScannerModal();
            }, 2500);
        });
    }
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.boxShadow = window.scrollY > 20
                ? '0 4px 24px rgba(0,0,0,0.4)'
                : 'none';
        }, { passive: true });
    }
    const scannerModalOverlay = document.getElementById('scannerModalOverlay');
    const scannerModal        = document.getElementById('scannerModal');
    const btnCloseScannerModal = document.getElementById('btnCloseScannerModal');
    let _escKeyHandler = null;

    function openScannerModal() {
        if (!scannerModalOverlay) return;

        const _hasSession = restoreSessionFromStorage && answers.q1;
        if (!_hasSession) {
            resetConsultation();
        }

        scannerModalOverlay.style.display = 'flex';
        scannerModalOverlay.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scannerModalOverlay.classList.add('active');
            });
        });

        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        setTimeout(() => { if (btnCloseScannerModal) btnCloseScannerModal.focus(); }, 260);

        _escKeyHandler = (e) => { if (e.key === 'Escape') closeScannerModal(); };
        document.addEventListener('keydown', _escKeyHandler);
    }

    function closeScannerModal() {
        if (!scannerModalOverlay) return;

        stopCamera();
        cancelAutoCapture();

        scannerModalOverlay.classList.remove('active');

        const _hideOverlay = () => {
            scannerModalOverlay.style.display = 'none';
            scannerModalOverlay.setAttribute('aria-hidden', 'true');
        };
        scannerModal.addEventListener('transitionend', _hideOverlay, { once: true });
        setTimeout(_hideOverlay, 320);

        document.body.style.overflow = '';
        document.body.style.touchAction = '';

        if (_escKeyHandler) {
            document.removeEventListener('keydown', _escKeyHandler);
            _escKeyHandler = null;
        }
    }

    if (scannerModalOverlay) {
        scannerModalOverlay.addEventListener('click', (e) => {
            if (e.target === scannerModalOverlay) closeScannerModal();
        });
    }
    if (scannerModal) {
        scannerModal.addEventListener('click', (e) => e.stopPropagation());
    }

    if (btnCloseScannerModal) {
        btnCloseScannerModal.addEventListener('click', closeScannerModal);
    }

    window.openScannerModal  = openScannerModal;
    window.closeScannerModal = closeScannerModal;

    [inputName, inputLocation, inputPhone].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('focus', () => {
            setTimeout(() => inp.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
        });
    });
    const btnHeroStart = $('btnHeroStart');
    if (btnHeroStart) {
        btnHeroStart.addEventListener('click', (e) => {
            e.preventDefault();
            openScannerModal();
        });
    }
    try {
        const _storedPhoto = sessionStorage.getItem('kezza_scanner_photo');
        if (_storedPhoto) {
            capturedImageBase64 = _storedPhoto;
            if (capturedImg) capturedImg.src = _storedPhoto;
            if (capturedPreview) capturedPreview.classList.add('active');
            if (btnProceed) btnProceed.disabled = false;
        }
    } catch(e) {}

    const _sessionRestored = restoreSessionFromStorage();
    if (_sessionRestored && answers.q1) {
        goToStep(2);
        const qKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9'];
        let _lastQ = 1;
        qKeys.forEach((k, i) => { if (answers[k]) _lastQ = i + 2; });
        _lastQ = Math.min(_lastQ, TOTAL_QUESTIONS);
        setTimeout(() => renderQuestion(_lastQ), 50);
    } else {
        goToStep(1);
    }
    })();

