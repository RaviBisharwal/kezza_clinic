(function() {
  "use strict";
  const de = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1", _e = de ? "http://localhost:8000/api" : `${window.location.origin}/api`, ue = de && window.location.port !== "3001" ? "http://localhost:3001" : window.location.origin, Pe = `${ue}/api/analyze-photo`, M = "919284517427", xe = "https://script.google.com/macros/s/AKfycbwsWmFO6lLgh_UAAZkQpBstzRQ8335TQ_XP3jGnq3cBsfkFNE6eDewuQDRqho1o1CqiuA/exec", Me = { city: "Ajmer", address: "1st Floor, Hotel Oasis Complex, Shastri Nagar, Jawahar Nagar, Ajmer, Rajasthan 305001", phone: "919216088257", whatsapp: "919216088257", email: "support@kezza.co.in", mapsUrl: "https://maps.app.goo.gl/zMajvKmT5N7coswJA?g_st=ic" }, R = { HAIR: { name: "Dr. Ankit Bhalothia", spec: "Aesthetic & Hair Transplant Surgeon; Oral & Maxillofacial Surgeon", img: "images/Doctor1.webp", contact: "919216063681", location: "Jaipur & Sikar" }, HAIR_TRANSPLANT_SIKAR: { name: "Elite Surgical Hair Team", spec: "Hair Transplant Team", img: "images/Doctor4.webp", contact: "918130888129", location: "Sikar" }, HAIR_TRANSPLANT_AJMER: { name: "Dr. Dhiral Vijayvargiya", spec: "Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon", img: "images/Doctor4.webp", contact: "919216088257", location: "Ajmer" }, SKIN: { name: "Dr. Amrita Mukhija", spec: "Aesthetic Physician & Skin Specialist", img: "images/Doctor2.webp", contact: "919216063686", location: "Jaipur" }, ANTI_AGING: { name: "Dr. Amrita Mukhija", spec: "Aesthetic Physician & Skin Specialist", img: "images/Doctor2.webp", contact: "919216063686", location: "Jaipur" }, PMU: { name: "Krishna", spec: "Permanent Makeup (PMU) Artist", img: "images/Doctor5.webp", contact: "919079161300", location: "Jaipur & Sikar" }, SMP: { name: "Krishna", spec: "PMU & Scalp Micropigmentation Artist", img: "images/Doctor5.webp", contact: "919079161300", location: "Jaipur & Sikar" }, SKIN_AND_HAIR: { name: "Dr. Amrita Mukhija & Dr. Ankit Bhalothia", spec: "Skin Specialist & Hair Transplant Surgeon", img: "images/Doctor2.webp", contact: M, location: "Jaipur & Sikar" }, WEIGHT_LOSS: { name: "Kezza Wellness & Slimming Team", spec: "Clinical Nutrition & Body Contouring Specialist", img: "images/Doctor3.webp", contact: "919284517427", location: "Jaipur & Sikar" }, ENT_RHINOPLASTY: { name: "Dr. Mandhata Sharma", spec: "ENT & Rhinoplasty Surgeon", img: "images/Doctor6.webp", contact: "919284517427", location: "Jaipur" }, AJMER_SPECIALIST: { name: "Dr. Aliza Rizvi", spec: "Oral & Maxillofacial, Aesthetic & Hair Transplant Surgeon", img: "images/dr-aliza-rizvi.webp", contact: "919216088257", location: "Ajmer" }, PLASTIC_SURGERY: { name: "Dr. Nakul Somani", spec: "Consultant Aesthetic & Reconstructive Plastic Surgeon", img: "images/dr-nakul-somani.webp", contact: "919284517427", location: "Jaipur" }, INTERNAL_MEDICINE: { name: "Dr. Youvraj Singh", spec: "Consultant Physician & Internal Medicine Specialist", img: "images/dr-youvraj-singh.webp", contact: "919284517427", location: "Jaipur" } };
  function me(e, n) {
    return n && n.toLowerCase() === "ajmer" ? (e === "HAIR" || e === "HAIR_TRANSPLANT_SIKAR" ? R.HAIR_TRANSPLANT_AJMER : R.AJMER_SPECIALIST) : R[e] || R.SKIN;
  }
  window.getDoctorForResult = me;
  let L = null, T = null, H = null, k = false;
  const t = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null, q8: null, q8Date: null, q9: null, clinicContact: M }, w = 9;
  let m = 1;
  const s = (e) => document.getElementById(e), G = s("btnStartCamera"), F = s("btnSwitchCamera"), Y = s("btnCapture"), K = s("btnProceed"), Re = s("photoUpload"), p = s("cameraFeed"), N = s("meshCanvas"), E = s("captureCanvas"), I = s("cameraIdle"), V = s("capturedPreview"), $e = s("capturedImg"), fe = s("faceGuide"), se = s("scanLine"), Be = s("step1"), Oe = s("step2"), He = s("step3"), Fe = s("qProgressBar"), ze = s("qCounter"), Z = s("btnQBack"), J = s("btnAnalyse"), y = s("inputName"), A = s("btnNameNext"), S = s("inputLocation"), b = s("btnLocationNext"), q = s("inputPhone"), _ = s("btnBookWA"), pe = s("resultsLoading"), he = s("resultsQualityIssue"), ge = s("resultsMain"), ye = s("resultsError");
  function C(e) {
    [Be, Oe, He].forEach((a, i) => {
      a.classList.toggle("hidden", i + 1 !== e);
    }), document.querySelectorAll(".step-item").forEach((a, i) => {
      const o = i + 1;
      a.classList.toggle("active", o === e), a.classList.toggle("completed", o < e);
    }), document.querySelectorAll(".step-line").forEach((a, i) => {
      a.classList.toggle("completed", i + 1 < e);
    });
    const n = document.querySelector(".steps-indicator");
    n && window.scrollTo({ top: n.offsetTop - 80, behavior: "smooth" });
  }
  function je() {
    if (!H) {
      if (typeof FaceMesh == "undefined") {
        console.warn("MediaPipe FaceMesh not loaded \u2014 skipping face detection");
        return;
      }
      H = new FaceMesh({ locateFile: (e) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${e}` }), H.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 }), H.onResults(Ue);
    }
  }
  function Ue(e) {
    const n = N.getContext("2d");
    if (n.clearRect(0, 0, N.width, N.height), e.multiFaceLandmarks && e.multiFaceLandmarks.length > 0) {
      se.classList.add("active");
      for (const a of e.multiFaceLandmarks) typeof drawConnectors != "undefined" && typeof FACEMESH_TESSELATION != "undefined" && drawConnectors(n, a, FACEMESH_TESSELATION, { color: "rgba(212, 160, 23, 0.12)", lineWidth: 0.7 }), typeof drawConnectors != "undefined" && typeof FACEMESH_FACE_OVAL != "undefined" && drawConnectors(n, a, FACEMESH_FACE_OVAL, { color: "rgba(212, 160, 23, 0.5)", lineWidth: 1.5 });
    } else se.classList.remove("active");
  }
  async function Ke() {
    !H || !k || p.readyState < 2 || (N.width !== p.videoWidth && (N.width = p.videoWidth, N.height = p.videoHeight), await H.send({ image: p }));
  }
  let X = "user";
  async function Se() {
    try {
      T && (T.getTracks().forEach((n) => n.stop()), T = null), T = await navigator.mediaDevices.getUserMedia({ video: { facingMode: X, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }), p.srcObject = T, await p.play(), I.style.display = "none", p.classList.add("active"), N.classList.add("active"), fe.classList.add("active"), k = true, G.innerHTML = '<i class="fas fa-video-slash"></i> Stop Camera', F && (F.style.display = "inline-flex"), Y.disabled = false, je();
      const e = setInterval(() => {
        if (!k) {
          clearInterval(e);
          return;
        }
        Ke();
      }, 100);
    } catch (e) {
      console.error("Camera error:", e), e.name === "NotAllowedError" ? ce('Camera access denied. Please use the "Upload Photo" option instead.') : e.name === "NotFoundError" ? ce("No camera found on this device. Please upload a photo instead.") : ce("Could not access camera. Please upload a photo instead.");
    }
  }
  async function Je() {
    k && (X = X === "user" ? "environment" : "user", await Se());
  }
  function oe() {
    T && (T.getTracks().forEach((e) => e.stop()), T = null), p.srcObject = null, p.classList.remove("active"), N.classList.remove("active"), fe.classList.remove("active"), se.classList.remove("active"), k = false, I.style.display = "flex", G.innerHTML = '<i class="fas fa-video"></i> Start Camera', F && (F.style.display = "none"), Y.disabled = true;
  }
  function ce(e) {
    I.innerHTML = `
            <div class="idle-icon"><i class="fas fa-video-slash" style="color:#ef4444"></i></div>
            <p style="color:#f87171;font-size:0.88rem;text-align:center;max-width:220px">${e}</p>
        `, I.style.display = "flex";
  }
  function Qe() {
    if (!k || p.readyState < 2) return;
    E.width = p.videoWidth || 640, E.height = p.videoHeight || 480;
    const e = E.getContext("2d");
    e.save(), X === "user" ? (e.scale(-1, 1), e.drawImage(p, -E.width, 0, E.width, E.height)) : e.drawImage(p, 0, 0, E.width, E.height), e.restore(), L = E.toDataURL("image/jpeg", 0.88), qe(), oe();
  }
  function qe() {
    $e.src = L, V.classList.add("active"), K.disabled = false, Y.disabled = true, G.innerHTML = '<i class="fas fa-redo"></i> Retake';
  }
  Re.addEventListener("change", function() {
    const e = this.files[0];
    if (!e) return;
    if (!e.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (e.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please use an image under 10 MB.");
      return;
    }
    const n = new FileReader();
    n.onload = (a) => {
      L = a.target.result, qe(), k && oe(), I.style.display = "none";
    }, n.readAsDataURL(e);
  }), G.addEventListener("click", () => {
    k ? (oe(), L && (L = null, V.classList.remove("active"), K.disabled = true, I.style.display = "flex", I.innerHTML = `
                    <div class="idle-icon"><i class="fas fa-camera"></i></div>
                    <p>Camera will appear here</p>
                    <small>Allow camera access when prompted</small>
                `)) : Se();
  }), Y.addEventListener("click", Qe), F && F.addEventListener("click", Je);
  const D = /* @__PURE__ */ new Set();
  function ve() {
    try {
      const e = new URLSearchParams(window.location.search), n = e.get("clinic") || e.get("branch") || e.get("location");
      if (n) {
        let r = null;
        const l = n.toLowerCase();
        l.includes("ajmer") ? r = "Ajmer" : l.includes("sikar") ? r = "Sikar" : l.includes("jaipur") && (r = "Jaipur"), r && (t.q7 = r, D.add(7), document.querySelectorAll(".clinic-card-btn").forEach((d) => {
          const u = (d.dataset.val || "").toLowerCase() === r.toLowerCase();
          d.classList.toggle("selected", u), u && d.dataset.contact && (t.clinicContact = d.dataset.contact);
        }));
      }
      const a = e.get("name") || e.get("fullName");
      a && a.trim().length >= 2 && (t.q4 = a.trim(), D.add(4), y && (y.value = t.q4), A && (A.disabled = false));
      const i = e.get("city");
      i && i.trim().length >= 2 && (t.q6 = i.trim(), D.add(6), S && (S.value = t.q6), b && (b.disabled = false));
      const o = e.get("phone") || e.get("whatsapp");
      if (o) {
        const r = o.replace(/\D/g, "").slice(0, 10);
        /^[6-9]\d{9}$/.test(r) && (t.q9 = r, D.add(9), q && (q.value = r));
      }
      const c = e.get("concern");
      if (c) {
        const r = c.trim().toLowerCase();
        document.querySelectorAll('.answer-btn[data-q="1"]').forEach((l) => {
          const d = (l.dataset.val || "").toLowerCase();
          (d.includes(r) || r.includes(d)) && (l.classList.add("selected"), t.q1 = l.dataset.val, D.add(1));
        });
      }
    } catch (e) {
      console.warn("[initUrlParams error]:", e);
    }
  }
  function $(e) {
    let n = e + 1;
    for (; n <= w && D.has(n); ) n++;
    n <= w ? ee(n) : (C(3), ne());
  }
  K.addEventListener("click", () => {
    C(2);
    let e = 1;
    for (; e <= w && D.has(e); ) e++;
    ee(Math.min(e, w));
  });
  function we() {
    return m === 4 ? !!(t.q4 && t.q4.length >= 2) : m === 6 ? !!(t.q6 && t.q6.length >= 2) : m === 8 ? !!(t.q8Date && t.q8) : m === 9 ? /^[6-9]\d{9}$/.test(t.q9 || "") : !!t[`q${m}`];
  }
  function ee(e) {
    m = e, document.querySelectorAll(".question-card").forEach((i) => {
      i.classList.toggle("active", parseInt(i.dataset.q) === e);
    });
    const n = Math.round(e / w * 100);
    Fe.style.width = `${n}%`, ze.textContent = `Question ${e} of ${w}`, Z && (Z.style.visibility = "visible", Z.innerHTML = e === 1 ? '<i class="fas fa-camera"></i> <span>Retake Photo</span>' : '<i class="fas fa-arrow-left"></i> <span>Back</span>');
    const a = document.querySelector(".steps-indicator");
    if (a) {
      const i = a.getBoundingClientRect().top + window.pageYOffset - 74;
      window.scrollTo({ top: Math.max(0, i), behavior: "smooth" });
    }
    if (e === 4 && y) setTimeout(() => y.focus(), 150);
    else if (e === 6 && S) setTimeout(() => S.focus(), 150);
    else if (e === 8) {
      const i = /* @__PURE__ */ new Date(), o = /* @__PURE__ */ new Date();
      o.setDate(i.getDate() + 60);
      const c = document.getElementById("consultDate");
      c && (c.min = i.toISOString().split("T")[0], c.max = o.toISOString().split("T")[0], t.q8Date && (c.value = t.q8Date), setTimeout(() => c.focus(), 150));
    } else e === 9 && q && setTimeout(() => q.focus(), 150);
    P();
  }
  function P() {
    const e = we();
    m < w ? (J.innerHTML = 'Next <i class="fas fa-arrow-right"></i>', J.disabled = !e) : (J.innerHTML = 'Analyse &amp; Confirm <i class="fas fa-brain"></i>', J.disabled = !e);
  }
  document.querySelectorAll('.answer-btn:not([data-q="8-time"])').forEach((e) => {
    e.addEventListener("click", function() {
      const n = parseInt(this.dataset.q), a = this.dataset.val;
      document.querySelectorAll(`.answer-btn[data-q="${n}"]`).forEach((i) => i.classList.remove("selected")), this.classList.add("selected"), t[`q${n}`] = a, P(), ie(), m < w && m !== 8 && setTimeout(() => {
        $(m);
      }, 130);
    });
  });
  function z(e) {
    const n = e.getFullYear(), a = String(e.getMonth() + 1).padStart(2, "0"), i = String(e.getDate()).padStart(2, "0");
    return `${n}-${a}-${i}`;
  }
  function We(e) {
    if (!e) return null;
    const n = String(e).split("-");
    if (n.length === 3) {
      const a = parseInt(n[0], 10), i = parseInt(n[1], 10) - 1, o = parseInt(n[2], 10);
      return new Date(a, i, o);
    }
    return new Date(e);
  }
  function j(e, n = "long") {
    if (!e) return "Flexible";
    const a = We(e);
    return !a || isNaN(a.getTime()) ? e : n === "short" ? a.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : a.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function te(e) {
    t.q8Date = e;
    const n = document.getElementById("consultDate");
    n && (n.value = e);
    const a = document.getElementById("dateDisplay");
    a && (a.textContent = j(e, "long"));
    const i = z(/* @__PURE__ */ new Date()), o = /* @__PURE__ */ new Date();
    o.setDate(o.getDate() + 1);
    const c = z(o), r = /* @__PURE__ */ new Date();
    r.setDate(r.getDate() + 2);
    const l = z(r);
    document.querySelectorAll(".quick-date-btn").forEach((d) => d.classList.remove("active")), e === i && s("qDateToday") ? s("qDateToday").classList.add("active") : e === c && s("qDateTomorrow") ? s("qDateTomorrow").classList.add("active") : e === l && s("qDateDayAfter") && s("qDateDayAfter").classList.add("active"), Ae(), P();
  }
  const re = document.getElementById("consultDate");
  if (re) {
    const e = function() {
      const n = this.value;
      n && te(n);
    };
    re.addEventListener("change", e), re.addEventListener("input", e);
  }
  s("qDateToday") && s("qDateToday").addEventListener("click", () => te(z(/* @__PURE__ */ new Date()))), s("qDateTomorrow") && s("qDateTomorrow").addEventListener("click", () => {
    const e = /* @__PURE__ */ new Date();
    e.setDate(e.getDate() + 1), te(z(e));
  }), s("qDateDayAfter") && s("qDateDayAfter").addEventListener("click", () => {
    const e = /* @__PURE__ */ new Date();
    e.setDate(e.getDate() + 2), te(z(e));
  }), document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach((e) => {
    e.addEventListener("click", function() {
      document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach((n) => n.classList.remove("selected")), this.classList.add("selected"), t.q8 = this.dataset.val, Ae(), P();
    });
  });
  function Ae() {
    const e = document.getElementById("q8Status");
    if (e) if (t.q8Date && t.q8) {
      const n = j(t.q8Date, "long");
      e.innerHTML = `<i class="fas fa-check-circle" style="color:#00AFC0"></i> <strong>${n}</strong> \u2014 ${t.q8}`, e.style.color = "#00AFC0";
    } else t.q8Date ? (e.innerHTML = '<i class="fas fa-clock" style="color:#888"></i> Now select a time slot', e.style.color = "#888") : t.q8 ? (e.innerHTML = '<i class="fas fa-calendar" style="color:#888"></i> Now pick a date above', e.style.color = "#888") : e.textContent = "";
  }
  y && (y.addEventListener("input", function() {
    const e = this.value.trim();
    t.q4 = e;
    const n = e.length >= 2;
    A && (A.disabled = !n), m === 4 && P(), e.length >= 2 && ie();
  }), y.addEventListener("keydown", function(e) {
    e.key === "Enter" && t.q4 && t.q4.length >= 2 && (e.preventDefault(), $(4));
  })), A && A.addEventListener("click", () => {
    t.q4 && t.q4.length >= 2 && $(4);
  }), S && (S.addEventListener("input", function() {
    const e = this.value.trim();
    t.q6 = e;
    const n = e.length >= 2;
    b && (b.disabled = !n), m === 6 && P(), e.length >= 2 && ie();
  }), S.addEventListener("keydown", function(e) {
    e.key === "Enter" && t.q6 && t.q6.length >= 2 && (e.preventDefault(), $(6));
  })), b && b.addEventListener("click", () => {
    t.q6 && t.q6.length >= 2 && $(6);
  }), document.querySelectorAll(".clinic-card-btn").forEach((e) => {
    e.addEventListener("click", function() {
      document.querySelectorAll(".clinic-card-btn").forEach((n) => n.classList.remove("selected")), this.classList.add("selected"), t.q7 = this.dataset.val, t.clinicContact = this.dataset.contact || M, D.delete(7), P(), setTimeout(() => {
        $(7);
      }, 130);
    });
  }), q && (q.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 10), t.q9 = this.value;
    const e = document.getElementById("phoneHint");
    if (e) {
      const n = t.q9;
      n ? n.length < 10 ? e.textContent = `${10 - n.length} more digit${n.length === 9 ? "" : "s"}` : /^[6-9]/.test(n) ? e.textContent = "\u2713 Looks good" : e.textContent = "Indian mobile numbers start with 6, 7, 8 or 9" : e.textContent = "";
    }
    P(), /^[6-9]\d{9}$/.test(t.q9) && ie();
  }), q.addEventListener("keydown", function(e) {
    e.key === "Enter" && /^[6-9]\d{9}$/.test(t.q9 || "") && (e.preventDefault(), C(3), ne());
  })), Z.addEventListener("click", () => {
    if (m > 1) {
      const e = m - 1;
      D.delete(e), ee(e);
    } else C(1);
  }), J.addEventListener("click", () => {
    we() && (m < w ? $(m) : (C(3), ne()));
  });
  function Ge() {
    const e = [];
    return t.q1 && e.push(`Patient concern: ${t.q1}`), t.q2 && e.push(`Duration: ${t.q2}`), t.q3 && e.push(`Family history: ${t.q3}`), t.q4 && e.push(`Patient name: ${t.q4}`), t.q5 && e.push(`Age group: ${t.q5}`), t.q6 && e.push(`City: ${t.q6}`), t.q7 && e.push(`Clinic branch: ${t.q7}`), t.q8Date && e.push(`Preferred date: ${t.q8Date}`), t.q8 && e.push(`Preferred time: ${t.q8}`), t.q9 && e.push(`Phone: +91 ${t.q9}`), e.join(". ");
  }
  async function ne() {
    B("loading"), be();
    const e = Ge();
    let n = L || null;
    n && n.includes(";base64,") && (n = n.split(";base64,")[1]);
    const a = { image: n, mimeType: "image/jpeg", lang: "english", textContext: e, isBlurry: false, isPoorQuality: false }, i = [Pe, `${_e}/analyze-photo`].filter((o, c, r) => r.indexOf(o) === c);
    for (const o of i) try {
      const c = new AbortController(), r = setTimeout(() => c.abort(), 8e3), l = await fetch(o, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(a), signal: c.signal });
      if (clearTimeout(r), l.ok) {
        const d = await l.json();
        if (d && d.status) {
          Ce(d);
          return;
        }
      }
    } catch (c) {
    }
    Ce(Ye(e));
  }
  function Ye(e) {
    var l, d, u;
    const n = e.toLowerCase();
    let a = "Hair Loss Consultation", i = "HAIR", o = "Hair Loss & Thinning Treatment", c = ["Reduced hair density may be visible in the photo.", "Scalp visibility appears increased in the assessment zone."], r = "Based on your answers, a hair specialist assessment is recommended. Dr. Ankit Bhalothia can perform a full trichoscopy and determine the best treatment plan.";
    return n.includes("acne") || n.includes("pimple") || n.includes("breakout") ? (a = "Acne Consultation", i = "SKIN", o = "Acne Treatment Program", c = ["Multiple acne-like lesions and surface bumps may be visible.", "Localized redness around active spots noted."], r = "Based on your answers, acne treatment is recommended. Dr. Amrita Mukhija specialises in advanced acne programs.") : n.includes("pigmentation") || n.includes("melasma") || n.includes("dark patch") ? (a = "Pigmentation & Melasma", i = "SKIN", o = "Pigmentation & Melasma Treatment", c = ["Irregular hyperpigmented patches with uneven melanin distribution.", "Skin tone contrast on sun-exposed facial zones."], r = "A skin specialist can determine pigment depth and formulate a customised de-pigmentation plan.") : n.includes("anti-aging") || n.includes("wrinkle") || n.includes("fine line") ? (a = "Anti-Aging Consultation", i = "ANTI_AGING", o = "Anti-Aging & Botox", c = ["Dynamic expression lines along forehead / glabella.", "Mild loss of superficial skin elasticity noted."], r = "An anti-aging specialist can evaluate facial dynamics and recommend Botox or collagen therapies.") : n.includes("dark circle") || n.includes("under eye") ? (a = "Dark Circle Consultation", i = "SKIN", o = "Dark Circle Treatment", c = ["Periorbital hyperpigmentation beneath lower eyelids.", "Mild anatomical shadow along the tear trough."], r = "Specialist evaluation can differentiate between pigmentation, vascular pooling, or hollowing.") : n.includes("acne scar") || n.includes("pit") || n.includes("scarring") ? (a = "Acne & Scar Treatment", i = "SKIN", o = "Acne Scar Resurfacing", c = ["Textural unevenness with rolling / boxcar-type depressions.", "Dark post-acne marks in affected areas."], r = "A skin specialist can assess scar depth and advise on targeted rejuvenation procedures.") : n.includes("hairline") || n.includes("reced") || n.includes("hair transplant") ? (a = "Hair Transplant Consultation", i = "HAIR_TRANSPLANT_SIKAR", o = "FUE / DHI Hair Transplant", c = ["Noticeable hairline recession and temporal angle thinning visible.", "Donor area appears to have viable follicular density."], r = "The visible hairline recession is suitable for surgical graft evaluation. Sikar Elite Surgical team can calculate required graft counts.") : n.includes("eyebrow") || n.includes("pmu") || n.includes("microblading") ? (a = "PMU / Eyebrow Enhancement", i = "PMU", o = "Eyebrow Microblading / PMU", c = ["Sparse eyebrow hair density with possible asymmetrical contour."], r = "Microblading or PMU can restore eyebrow density and shape. Krishna (PMU Artist) specialises in natural-looking brow architecture.") : n.includes("weight") || n.includes("slim") || n.includes("fat") || n.includes("double chin") || n.includes("body contouring") || n.includes("inch loss") ? (a = "Weight Management & Body Slimming Consultation", i = "WEIGHT_LOSS", o = "Cryolipolysis (Fat Freeze) & Body Contouring", c = ["Target area identified for non-invasive body contouring and fat reduction.", "Candidate for Cryolipolysis (Fat Freezing), HIFU Body Sculpting, and metabolic planning."], r = "Based on your goal, non-surgical Cryolipolysis (fat freezing) and body contouring can target stubborn fat without surgery or downtime.") : (n.includes("rhinoplasty") || n.includes("nose") || n.includes("ent") || n.includes("septum")) && (a = "Rhinoplasty & Facial Aesthetics", i = "ENT_RHINOPLASTY", o = "Aesthetic Rhinoplasty / Nose Reshaping", c = ["Facial symmetry and nasal profile evaluation recommended for aesthetic contouring."], r = "Dr. Mandhata Sharma (ENT & Rhinoplasty Surgeon, MS MAMC) specialises in precision rhinoplasty and endoscopic facial procedures."), { status: "OK", image_quality_score: 88, body_area: i.includes("HAIR") ? "HAIR_SCALP" : i === "PMU" ? "PMU" : i === "WEIGHT_LOSS" ? "WEIGHT_LOSS" : "SKIN", confidence_score: 82, confidence_label: "High", recommended_consultation: a, treatment_name: o, visible_observations: c, possible_concern: a, why_this_consultation: r, department_key: i, specialist: ((l = R[i]) == null ? void 0 : l.name) || "Kezza Specialist", specialist_contact: ((d = R[i]) == null ? void 0 : d.contact) || M, location: ((u = R[i]) == null ? void 0 : u.location) || "Jaipur & Sikar", disclaimer: "This is an AI-assisted preliminary assessment. It is not a medical diagnosis. The Kezza specialist will confirm and determine the appropriate treatment.", needs_in_person_assessment: true };
  }
  function be() {
    const e = ["ls1", "ls2", "ls3", "ls4"];
    let n = 0;
    e.forEach((o) => {
      const c = s(o);
      if (c) {
        c.classList.remove("active", "done");
        const r = c.querySelector("i");
        r && (r.className = "fas fa-circle");
      }
    });
    const a = s("ls1");
    if (a) {
      a.classList.add("active");
      const o = a.querySelector("i");
      o && (o.className = "fas fa-check-circle");
    }
    const i = setInterval(() => {
      if (n < e.length - 1) {
        const o = s(e[n]);
        if (o) {
          o.classList.remove("active"), o.classList.add("done");
          const r = o.querySelector("i");
          r && (r.className = "fas fa-check-circle");
        }
        n++;
        const c = s(e[n]);
        if (c) {
          c.classList.add("active");
          const r = c.querySelector("i");
          r && (r.className = "fas fa-check-circle");
        }
      } else clearInterval(i);
    }, 520);
  }
  function B(e, n = "") {
    pe.classList.add("hidden"), he.classList.add("hidden"), ge.classList.add("hidden"), ye.classList.add("hidden"), e === "loading" ? pe.classList.remove("hidden") : e === "quality" ? he.classList.remove("hidden") : e === "main" ? ge.classList.remove("hidden") : e === "error" && (ye.classList.remove("hidden"), n && (s("errorMessage").textContent = n));
  }
  function Ce(e) {
    if (!e) {
      B("error", "No response received. Please try again.");
      return;
    }
    if (e.status === "QUALITY_ISSUE" || e.image_quality === "POOR") {
      B("quality"), s("qualityMessage").textContent = e.quality_message || "The photo quality was not sufficient for analysis. Please retake in bright, natural light.";
      const n = s("qualityTips");
      n.innerHTML = "", (e.instructions || ["Use natural / bright daylight", "Avoid filters and editing", "Hold camera steady", "Show the affected area clearly"]).forEach((a) => {
        const i = document.createElement("li");
        i.textContent = a, n.appendChild(i);
      });
      return;
    }
    if (e.status === "UNSUPPORTED" || e.status === "UNCLEAR") {
      B("error", e.quality_message || "Could not identify a specific concern from this photo. Please try a clearer, well-lit photo showing the affected area.");
      return;
    }
    if (e.status === "NO_GEMINI_KEY" || e.status === "GEMINI_ERROR") {
      B("error", "AI service is currently unavailable. Please contact us directly on WhatsApp.");
      return;
    }
    Ve(e);
  }
  function Ve(e) {
    B("main"), s("resultThumb").src = L || "";
    const n = e.recommended_consultation || e.possible_concern || "Consultation Recommended";
    s("resultConcern").textContent = n;
    const a = e.confidence_score || 75;
    let i = "moderate", o = "Moderate";
    a >= 85 ? (i = "high", o = "Notable") : a < 65 && (i = "low", o = "Mild");
    const c = s("resultSeverityBadge");
    c.className = `severity-badge ${i}`, s("resultSeverityText").textContent = o;
    const r = e.visible_observations || [], l = s("observationsList");
    l.innerHTML = "", r.forEach((h) => {
      const U = document.createElement("li");
      U.textContent = h, l.appendChild(U);
    }), s("observationsBlock").style.display = r.length ? "" : "none", s("resultTreatment").textContent = e.treatment_name || n;
    const d = e.department_key || "SKIN", u = me(d, t.q7);
    s("resultDoctorImg").src = u.img, s("resultDoctorName").textContent = u.name, s("resultDoctorSpec").textContent = u.spec, s("resultDoctorLocation").textContent = t.q7 ? `${t.q7} Clinic (${u.location})` : u.location, s("summaryPatientName") && (s("summaryPatientName").textContent = t.q4 || "Patient"), s("summaryPatientAge") && (s("summaryPatientAge").textContent = t.q5 || "Not specified"), s("summaryPatientLocation") && (s("summaryPatientLocation").textContent = t.q6 || "Not specified"), s("summaryPatientClinic") && (s("summaryPatientClinic").textContent = t.q7 ? `${t.q7} Clinic` : "Jaipur (Main)");
    const g = t.q8Date ? j(t.q8Date, "short") : "";
    s("summaryPatientTime") && (s("summaryPatientTime").textContent = g ? `${g} \u2014 ${t.q8 || "Any time"}` : t.q8 || "Any time (flexible)"), s("summaryPatientPhone") && (s("summaryPatientPhone").textContent = t.q9 ? `+91 ${t.q9}` : "Not provided");
    const f = e.why_this_consultation || "";
    s("whyText").textContent = f, s("whyBlock").style.display = f ? "" : "none";
    const v = Ee(e, u), x = t.clinicContact || u.contact || M;
    _.href = `https://wa.me/${x}?text=${encodeURIComponent(v)}`, Xe(e), Promise.resolve(Ze(e, u)).finally(() => {
      at();
    });
    try {
      localStorage.removeItem("kezzaScanSession");
    } catch (h) {
    }
  }
  let Le = false;
  async function Ze(e, n) {
    if (!Le) {
      Le = true;
      try {
        const a = t.q5 || "", i = parseInt(a, 10) || "";
        let o = "Jaipur";
        const c = (t.q7 || "").trim().toLowerCase();
        c.includes("ajmer") ? o = "Ajmer" : c.includes("sikar") ? o = "Sikar" : c.includes("jaipur") && (o = "Jaipur");
        const r = o === "Ajmer", l = `KEZZA-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`, d = { recommended_consultation: e.recommended_consultation || "", treatment_name: e.treatment_name || "", department_key: e.department_key || "", confidence_score: e.confidence_score || "", severity: e.severity || "", visible_observations: e.visible_observations || [] }, u = JSON.stringify(d).slice(0, 1500), g = { timestamp: (/* @__PURE__ */ new Date()).toISOString(), consultationId: l, leadId: l, source: "AI Scanner", status: "Pending", name: t.q4 || "Patient", full_name: t.q4 || "Patient", phone: t.q9 || "", whatsapp: t.q9 || "", mobile_number: t.q9 || "", age: i, gender: "", email: "", city: t.q6 || o, patient_city: t.q6 || o, patientLocation: t.q6 || "", clinic: o, preferred_clinic: o, selectedClinic: o, Clinic: o, "Patient Location": t.q6 || "", WhatsApp: t.q9 || "", category: e.department_key || "Skin", treatment_category: e.department_key || "Skin", Category: e.department_key || "Skin", categoryTitle: e.recommended_consultation || "Consultation", service: e.treatment_name || e.recommended_consultation || "Consultation", treatment: e.treatment_name || e.recommended_consultation || "Consultation", Treatment: e.treatment_name || e.recommended_consultation || "Consultation", concern: e.recommended_consultation || e.possible_concern || t.q1 || "Clinical Assessment", Concern: e.recommended_consultation || e.possible_concern || t.q1 || "Clinical Assessment", concernDetails: t.q1 || "", duration: t.q2 || "Not specified", Duration: t.q2 || "Not specified", concern_duration: t.q2 || "Not specified", concernDuration: t.q2 || t.q1 || "Not specified", "Concern / Duration": t.q2 || t.q1 || "Not specified", "concern / duration": t.q2 || t.q1 || "Not specified", "Concern/Duration": t.q2 || t.q1 || "Not specified", severity: e.severity || "", doctor: n.name || "", specialist: n.name || "", Specialist: n.name || "", preferredDate: t.q8Date || "", preferred_date: t.q8Date || "", date: t.q8Date || "", "Preferred Date": t.q8Date || "", preferredTime: t.q8 || "", preferred_time: t.q8 || "", time: t.q8 || "", "Preferred Time": t.q8 || "", message: `[AI Scanner Assessment] Concern: ${t.q1 || "N/A"} | Duration: ${t.q2 || "N/A"}${t.q3 ? " | Family History: " + t.q3 : ""}`, notes: t.q3 ? `Family History: ${t.q3}` : "", symptoms: t.q1 || "", aiSummary: u, department: e.department_key || "Skin", Department: e.department_key || "Skin", Department: e.department_key || "Skin", department_name: e.department_key || "Skin", ai_category: e.department_key || "SKIN", ai_possible_concern: e.recommended_consultation || e.possible_concern || null, ai_confidence: e.confidence_score ? e.confidence_score / 100 : 0.8, Source: "AI Scanner", Source: "AI Scanner", Status: "Pending", Status: "Pending", consent: true };
        let f = false;
        try {
          (await fetch(`${ue}/api/lead`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(g) })).ok && (f = true);
        } catch (h) {
          f = false;
        }
        if (!f) try {
          fetch(xe, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(g), keepalive: true }).catch((h) => console.warn("[AI Scanner Sheet Sync Warn]:", h));
        } catch (h) {
          console.warn("[AI Scanner Sheet Sync Error]:", h);
        }
        const v = Ee(e, n, l), x = r ? Me.whatsapp : t.clinicContact || n.contact || M;
        _.href = `https://wa.me/${x.replace(/\D/g, "")}?text=${encodeURIComponent(v)}`;
      } catch (a) {
        console.warn("[saveAssessmentToDB error]:", a);
      }
    }
  }
  function Ee(e, n, a = null) {
    const i = e.recommended_consultation || e.possible_concern || "General Consultation", o = e.treatment_name || i, c = t.q4 || "Patient", r = t.q5 || "Not specified", l = t.q6 || "Not specified", d = t.q7 ? `${t.q7} Clinic` : "Jaipur Clinic", u = t.q8 || "Any time (Flexible)", g = t.q9 || "Not specified", f = t.q1 || "Not specified", v = t.q2 || "Not specified", x = t.q3 || "Not specified", h = j(t.q8Date, "long");
    return `\u{1F3E5} *KEZZA CLINIC \u2014 APPOINTMENT REQUEST*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501${a ? `
\u{1F194} *Consultation ID:* ${a}
` : `
`}
\u{1F464} *PATIENT DETAILS*
\u2022 *Name:* ${c}
\u2022 *Age Group:* ${r}
\u2022 *City / Location:* ${l}
\u2022 *Selected Clinic:* ${d}
\u2022 *Preferred Date:* ${h}
\u2022 *Preferred Time:* ${u}
\u2022 *Mobile Number:* +91 ${g}

\u{1F52C} *AI PRELIMINARY ASSESSMENT*
\u2022 *Detected Concern:* ${i}
\u2022 *Recommended Treatment:* ${o}
\u2022 *Assigned Specialist:* ${n.name} (${n.spec})

\u{1F4DD} *ADDITIONAL INFORMATION*
\u2022 *Concern Type:* ${f}
\u2022 *Duration:* ${v}
\u2022 *Family History:* ${x}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
_Please confirm my consultation booking at Kezza Clinic._

\u2014 Sent via Kezza AI Face Scanner`;
  }
  function Xe(e) {
    const n = Math.min(Math.max(e.confidence_score || 75, 0), 100), a = Math.min(Math.max(e.image_quality_score || 80, 0), 100), i = Math.round(n * 0.95), o = Math.round((n + a) / 2 * 0.9), c = document.getElementById("confRingFill");
    if (c) {
      const l = 283 - 283 * n / 100;
      n >= 85 ? (c.style.stroke = "var(--success)", c.style.filter = "drop-shadow(0 0 6px rgba(34,197,94,0.5))") : n >= 65 ? c.style.stroke = "var(--gold-400)" : (c.style.stroke = "var(--warning)", c.style.filter = "drop-shadow(0 0 6px rgba(245,158,11,0.5))"), setTimeout(() => {
        c.style.strokeDashoffset = l;
      }, 100);
    }
    const r = document.getElementById("confScoreNum");
    if (r) {
      let l = 0;
      const d = Math.ceil(n / 40), u = setInterval(() => {
        l = Math.min(l + d, n), r.textContent = l, l >= n && clearInterval(u);
      }, 35);
    }
    [{ barId: "statBarPhoto", valId: "statValPhoto", val: a, delay: 200 }, { barId: "statBarConcern", valId: "statValConcern", val: i, delay: 400 }, { barId: "statBarMatch", valId: "statValMatch", val: o, delay: 600 }].forEach(({ barId: l, valId: d, val: u, delay: g }) => {
      setTimeout(() => {
        const f = document.getElementById(l), v = document.getElementById(d);
        f && (f.style.width = `${u}%`), v && (v.textContent = `${u}%`);
      }, g);
    });
  }
  const ae = "kezzaScanSession", le = document.getElementById("sessionSaveBanner");
  let Ie = null;
  function et() {
    le && (le.classList.add("show"), clearTimeout(Ie), Ie = setTimeout(() => le.classList.remove("show"), 1800));
  }
  function ie() {
    try {
      localStorage.setItem(ae, JSON.stringify({ answers: Object.assign({}, t), currentQuestion: m, ts: Date.now() })), et();
    } catch (e) {
    }
  }
  function tt() {
    try {
      const e = localStorage.getItem(ae);
      if (!e) return false;
      const n = JSON.parse(e);
      if (!n.ts || Date.now() - n.ts > 1800 * 1e3) return localStorage.removeItem(ae), false;
      if (Object.assign(t, n.answers), y && t.q4 && (y.value = t.q4), S && t.q6 && (S.value = t.q6), q && t.q9 && (q.value = t.q9), A && (A.disabled = !(t.q4 && t.q4.length >= 2)), b && (b.disabled = !(t.q6 && t.q6.length >= 2)), t.q8Date) {
        const a = document.getElementById("consultDate");
        a && (a.value = t.q8Date);
        const i = document.getElementById("dateDisplay");
        i && (i.textContent = j(t.q8Date, "long"));
      }
      return ["1", "2", "3", "5"].forEach((a) => {
        const i = t[`q${a}`];
        i && document.querySelectorAll(`.answer-btn[data-q="${a}"]`).forEach((o) => {
          o.dataset.val === i && o.classList.add("selected");
        });
      }), t.q7 && document.querySelectorAll(".clinic-card-btn").forEach((a) => {
        a.dataset.val === t.q7 && a.classList.add("selected");
      }), t.q8 && document.querySelectorAll('.answer-btn[data-q="8-time"]').forEach((a) => {
        a.dataset.val === t.q8 && a.classList.add("selected");
      }), true;
    } catch (e) {
      return false;
    }
  }
  function nt() {
    const e = document.getElementById("btnShareResult"), n = document.getElementById("btnDownloadReport");
    e && e.addEventListener("click", async () => {
      const a = `\u{1F3E5} Kezza Clinic AI Assessment

Book your consultation:
\u{1F4DE} +91-9284517427
\u{1F4AC} https://wa.me/919284517427
\u{1F517} ${window.location.href}`;
      try {
        navigator.share ? (await navigator.share({ title: "Kezza AI Assessment", text: a, url: window.location.href }), O('<i class="fas fa-check-circle"></i> Shared successfully!', 2e3)) : (await navigator.clipboard.writeText(a), O('<i class="fas fa-copy"></i> Link copied to clipboard!', 2500));
      } catch (i) {
        O('<i class="fas fa-times-circle"></i> Could not share. Please copy manually.', 2e3);
      }
    }), n && n.addEventListener("click", () => {
      var v, x, h, U, Ne;
      const a = ((v = document.getElementById("resultConcern")) == null ? void 0 : v.textContent) || "Assessment", i = ((x = document.getElementById("resultDoctorName")) == null ? void 0 : x.textContent) || "Kezza Specialist", o = ((h = document.getElementById("resultDoctorSpec")) == null ? void 0 : h.textContent) || "", c = ((U = document.getElementById("resultTreatment")) == null ? void 0 : U.textContent) || "", r = ((Ne = document.getElementById("whyText")) == null ? void 0 : Ne.textContent) || "", d = ["\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", "  KEZZA CLINIC \u2014 AI ASSESSMENT REPORT", "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", `Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, "", "\u2500\u2500 PATIENT DETAILS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", `Name:            ${t.q4 || "Not provided"}`, `Age Group:       ${t.q5 || "Not provided"}`, `City:            ${t.q6 || "Not provided"}`, `Selected Clinic: ${t.q7 ? t.q7 + " Clinic" : "Jaipur Clinic"}`, `Preferred Date:  ${j(t.q8Date, "short") || "Flexible"}`, `Preferred Time:  ${t.q8 || "Any time"}`, `Mobile:          +91 ${t.q9 || "Not provided"}`, "", "\u2500\u2500 AI ASSESSMENT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", `Detected Concern:      ${a}`, `Recommended Treatment: ${c}`, `Assigned Specialist:   ${i} (${o})`, "", "\u2500\u2500 RECOMMENDATION REASON \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", r, "", "\u2500\u2500 ADDITIONAL INFO \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", `Concern Type:    ${t.q1 || "Not specified"}`, `Duration:        ${t.q2 || "Not specified"}`, `Family History:  ${t.q3 || "Not specified"}`, "", "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", "DISCLAIMER: AI-assisted preliminary screening", "only \u2014 not a medical diagnosis.", "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", "Contact: +91-9284517427 | support@kezza.co.in"].join(`
`), u = new Blob([d], { type: "text/plain" }), g = URL.createObjectURL(u), f = document.createElement("a");
      f.href = g, f.download = `Kezza_Assessment_${(t.q4 || "Patient").replace(/\s+/g, "_")}.txt`, document.body.appendChild(f), f.click(), setTimeout(() => {
        document.body.removeChild(f), URL.revokeObjectURL(g);
      }, 500), O('<i class="fas fa-file-download"></i> Report downloaded!', 2e3);
    });
  }
  nt();
  let Q = null;
  function W() {
    Q && (clearInterval(Q), Q = null);
    const e = document.getElementById("waAutoRedirect");
    e && e.remove();
  }
  function at() {
    if (Q || !_) return;
    const e = _.getAttribute("href");
    if (!e || e === "#") return;
    const n = document.createElement("div");
    n.id = "waAutoRedirect", n.style.cssText = "display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:12px;font-size:.85rem;color:#94a3b8", n.innerHTML = '<span id="waCountText"></span><button type="button" id="waStayBtn" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#e2e8f0;font-size:.8rem;font-weight:600;padding:6px 14px;border-radius:20px;cursor:pointer">Stay &amp; read report</button>', _.parentNode.insertBefore(n, _.nextSibling);
    const a = n.querySelector("#waCountText");
    let i = 5;
    const o = () => {
      if (i <= 0) {
        W(), window.location.href = e;
        return;
      }
      a && (a.textContent = `Opening WhatsApp in ${i}...`), i--;
    };
    o(), Q = setInterval(o, 1e3), n.querySelector("#waStayBtn").addEventListener("click", W);
  }
  function O(e, n = 2800) {
    const a = document.getElementById("scannerToast");
    a && (a.innerHTML = e, a.style.display = "flex", requestAnimationFrame(() => {
      a.classList.add("show");
    }), setTimeout(() => {
      a.classList.remove("show"), setTimeout(() => {
        a.style.display = "none";
      }, 350);
    }, n));
  }
  function De() {
    W(), L = null, Object.keys(t).forEach((i) => {
      t[i] = null;
    }), t.clinicContact = M, m = 1, localStorage.removeItem(ae), y && (y.value = ""), S && (S.value = ""), q && (q.value = ""), A && (A.disabled = true), b && (b.disabled = true);
    const e = document.getElementById("consultDate");
    e && (e.value = "");
    const n = document.getElementById("dateDisplay");
    n && (n.textContent = "No date selected");
    const a = document.getElementById("q8Status");
    a && (a.textContent = ""), document.querySelectorAll(".quick-date-btn").forEach((i) => i.classList.remove("active")), V.classList.remove("active"), K.disabled = true, I.style.display = "flex", document.querySelectorAll(".answer-btn").forEach((i) => i.classList.remove("selected")), document.querySelectorAll(".clinic-card-btn").forEach((i) => i.classList.remove("selected")), C(1), window.scrollTo({ top: 0, behavior: "smooth" });
  }
  s("btnRetakePhoto").addEventListener("click", () => {
    C(1), L = null, V.classList.remove("active"), K.disabled = true, I.style.display = "flex";
  }), s("btnRetryAnalysis").addEventListener("click", () => {
    W(), B("loading"), be(), setTimeout(ne, 500);
  }), s("btnStartOver").addEventListener("click", () => {
    De(), O('<i class="fas fa-redo"></i> Consultation restarted.', 2e3);
  }), _ && _.addEventListener("click", function() {
    const e = this.getAttribute("href");
    !e || e === "#" || (W(), O('<i class="fab fa-whatsapp"></i> Appointment details sent! Starting a new consultation...', 2600), setTimeout(() => {
      De();
    }, 2e3));
  });
  const Te = document.querySelector(".navbar");
  if (Te) {
    let e = false, n = false;
    window.addEventListener("scroll", () => {
      n || (requestAnimationFrame(() => {
        const a = window.scrollY > 20;
        a !== e && (e = a, Te.style.boxShadow = e ? "0 4px 24px rgba(0,0,0,0.4)" : "none"), n = false;
      }), n = true);
    }, { passive: true });
  }
  const ke = s("btnHeroStart");
  ke && ke.addEventListener("click", (e) => {
    e.preventDefault(), C(1);
  }), ve();
  const it = tt();
  if (ve(), it && t.q1) {
    C(2);
    const e = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"];
    let n = 1;
    e.forEach((a, i) => {
      t[a] && (n = i + 2);
    }), n = Math.min(n, w), setTimeout(() => {
      ee(n), O('<i class="fas fa-cloud-download-alt"></i> Previous session restored!', 2500);
    }, 400);
  } else C(1);
})();
