/**
 * Kezza Clinic — Interactive Clinical Cost Estimator Engine
 * Hair Transplant (Grafts & Technique) + Laser Hair Reduction + Skin Aesthetics
 */
(function() {
  'use strict';

  var HAIR_DATA = {
    stages: {
      'norwood2': { name: 'Hairline & Temples (Stage 2)', minGrafts: 1200, maxGrafts: 1800, defaultGrafts: 1500 },
      'norwood3': { name: 'Deep Temples & Frontal (Stage 3)', minGrafts: 1800, maxGrafts: 2500, defaultGrafts: 2000 },
      'norwood4': { name: 'Frontal + Mid Scalp (Stage 4)', minGrafts: 2500, maxGrafts: 3200, defaultGrafts: 2800 },
      'norwood5': { name: 'Extensive Crown + Frontal (Stage 5-6)', minGrafts: 3200, maxGrafts: 4500, defaultGrafts: 3600 },
      'beard':    { name: 'Beard & Moustache Restoration', minGrafts: 1000, maxGrafts: 2200, defaultGrafts: 1600 },
      'eyebrow':  { name: 'Eyebrow Density Restoration', minGrafts: 350, maxGrafts: 800, defaultGrafts: 500 }
    },
    rates: {
      'fue': { name: 'Sapphire FUE', perGraft: 25, description: 'Micro-motor extraction with custom sapphire blades for natural angle.' },
      'dhi': { name: 'DHI Micro-Graft', perGraft: 35, description: 'Direct Hair Implantation with Choi implanter pen for max density.' }
    }
  };

  var LASER_AREAS = {
    'underarms': { name: 'Underarms', sessionCost: 1499 },
    'face':      { name: 'Full Face & Beard Shaping', sessionCost: 1999 },
    'arms':      { name: 'Full Arms', sessionCost: 2999 },
    'legs':      { name: 'Full Legs', sessionCost: 3999 },
    'bikini':    { name: 'Bikini / Intimate', sessionCost: 2499 },
    'chest':     { name: 'Chest & Abdomen', sessionCost: 3499 },
    'back':      { name: 'Full Back', sessionCost: 3499 },
    'fullbody':  { name: 'Full Body 360°', sessionCost: 6999, isFullBody: true }
  };

  var LASER_PACKAGES = {
    1: { name: '1 Trial Session', discount: 0 },
    3: { name: '3 Sessions (15% Off)', discount: 0.15 },
    6: { name: '6 Sessions (25% Off - Recommended)', discount: 0.25 },
    8: { name: '8 Sessions (35% Off - Max Smooth)', discount: 0.35 }
  };

  var SKIN_SERVICES = {
    'hydrafacial': { name: 'HydraFacial MD Medi-Glow', price: 2999 },
    'carbonpeel':  { name: 'Hollywood Carbon Laser Peel', price: 3499 },
    'qswitch':     { name: 'Q-Switch Laser Toning (Pigmentation)', price: 2999 },
    'chempeel':    { name: 'Medical Chemical Peel (Acne/Brightening)', price: 1999 },
    'prpgfc':      { name: 'GFC / PRP Vampire Facial', price: 4499 },
    'botox':       { name: 'Botox Anti-Wrinkle Treatment', price: 7999 }
  };

  // State
  var state = {
    tab: 'hair',
    hairStage: 'norwood3',
    hairTechnique: 'fue',
    hairGrafts: 2000,
    selectedLaserAreas: ['underarms', 'legs'],
    laserSessions: 6,
    selectedSkin: ['hydrafacial'],
    clinic: 'Jaipur'
  };

  function formatInr(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function calculateHair() {
    var rate = HAIR_DATA.rates[state.hairTechnique].perGraft;
    var baseCost = state.hairGrafts * rate;
    var minRange = Math.round(baseCost * 0.95);
    var maxRange = Math.round(baseCost * 1.05);
    var monthlyEmi = Math.round(baseCost / 18); // 18-month 0% EMI benchmark

    return {
      procedure: HAIR_DATA.stages[state.hairStage].name + ' (' + HAIR_DATA.rates[state.hairTechnique].name + ')',
      grafts: state.hairGrafts,
      technique: HAIR_DATA.rates[state.hairTechnique].name,
      priceRangeStr: formatInr(minRange) + ' – ' + formatInr(maxRange),
      approxCost: baseCost,
      emiStr: 'From ' + formatInr(monthlyEmi) + '/mo with 0% EMI',
      inclusions: [
        'Free PRP Growth Factor Session (Worth ₹5,000)',
        'Post-OP Medical Shampoo & Care Kit Included',
        '25-Year Follicle Growth Warranty Certificate',
        'Trichoscopy Scalp Examination Included'
      ]
    };
  }

  function calculateLaser() {
    var rawPerSession = 0;
    var hasFullBody = state.selectedLaserAreas.indexOf('fullbody') !== -1;

    if (hasFullBody) {
      rawPerSession = LASER_AREAS['fullbody'].sessionCost;
    } else {
      state.selectedLaserAreas.forEach(function(areaKey) {
        if (LASER_AREAS[areaKey]) {
          rawPerSession += LASER_AREAS[areaKey].sessionCost;
        }
      });
    }

    if (rawPerSession === 0) rawPerSession = 1499;

    var pkg = LASER_PACKAGES[state.laserSessions] || LASER_PACKAGES[6];
    var totalBeforeDiscount = rawPerSession * state.laserSessions;
    var discountAmount = totalBeforeDiscount * pkg.discount;
    var finalPrice = totalBeforeDiscount - discountAmount;
    var monthlyEmi = Math.round(finalPrice / 6);

    return {
      procedure: (hasFullBody ? 'Full Body Laser' : state.selectedLaserAreas.length + ' Body Areas') + ' (' + pkg.name + ')',
      areasCount: state.selectedLaserAreas.length,
      sessions: state.laserSessions,
      priceRangeStr: formatInr(finalPrice),
      approxCost: finalPrice,
      savingsStr: pkg.discount > 0 ? 'You save ' + formatInr(discountAmount) + ' on package' : 'Standard single session price',
      emiStr: finalPrice > 6000 ? 'From ' + formatInr(monthlyEmi) + '/mo (0% EMI)' : 'No-cost EMI available on cards',
      inclusions: [
        'US FDA Approved Triple-Wavelength Technology',
        'Ice-Cool Painless Contact Tip (Chill glide)',
        'Doctor-monitored fluence calibration',
        'Free patch test prior to session'
      ]
    };
  }

  function calculateSkin() {
    var total = 0;
    var names = [];
    state.selectedSkin.forEach(function(key) {
      if (SKIN_SERVICES[key]) {
        total += SKIN_SERVICES[key].price;
        names.push(SKIN_SERVICES[key].name);
      }
    });
    if (total === 0) {
      total = 2999;
      names.push('HydraFacial MD');
    }

    return {
      procedure: names.slice(0, 2).join(' + ') + (names.length > 2 ? ' & more' : ''),
      priceRangeStr: formatInr(total),
      approxCost: total,
      emiStr: 'Special clinic package discounts applicable',
      inclusions: [
        'Dermatologist skin barrier analysis',
        'Medical grade active serums',
        'Zero downtime clinical glow protocol',
        'Home skincare routine recommendation'
      ]
    };
  }

  function updateEstimateCard() {
    var res;
    if (state.tab === 'hair') {
      res = calculateHair();
      document.getElementById('kz-est-tag').textContent = 'HAIR RESTORATION ESTIMATE';
      document.getElementById('kz-est-procedure').textContent = res.procedure;
      document.getElementById('kz-est-stat-1-label').textContent = 'Estimated Grafts:';
      document.getElementById('kz-est-stat-1-val').textContent = res.grafts + ' Follicular Units';
      document.getElementById('kz-est-stat-2-label').textContent = 'Technique:';
      document.getElementById('kz-est-stat-2-val').textContent = res.technique;
    } else if (state.tab === 'laser') {
      res = calculateLaser();
      document.getElementById('kz-est-tag').textContent = 'LASER HAIR REDUCTION ESTIMATE';
      document.getElementById('kz-est-procedure').textContent = res.procedure;
      document.getElementById('kz-est-stat-1-label').textContent = 'Selected Areas:';
      document.getElementById('kz-est-stat-1-val').textContent = res.areasCount + ' body zones';
      document.getElementById('kz-est-stat-2-label').textContent = 'Sessions Plan:';
      document.getElementById('kz-est-stat-2-val').textContent = res.sessions + ' Sessions';
    } else {
      res = calculateSkin();
      document.getElementById('kz-est-tag').textContent = 'SKIN & AESTHETIC ESTIMATE';
      document.getElementById('kz-est-procedure').textContent = res.procedure;
      document.getElementById('kz-est-stat-1-label').textContent = 'Clinical Service:';
      document.getElementById('kz-est-stat-1-val').textContent = res.procedure;
      document.getElementById('kz-est-stat-2-label').textContent = 'Clinic Level:';
      document.getElementById('kz-est-stat-2-val').textContent = 'Doctor Administered';
    }

    document.getElementById('kz-est-price-val').textContent = res.priceRangeStr;
    document.getElementById('kz-est-emi-val').textContent = res.emiStr;

    var incList = document.getElementById('kz-est-inclusions');
    if (incList) {
      incList.innerHTML = '';
      res.inclusions.forEach(function(inc) {
        var li = document.createElement('li');
        li.innerHTML = '<i class="fas fa-check-circle"></i> ' + inc;
        incList.appendChild(li);
      });
    }

    // Update hidden field for forms
    var summaryInput = document.getElementById('kz-est-hidden-summary');
    if (summaryInput) {
      summaryInput.value = res.procedure + ' | Estimated: ' + res.priceRangeStr;
    }
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.estimator-tab-btn');
    tabs.forEach(function(btn) {
      btn.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        btn.classList.add('active');
        var targetTab = btn.getAttribute('data-tab');
        state.tab = targetTab;

        document.querySelectorAll('.estimator-panel').forEach(function(panel) {
          panel.classList.remove('active');
        });
        var activePanel = document.getElementById('panel-' + targetTab);
        if (activePanel) activePanel.classList.add('active');

        updateEstimateCard();
      });
    });
  }

  function initHairControls() {
    // Stage selector
    var stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(function(card) {
      card.addEventListener('click', function() {
        stageCards.forEach(function(c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        var stageKey = card.getAttribute('data-stage');
        state.hairStage = stageKey;

        var defaultGrafts = HAIR_DATA.stages[stageKey].defaultGrafts;
        state.hairGrafts = defaultGrafts;

        var slider = document.getElementById('hair-graft-slider');
        if (slider) {
          slider.value = defaultGrafts;
          slider.min = HAIR_DATA.stages[stageKey].minGrafts;
          slider.max = HAIR_DATA.stages[stageKey].maxGrafts;
          document.getElementById('slider-current-grafts').textContent = defaultGrafts + ' Grafts';
        }

        updateEstimateCard();
      });
    });

    // Technique selector
    var techBoxes = document.querySelectorAll('.technique-box');
    techBoxes.forEach(function(box) {
      box.addEventListener('click', function() {
        techBoxes.forEach(function(b) { b.classList.remove('selected'); });
        box.classList.add('selected');
        state.hairTechnique = box.getAttribute('data-tech');
        updateEstimateCard();
      });
    });

    // Slider
    var graftSlider = document.getElementById('hair-graft-slider');
    if (graftSlider) {
      graftSlider.addEventListener('input', function() {
        state.hairGrafts = parseInt(this.value, 10);
        document.getElementById('slider-current-grafts').textContent = this.value + ' Grafts';
        updateEstimateCard();
      });
    }
  }

  function initLaserControls() {
    var areaChips = document.querySelectorAll('.area-chip');
    areaChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        var areaKey = chip.getAttribute('data-area');
        if (areaKey === 'fullbody') {
          // If selecting fullbody, clear others
          areaChips.forEach(function(c) { c.classList.remove('selected'); });
          chip.classList.add('selected');
          state.selectedLaserAreas = ['fullbody'];
        } else {
          // Remove fullbody if selecting specific
          var fullBodyChip = document.querySelector('.area-chip[data-area="fullbody"]');
          if (fullBodyChip) fullBodyChip.classList.remove('selected');
          var fbIdx = state.selectedLaserAreas.indexOf('fullbody');
          if (fbIdx !== -1) state.selectedLaserAreas.splice(fbIdx, 1);

          chip.classList.toggle('selected');
          var idx = state.selectedLaserAreas.indexOf(areaKey);
          if (idx !== -1) {
            state.selectedLaserAreas.splice(idx, 1);
          } else {
            state.selectedLaserAreas.push(areaKey);
          }
        }
        if (state.selectedLaserAreas.length === 0) {
          state.selectedLaserAreas = ['underarms'];
          var defChip = document.querySelector('.area-chip[data-area="underarms"]');
          if (defChip) defChip.classList.add('selected');
        }
        updateEstimateCard();
      });
    });

    // Sessions package toggle
    var sessionPills = document.querySelectorAll('.session-pill-btn');
    sessionPills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        sessionPills.forEach(function(p) { p.classList.remove('selected'); });
        pill.classList.add('selected');
        state.laserSessions = parseInt(pill.getAttribute('data-sessions'), 10);
        updateEstimateCard();
      });
    });
  }

  function initSkinControls() {
    var skinChips = document.querySelectorAll('.skin-service-chip');
    skinChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chip.classList.toggle('selected');
        var sKey = chip.getAttribute('data-skin');
        var idx = state.selectedSkin.indexOf(sKey);
        if (idx !== -1) {
          state.selectedSkin.splice(idx, 1);
        } else {
          state.selectedSkin.push(sKey);
        }
        if (state.selectedSkin.length === 0) {
          state.selectedSkin = ['hydrafacial'];
          var def = document.querySelector('.skin-service-chip[data-skin="hydrafacial"]');
          if (def) def.classList.add('selected');
        }
        updateEstimateCard();
      });
    });
  }

  function initForm() {
    var form = document.getElementById('kz-estimator-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var nameInput = document.getElementById('est-patient-name');
      var phoneInput = document.getElementById('est-patient-phone');
      var clinicSelect = document.getElementById('est-patient-clinic');

      var name = (nameInput ? nameInput.value : '').trim();
      var phone = (phoneInput ? phoneInput.value : '').replace(/\D/g, '');
      var clinic = (clinicSelect ? clinicSelect.value : 'Jaipur') || 'Jaipur';

      if (!name) {
        alert('Please enter your full name.');
        if (nameInput) nameInput.focus();
        return;
      }
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit Indian WhatsApp mobile number.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      var currentCalc = state.tab === 'hair' ? calculateHair() : (state.tab === 'laser' ? calculateLaser() : calculateSkin());
      var submitBtn = document.getElementById('kz-est-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating WhatsApp Quote...';
      }

      var leadData = {
        name: name,
        whatsapp: phone,
        phone: phone,
        clinic: clinic,
        category: state.tab === 'hair' ? 'Hair' : (state.tab === 'laser' ? 'Laser' : 'Skin'),
        treatment: currentCalc.procedure,
        estimate: currentCalc.priceRangeStr,
        source: 'Online Cost Estimator (' + state.tab.toUpperCase() + ')',
        message: 'Patient used online cost estimator. Selected: ' + currentCalc.procedure + ' | Estimate: ' + currentCalc.priceRangeStr
      };

      // 1. TeleCRM integration if present
      if (window.KezzaTeleCRM && typeof window.KezzaTeleCRM.sendLead === 'function') {
        window.KezzaTeleCRM.sendLead(leadData);
      }

      // 2. Local / Server API lead capture
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Get Instant Estimate on WhatsApp';
        }
        var leadId = (data && data.leadId) || ('KEZZA-' + Math.floor(1000 + Math.random() * 9000));
        var waUrl = data && data.whatsappUrl;

        // Show follow-up modal
        if (window.KezzaFollowUp && typeof window.KezzaFollowUp.show === 'function') {
          window.KezzaFollowUp.show({
            name: name,
            treatment: currentCalc.procedure,
            estimate: currentCalc.priceRangeStr,
            clinic: clinic,
            leadId: leadId,
            whatsappUrl: waUrl
          });
        }
      })
      .catch(function(err) {
        console.error('Estimate submission error:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Get Instant Estimate on WhatsApp';
        }
        if (window.KezzaFollowUp && typeof window.KezzaFollowUp.show === 'function') {
          window.KezzaFollowUp.show({
            name: name,
            treatment: currentCalc.procedure,
            estimate: currentCalc.priceRangeStr,
            clinic: clinic
          });
        }
      });
    });
  }

  function init() {
    initTabs();
    initHairControls();
    initLaserControls();
    initSkinControls();
    initForm();
    updateEstimateCard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.KezzaEstimator = {
    calculateHair: calculateHair,
    calculateLaser: calculateLaser,
    calculateSkin: calculateSkin,
    state: state
  };

})();
