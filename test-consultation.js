// ============================================
// KEZZA AI — CONSULTATION VALIDATION & STATE MACHINE TEST SUITE
// ============================================

const assert = require('assert');

// Mock browser globals for Node.js environment
global.window = global;
global.location = { hostname: 'localhost', port: '3001', origin: 'http://localhost:3001' };
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
global.sessionStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
global.document = {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {}, addEventListener: () => {} }),
    body: { appendChild: () => {} }
};
global.fetch = async () => ({ ok: true, json: async () => ({ status: 'SENT' }) });

// Load chatbot.js
const KezzaAI = require('./chatbot.js');

console.log('🧪 Starting Kezza AI Consultation & Validation Test Suite...\n');

let passed = 0;
let total = 0;
let asyncQueue = Promise.resolve();

function it(desc, fn) {
    total++;
    try {
        fn();
        console.log(`  ✅ ${desc}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${desc}`);
        console.error(`     Error: ${err.message}`);
        console.error(err.stack);
    }
}

function itAsync(desc, fn) {
    total++;
    asyncQueue = asyncQueue.then(async () => {
        try {
            await fn();
            console.log(`  ✅ ${desc}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ ${desc}`);
            console.error(`     Error: ${err.message}`);
            console.error(err.stack);
        }
    });
}

// ---------------------------------------------------------------------
// 1. NAME VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('📋 1. Name Validation Tests:');

it('Rejects greetings & arbitrary chat noise (hi, hii, hello, yes, no, etc.)', () => {
    assert.strictEqual(KezzaAI.validateName('hi'), null);
    assert.strictEqual(KezzaAI.validateName('hii'), null);
    assert.strictEqual(KezzaAI.validateName('hiii'), null);
    assert.strictEqual(KezzaAI.validateName('hello'), null);
    assert.strictEqual(KezzaAI.validateName('yes'), null);
    assert.strictEqual(KezzaAI.validateName('no'), null);
    assert.strictEqual(KezzaAI.validateName('okay'), null);
    assert.strictEqual(KezzaAI.validateName('thanks'), null);
    assert.strictEqual(KezzaAI.validateName('nothing'), null);
    assert.strictEqual(KezzaAI.validateName('1234'), null);
});

it('Rejects treatment terms entered as name', () => {
    assert.strictEqual(KezzaAI.validateName('hair loss'), null);
    assert.strictEqual(KezzaAI.validateName('hair fall'), null);
    assert.strictEqual(KezzaAI.validateName('botox'), null);
    assert.strictEqual(KezzaAI.validateName('medical facial'), null);
});

it('Accepts valid English, Hinglish, and Hindi names', () => {
    assert.strictEqual(KezzaAI.validateName('Ravi'), 'Ravi');
    assert.strictEqual(KezzaAI.validateName('Ravi Kumar'), 'Ravi Kumar');
    assert.strictEqual(KezzaAI.validateName('mera naam Ravi hai'), 'Ravi');
    assert.strictEqual(KezzaAI.validateName('my name is Rahul Sharma'), 'Rahul Sharma');
    assert.strictEqual(KezzaAI.validateName('Khushi Rathore'), 'Khushi Rathore');
    assert.strictEqual(KezzaAI.validateName('Dr. Amrita Makhija'), 'Dr. Amrita Makhija');
    assert.strictEqual(KezzaAI.validateName('रवि कुमार'), 'रवि कुमार');
});

// ---------------------------------------------------------------------
// 2. AGE VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 2. Age Validation Tests:');

it('Rejects noise & invalid age entries', () => {
    assert.strictEqual(KezzaAI.validateAge('hii'), null);
    assert.strictEqual(KezzaAI.validateAge('hello'), null);
    assert.strictEqual(KezzaAI.validateAge('hair loss'), null);
    assert.strictEqual(KezzaAI.validateAge('Jaipur'), null);
    assert.strictEqual(KezzaAI.validateAge('0'), null);
    assert.strictEqual(KezzaAI.validateAge('150'), null);
    assert.strictEqual(KezzaAI.validateAge('-5'), null);
});

it('Extracts numeric age from numbers and natural language strings', () => {
    assert.strictEqual(KezzaAI.validateAge('21'), 21);
    assert.strictEqual(KezzaAI.validateAge('21 saal'), 21);
    assert.strictEqual(KezzaAI.validateAge('I am 21 years old'), 21);
    assert.strictEqual(KezzaAI.validateAge('meri age 25 hai'), 25);
    assert.strictEqual(KezzaAI.validateAge('umar 35'), 35);
    assert.strictEqual(KezzaAI.validateAge('45 yrs'), 45);
});

// ---------------------------------------------------------------------
// 3. PATIENT LOCATION VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 3. Patient Location Validation Tests:');

it('Rejects greetings & arbitrary chat noise (hii, hello, etc.) from patient location', () => {
    assert.strictEqual(KezzaAI.validatePatientLocation('hi'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('hii'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('hello'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('yes'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('no'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('okay'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('11 AM'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('21'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('tomorrow'), null);
    assert.strictEqual(KezzaAI.validatePatientLocation('hair transplant'), null);
});

it('Accepts and normalizes valid cities & localities', () => {
    assert.strictEqual(KezzaAI.validatePatientLocation('Jaipur'), 'Jaipur');
    assert.strictEqual(KezzaAI.validatePatientLocation('jaipur'), 'Jaipur');
    assert.strictEqual(KezzaAI.validatePatientLocation('I live in Jaipur'), 'Jaipur');
    assert.strictEqual(KezzaAI.validatePatientLocation('main Jaipur mein rehta hoon'), 'Jaipur');
    assert.strictEqual(KezzaAI.validatePatientLocation('Mansarovar Jaipur'), 'Mansarovar, Jaipur');
    assert.strictEqual(KezzaAI.validatePatientLocation('Sikar'), 'Sikar');
    assert.strictEqual(KezzaAI.validatePatientLocation('main Sikar se hu'), 'Sikar');
    assert.strictEqual(KezzaAI.validatePatientLocation('Delhi'), 'Delhi');
    assert.strictEqual(KezzaAI.validatePatientLocation('Mumbai'), 'Mumbai');
    assert.strictEqual(KezzaAI.validatePatientLocation('Kota'), 'Kota');
});

// ---------------------------------------------------------------------
// 4. CLINIC LOCATION VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 4. Clinic Location Validation Tests:');

it('Accepts Jaipur and Sikar ONLY as Kezza clinic locations', () => {
    const jRes = KezzaAI.validateClinicLocation('Jaipur');
    assert.strictEqual(jRes.valid, true);
    assert.strictEqual(jRes.value, 'Jaipur');

    const sRes = KezzaAI.validateClinicLocation('📍 Sikar Clinic');
    assert.strictEqual(sRes.valid, true);
    assert.strictEqual(sRes.value, 'Sikar');
});

it('Strictly rejects Alwar and arbitrary cities for clinic location', () => {
    const alwarRes = KezzaAI.validateClinicLocation('Alwar');
    assert.strictEqual(alwarRes.valid, false);
    assert.strictEqual(alwarRes.error, 'ALWAR_NOT_OFFERED');

    assert.strictEqual(KezzaAI.validateClinicLocation('Delhi'), null);
    assert.strictEqual(KezzaAI.validateClinicLocation('Mumbai'), null);
    assert.strictEqual(KezzaAI.validateClinicLocation('hii'), null);
});

// ---------------------------------------------------------------------
// 5. CATEGORY & TREATMENT VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 5. Category & Treatment Validation Tests:');

it('Correctly classifies categories (Hair, Skin, PMU, SMP, Weight Loss, Rhinoplasty)', () => {
    assert.strictEqual(KezzaAI.validateCategory('Hair'), 'hair');
    assert.strictEqual(KezzaAI.validateCategory('Skin'), 'skin');
    assert.strictEqual(KezzaAI.validateCategory('Medical Facial'), 'skin');
    assert.strictEqual(KezzaAI.validateCategory('Botox'), 'skin');
    assert.strictEqual(KezzaAI.validateCategory('PMU'), 'pmu');
    assert.strictEqual(KezzaAI.validateCategory('SMP'), 'smp');
    assert.strictEqual(KezzaAI.validateCategory('Weight Loss'), 'weight_loss');
    assert.strictEqual(KezzaAI.validateCategory('Rhinoplasty'), 'rhinoplasty');
});

it('Validates specific treatments per category', () => {
    assert.strictEqual(KezzaAI.validateTreatment('Hair Transplant', 'hair'), 'Hair Transplant (HT)');
    assert.strictEqual(KezzaAI.validateTreatment('PRP', 'hair'), 'PRP Therapy');
    assert.strictEqual(KezzaAI.validateTreatment('Medical Facial', 'skin'), 'Medical Facial');
    assert.strictEqual(KezzaAI.validateTreatment('Botox', 'skin'), 'Botox Treatment');
    assert.strictEqual(KezzaAI.validateTreatment('Microblading', 'pmu'), 'Eyebrow PMU (Microblading / Ombré Brows)');
    assert.strictEqual(KezzaAI.validateTreatment('Scalp Micropigmentation', 'smp'), 'Scalp Micropigmentation (SMP)');
});

// ---------------------------------------------------------------------
// 6. DATE & TIME VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 6. Date & Time Validation Tests:');

it('Validates and normalizes date inputs', () => {
    assert.ok(KezzaAI.validateDate('Today'));
    assert.ok(KezzaAI.validateDate('Tomorrow'));
    assert.ok(KezzaAI.validateDate('Kal'));
    assert.ok(KezzaAI.validateDate('This Weekend'));
    assert.ok(KezzaAI.validateDate('Next Monday'));
    assert.ok(KezzaAI.validateDate('20 August 2026'));

    assert.strictEqual(KezzaAI.validateDate('hii'), null);
    assert.strictEqual(KezzaAI.validateDate('hair loss'), null);
    assert.strictEqual(KezzaAI.validateDate('11 AM'), null);
});

it('Validates time between 9:00 AM and 8:00 PM business hours', () => {
    const t1 = KezzaAI.validateTime('11:00 AM');
    assert.strictEqual(t1.valid, true);
    assert.strictEqual(t1.value, '11:00 AM');

    const t2 = KezzaAI.validateTime('5 PM');
    assert.strictEqual(t2.valid, true);
    assert.strictEqual(t2.value, '5:00 PM');

    const t3 = KezzaAI.validateTime('subah 11 baje');
    assert.strictEqual(t3.valid, true);
    assert.strictEqual(t3.value, '11:00 AM');

    // Outside business hours (before 9 AM / after 8 PM)
    const tEarly = KezzaAI.validateTime('6 AM');
    assert.strictEqual(tEarly.valid, false);
    assert.strictEqual(tEarly.error, 'OUTSIDE_HOURS');

    const tLate = KezzaAI.validateTime('10 PM');
    assert.strictEqual(tLate.valid, false);
    assert.strictEqual(tLate.error, 'OUTSIDE_HOURS');

    assert.strictEqual(KezzaAI.validateTime('hii'), null);
    assert.strictEqual(KezzaAI.validateTime('hair loss'), null);
});

// ---------------------------------------------------------------------
// 7. PHONE NUMBER VALIDATOR TESTS
// ---------------------------------------------------------------------
console.log('\n📋 7. Phone Number Validation Tests:');

it('Strictly validates 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
    // Valid 10 digits starting with 6-9
    assert.strictEqual(KezzaAI.validatePhone('9876543210'), '9876543210');
    assert.strictEqual(KezzaAI.validatePhone('8765432109'), '8765432109');
    assert.strictEqual(KezzaAI.validatePhone('7654321098'), '7654321098');
    assert.strictEqual(KezzaAI.validatePhone('6123456789'), '6123456789');

    // Strict: Must NOT accept prefixes, non-digits, or incorrect length
    assert.strictEqual(KezzaAI.validatePhone('+91 9876543210'), null);
    assert.strictEqual(KezzaAI.validatePhone('+919876543210'), null);
    assert.strictEqual(KezzaAI.validatePhone('09876543210'), null);
    assert.strictEqual(KezzaAI.validatePhone('98765-43210'), null);
    assert.strictEqual(KezzaAI.validatePhone('98765'), null);
    assert.strictEqual(KezzaAI.validatePhone('987654321'), null);
    assert.strictEqual(KezzaAI.validatePhone('98765432101'), null);
    assert.strictEqual(KezzaAI.validatePhone('9876543210abc'), null);
    assert.strictEqual(KezzaAI.validatePhone('5123456789'), null); // Does not start with 6-9
    assert.strictEqual(KezzaAI.validatePhone('1234567890'), null); // Does not start with 6-9
    assert.strictEqual(KezzaAI.validatePhone('abcdefghij'), null);
    assert.strictEqual(KezzaAI.validatePhone('1234'), null);
    assert.strictEqual(KezzaAI.validatePhone('hii'), null);
});

it('Passes strict final acceptance test matrix for WhatsApp numbers', () => {
    // 9876543210 → PASS
    assert.strictEqual(KezzaAI.validatePhone('9876543210'), '9876543210');
    // 8765432109 → PASS
    assert.strictEqual(KezzaAI.validatePhone('8765432109'), '8765432109');
    // 7654321098 → PASS
    assert.strictEqual(KezzaAI.validatePhone('7654321098'), '7654321098');
    // 6123456789 → PASS
    assert.strictEqual(KezzaAI.validatePhone('6123456789'), '6123456789');

    // 987654321 → FAIL (9 digits)
    assert.strictEqual(KezzaAI.validatePhone('987654321'), null);
    // 98765432101 → FAIL (11 digits)
    assert.strictEqual(KezzaAI.validatePhone('98765432101'), null);
    // 5123456789 → FAIL (starts with 5)
    assert.strictEqual(KezzaAI.validatePhone('5123456789'), null);
    // abcdefghij → FAIL (letters)
    assert.strictEqual(KezzaAI.validatePhone('abcdefghij'), null);
    // 98765abc10 → FAIL (mixed non-numeric)
    assert.strictEqual(KezzaAI.validatePhone('98765abc10'), null);
    // +91 9876543210 → FAIL (spaces / country code not accepted as-is)
    assert.strictEqual(KezzaAI.validatePhone('+91 9876543210'), null);
    // 98765-43210 → FAIL (hyphen not accepted as-is)
    assert.strictEqual(KezzaAI.validatePhone('98765-43210'), null);
});

// ---------------------------------------------------------------------
// 8. MULTI-FIELD SINGLE UTTERANCE EXTRACTION TESTS
// ---------------------------------------------------------------------
console.log('\n📋 8. Multi-Field Extraction Tests:');

it('Extracts multiple fields from a single natural language message', () => {
    const multi = KezzaAI.extractMultiFields('My name is Ravi, I am 21 and I live in Jaipur.');
    assert.strictEqual(multi.name, 'Ravi');
    assert.strictEqual(multi.age, 21);
    assert.strictEqual(multi.patientLocation, 'Jaipur');
});

it('Extracts multiple fields from Hindi/Hinglish message', () => {
    const multi = KezzaAI.extractMultiFields('Mera naam Rahul Sharma hai, meri age 24 saal hai aur main Sikar mein rehta hu. WhatsApp 9876543210');
    assert.strictEqual(multi.name, 'Rahul Sharma');
    assert.strictEqual(multi.age, 24);
    assert.strictEqual(multi.patientLocation, 'Sikar');
    assert.strictEqual(multi.phone, '9876543210');
});

// ---------------------------------------------------------------------
// 9. CORRECTION HANDLING TESTS
// ---------------------------------------------------------------------
console.log('\n📋 9. Correction Handling Tests:');

it('Updates only requested field on correction phrase', () => {
    const mockFlow = {
        state: KezzaAI.CONSULTATION_STATES.REVIEW,
        data: {
            name: 'Ravi',
            age: 21,
            patientLocation: 'Jaipur',
            selectedClinic: 'Jaipur',
            category: 'hair',
            treatment: 'Hair Transplant (HT)',
            concernDetails: 'Less than 6 months',
            date: 'Tomorrow',
            time: '11:00 AM',
            phone: '9876543210'
        }
    };

    // Correct Age
    const corr1 = KezzaAI.handleFieldCorrection('age 22 kar do', mockFlow);
    assert.ok(corr1);
    assert.strictEqual(mockFlow.data.age, 22);
    assert.strictEqual(mockFlow.data.name, 'Ravi'); // Name unchanged

    // Correct Name
    const corr2 = KezzaAI.handleFieldCorrection('mera naam Ravi nahi Rahul hai', mockFlow);
    assert.ok(corr2);
    assert.strictEqual(mockFlow.data.name, 'Rahul');
    assert.strictEqual(mockFlow.data.age, 22); // Age preserved
});

// ---------------------------------------------------------------------
// 10. END-TO-END STATE MACHINE CONVERSATION FLOW
// ---------------------------------------------------------------------
console.log('\n📋 10. End-to-End Consultation State Machine Flow Tests:');

itAsync('Executes full deterministic flow with invalid input rejection & field isolation', async () => {
    KezzaAI.resetFlow();

    // Step 1: Start Flow
    const resp1 = KezzaAI.startConsultationFlow(null, null, 'hinglish');
    const flow = KezzaAI.getState().consultationFlow;
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.NAME);

    // Step 2: User says "hii" -> Must REJECT and remain in NAME
    const resp2 = await KezzaAI.handleConsultationFlow('hii', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.NAME);
    assert.strictEqual(flow.data.name, null);

    // Step 3: User provides valid Name
    const resp3 = await KezzaAI.handleConsultationFlow('Ravi Kumar', 'hinglish');
    assert.strictEqual(flow.data.name, 'Ravi Kumar');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.AGE);

    // Step 4: User sends "Jaipur" when prompted for Age -> Must REJECT and remain in AGE
    const resp4 = await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.AGE);
    assert.strictEqual(flow.data.age, null);

    // Step 5: User sends valid Age
    const resp5 = await KezzaAI.handleConsultationFlow('21', 'hinglish');
    assert.strictEqual(flow.data.age, 21);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PATIENT_LOCATION);

    // Step 6: User sends "hii" when prompted for Patient Location -> Must REJECT
    const resp6 = await KezzaAI.handleConsultationFlow('hii', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PATIENT_LOCATION);
    assert.strictEqual(flow.data.patientLocation, null);

    // Step 7: User sends valid Patient Location
    const resp7 = await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    assert.strictEqual(flow.data.patientLocation, 'Jaipur');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.CLINIC_LOCATION);

    // Step 8: User sends "Alwar" when prompted for Clinic Location -> Must REJECT
    const resp8 = await KezzaAI.handleConsultationFlow('Alwar', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.CLINIC_LOCATION);
    assert.strictEqual(flow.data.selectedClinic, null);

    // Step 9: User selects Jaipur Clinic
    const resp9 = await KezzaAI.handleConsultationFlow('📍 Jaipur Clinic', 'hinglish');
    assert.strictEqual(flow.data.selectedClinic, 'Jaipur');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.CATEGORY);

    // Step 10: User selects Category
    const resp10 = await KezzaAI.handleConsultationFlow('💇 Hair', 'hinglish');
    assert.strictEqual(flow.data.category, 'hair');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.TREATMENT);

    // Step 11: User selects Treatment
    const resp11 = await KezzaAI.handleConsultationFlow('Hair Transplant (HT)', 'hinglish');
    assert.strictEqual(flow.data.treatment, 'Hair Transplant (HT)');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.CONCERN);

    // Step 12: User provides Concern
    const resp12 = await KezzaAI.handleConsultationFlow('Less than 6 months', 'hinglish');
    assert.strictEqual(flow.data.concernDetails, 'Less than 6 months');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PREFERRED_DATE);

    // Step 13: User provides Date
    const resp13 = await KezzaAI.handleConsultationFlow('Tomorrow', 'hinglish');
    assert.ok(flow.data.date);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PREFERRED_TIME);

    // Step 14: User provides Time
    const resp14 = await KezzaAI.handleConsultationFlow('11:00 AM', 'hinglish');
    assert.strictEqual(flow.data.time, '11:00 AM');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.WHATSAPP);

    // Step 15: User sends invalid WhatsApp -> Must REJECT
    const resp15 = await KezzaAI.handleConsultationFlow('1234', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.WHATSAPP);
    assert.strictEqual(flow.data.phone, null);

    // Step 16: User sends valid WhatsApp -> Transitions to REVIEW
    const resp16 = await KezzaAI.handleConsultationFlow('9876543210', 'hinglish');
    assert.strictEqual(flow.data.phone, '9876543210');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);

    // Verify Review Card has no undefined / null / NaN
    assert.ok(!resp16.text.includes('undefined'));
    assert.ok(!resp16.text.includes('null'));
    assert.ok(!resp16.text.includes('NaN'));
    assert.ok(resp16.text.includes('Ravi Kumar'));
    assert.ok(resp16.text.includes('21'));
    assert.ok(resp16.text.includes('Jaipur'));
    assert.ok(resp16.text.includes('Hair Transplant'));

    // Step 17: Submit Consultation
    const resp17 = await KezzaAI.handleConsultationFlow('✅ Submit Consultation', 'hinglish');
    assert.ok(resp17.text.includes('Consultation Request Sent Successfully') || resp17.text.includes('Consultation Details Ready'));
});

// ---------------------------------------------------------------------
// 11. SERVER-SIDE VALIDATION TESTS
// ---------------------------------------------------------------------
console.log('\n📋 11. Server-Side Validation Tests:');

// Helper to test server validatePayload
const serverCode = require('fs').readFileSync('./kezza-server.js', 'utf8');
const vm = require('vm');
const serverContext = {
    console,
    DEPARTMENT_PHONES: {
        'HAIR_TRANSPLANT': '9079163100',
        'SKIN_AESTHETICS': '9079163100',
        'PMU_SPECIALIST': '9079161300',
        'SMP_SPECIALIST': '9079161300',
        'WEIGHT_LOSS': '9079163100',
        'ENT_RHINOPLASTY': '9284517427'
    }
};
vm.createContext(serverContext);
vm.runInContext(serverCode.substring(serverCode.indexOf('const SERVER_GREETINGS_NOISE'), serverCode.indexOf('// ─── GEMINI AI PROXY')), serverContext);

it('Server validation rejects payload with invalid patient location "hii"', () => {
    const invalidPayload = {
        name: 'Ravi Kumar',
        age: 21,
        patientLocation: 'hii',
        selectedClinic: 'Jaipur',
        category: 'hair',
        treatment: 'Hair Transplant (HT)',
        date: 'Tomorrow',
        time: '11:00 AM',
        phone: '9876543210',
        department: 'HAIR_TRANSPLANT'
    };
    const res = serverContext.validatePayload(invalidPayload);
    assert.strictEqual(res.valid, false);
    assert.ok(res.missing.includes('patientLocation'));
});

it('Server validation rejects payload with clinic "Alwar"', () => {
    const invalidPayload = {
        name: 'Ravi Kumar',
        age: 21,
        patientLocation: 'Jaipur',
        selectedClinic: 'Alwar',
        category: 'hair',
        treatment: 'Hair Transplant (HT)',
        date: 'Tomorrow',
        time: '11:00 AM',
        phone: '9876543210',
        department: 'HAIR_TRANSPLANT'
    };
    const res = serverContext.validatePayload(invalidPayload);
    assert.strictEqual(res.valid, false);
    assert.ok(res.missing.includes('selectedClinic'));
});

it('Server validation rejects payload with invalid age or invalid phone', () => {
    const invalidPayload = {
        name: 'Ravi Kumar',
        age: 0,
        patientLocation: 'Jaipur',
        selectedClinic: 'Jaipur',
        category: 'hair',
        treatment: 'Hair Transplant (HT)',
        date: 'Tomorrow',
        time: '11:00 AM',
        phone: '1234',
        department: 'HAIR_TRANSPLANT'
    };
    const res = serverContext.validatePayload(invalidPayload);
    assert.strictEqual(res.valid, false);
    assert.ok(res.missing.includes('age'));
    assert.ok(res.missing.includes('phone'));
});

it('Server validation accepts fully valid payload', () => {
    const validPayload = {
        name: 'Ravi Kumar',
        age: 21,
        patientLocation: 'Jaipur',
        selectedClinic: 'Jaipur',
        category: 'hair',
        treatment: 'Hair Transplant (HT)',
        date: 'Tomorrow',
        time: '11:00 AM',
        phone: '9876543210',
        department: 'HAIR_TRANSPLANT'
    };
    const res = serverContext.validatePayload(validPayload);
    assert.strictEqual(res.valid, true);
});

// ---------------------------------------------------------------------
// 12. HAIR TRANSPLANT SPECIALIST -> CONSULTATION BOOKING FLOW
// ---------------------------------------------------------------------
console.log('\n📋 12. Hair Transplant -> Consultation Booking Transition Tests:');

itAsync('Hair Transplant query displays Elite Surgical Sikar, and booking button initiates consultation flow without repeating info', async () => {
    KezzaAI.resetFlow();

    // Step 1: User asks about Hair Transplant
    const infoResp = await KezzaAI.generateLocalResponse('Hair Transplant (HT)');
    assert.ok(infoResp.text.includes('Elite Surgical'));
    assert.ok(infoResp.text.includes('Sikar'));
    assert.ok(infoResp.text.includes('8130888129'));
    assert.ok(infoResp.quickReplies.includes('📅 Book Hair Transplant Consultation'));

    // Step 2: User clicks "📅 Book Hair Transplant Consultation"
    const bookResp = await KezzaAI.generateLocalResponse('📅 Book Hair Transplant Consultation');
    const flow = KezzaAI.getState().consultationFlow;

    // Must NOT repeat specialist info, must start consultation flow at NAME
    assert.ok(flow !== null, 'Consultation flow must be active');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.NAME);
    assert.ok(bookResp.text.includes('Hair Transplant consultation book karne ke liye') || bookResp.text.includes('full name'));
    assert.strictEqual(flow.data.category, 'hair');
    assert.strictEqual(flow.data.treatment, 'Hair Transplant (HT)');
    assert.strictEqual(flow.data.specialist, 'Elite Surgical');
    assert.strictEqual(flow.data.selectedClinic, 'Sikar');

    // Step 3: Provide Name -> moves to AGE
    const nameResp = await KezzaAI.generateLocalResponse('Ravi Kumar');
    assert.strictEqual(flow.data.name, 'Ravi Kumar');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.AGE);
    assert.ok(nameResp.text.includes('age kya hai') || nameResp.text.includes('What is your age'));

    // Step 4: Provide Age -> moves to PATIENT_LOCATION
    const ageResp = await KezzaAI.generateLocalResponse('28');
    assert.strictEqual(flow.data.age, 28);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PATIENT_LOCATION);
    assert.ok(ageResp.text.includes('city') || ageResp.text.includes('rehte hain'));

    // Step 5: Provide Patient Location (Delhi) -> Patient Location is Delhi, Kezza Clinic is Sikar
    const locResp = await KezzaAI.generateLocalResponse('Delhi');
    assert.strictEqual(flow.data.patientLocation, 'Delhi');
    // Since treatment is Hair Transplant (category=hair, treatment=HT, selectedClinic=Sikar), it skips clinic, category, treatment and moves to CONCERN
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.CONCERN);

    // Step 6: Provide Concern Details -> moves to PREFERRED_DATE
    const conResp = await KezzaAI.generateLocalResponse('Grade 3 baldness for 2 years');
    assert.strictEqual(flow.data.concernDetails, 'Grade 3 baldness for 2 years');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PREFERRED_DATE);

    // Step 7: Provide Preferred Date -> moves to PREFERRED_TIME
    const dateResp = await KezzaAI.generateLocalResponse('25 August 2026');
    assert.ok(flow.data.date);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.PREFERRED_TIME);

    // Step 8: Provide Preferred Time -> moves to WHATSAPP
    const timeResp = await KezzaAI.generateLocalResponse('11:30 AM');
    assert.strictEqual(flow.data.time, '11:30 AM');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.WHATSAPP);

    // Step 9: Provide WhatsApp Number -> moves to REVIEW
    const phoneResp = await KezzaAI.generateLocalResponse('9876543210');
    assert.strictEqual(flow.data.phone, '9876543210');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);

    // Verify Review Card content
    assert.ok(phoneResp.text.includes('Ravi Kumar'));
    assert.ok(phoneResp.text.includes('28'));
    assert.ok(phoneResp.text.includes('Delhi'));
    assert.ok(phoneResp.text.includes('Sikar'));
    assert.ok(phoneResp.text.includes('Hair Transplant (HT)'));
    assert.ok(phoneResp.text.includes('Elite Surgical'));
    assert.ok(phoneResp.text.includes('9876543210'));
    assert.ok(phoneResp.quickReplies.includes('✅ Confirm & Send'));
    assert.ok(phoneResp.quickReplies.includes('✏️ Edit Details'));

    // Step 10: Confirm & Send -> Submits & routes to Elite Surgical / 8130888129
    const submitResp = await KezzaAI.generateLocalResponse('✅ Confirm & Send');
    assert.ok(submitResp.text.includes('Consultation') || submitResp.text.includes('8130888129') || submitResp.text.includes('Elite Surgical'));
    assert.strictEqual(KezzaAI.getState().consultationFlow, null, 'Flow should be closed after submission');
});

itAsync('Skin consultation booking pill initiates flow with Skin pre-filled', async () => {
    KezzaAI.resetFlow();

    // User clicks "📅 Book Skin Consultation"
    const resp = await KezzaAI.generateLocalResponse('📅 Book Skin Consultation');
    const flow = KezzaAI.getState().consultationFlow;

    assert.ok(flow !== null);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.NAME);
    assert.strictEqual(flow.data.category, 'skin');
});

itAsync('Review step allows editing specific fields without losing other data', async () => {
    KezzaAI.resetFlow();
    KezzaAI.startConsultationFlow('hair', 'Hair Transplant (HT)', 'Sikar', 'Elite Surgical', 'hinglish');
    const flow = KezzaAI.getState().consultationFlow;

    // Fill all fields
    await KezzaAI.handleConsultationFlow('Ravi', 'hinglish');
    await KezzaAI.handleConsultationFlow('21', 'hinglish');
    await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    await KezzaAI.handleConsultationFlow('1-2 years', 'hinglish');
    await KezzaAI.handleConsultationFlow('Tomorrow', 'hinglish');
    await KezzaAI.handleConsultationFlow('2:00 PM', 'hinglish');
    const revResp = await KezzaAI.handleConsultationFlow('9876543210', 'hinglish');

    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);

    // User clicks "✏️ Edit Details"
    const editOpts = await KezzaAI.handleConsultationFlow('✏️ Edit Details', 'hinglish');
    assert.ok(editOpts.quickReplies.includes('👤 Name'));
    assert.ok(editOpts.quickReplies.includes('🎂 Age'));

    // User selects "🎂 Age" to edit
    const editAgePrompt = await KezzaAI.handleConsultationFlow('🎂 Age', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.AGE);
    assert.strictEqual(flow.data.age, null);

    // User enters new age 25
    const updatedResp = await KezzaAI.handleConsultationFlow('25', 'hinglish');
    assert.strictEqual(flow.data.age, 25);
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);
    assert.ok(updatedResp.text.includes('25'));
    assert.strictEqual(flow.data.name, 'Ravi'); // Name was preserved!
});

// ---------------------------------------------------------------------
// 13. EDIT DETAILS -> WHATSAPP NUMBER EDIT TESTS
// ---------------------------------------------------------------------
console.log('\n📋 13. Edit Details -> WhatsApp Editing Tests:');

itAsync('Edit Details -> WhatsApp enters EDIT_WHATSAPP, rejects invalid inputs, updates only phone, preserves all fields', async () => {
    KezzaAI.resetFlow();
    KezzaAI.startConsultationFlow('hair', 'Hair Transplant (HT)', 'Sikar', 'Elite Surgical', 'hinglish');
    const flow = KezzaAI.getState().consultationFlow;

    // Fill all initial consultation fields
    await KezzaAI.handleConsultationFlow('Ravi', 'hinglish');
    await KezzaAI.handleConsultationFlow('22', 'hinglish');
    await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    await KezzaAI.handleConsultationFlow('Less than 6 months', 'hinglish');
    await KezzaAI.handleConsultationFlow('20 August 2026', 'hinglish');
    await KezzaAI.handleConsultationFlow('10:00 AM', 'hinglish');
    await KezzaAI.handleConsultationFlow('9874937736', 'hinglish');

    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);
    assert.strictEqual(flow.data.name, 'Ravi');
    assert.strictEqual(flow.data.age, 22);
    assert.strictEqual(flow.data.patientLocation, 'Jaipur');
    assert.strictEqual(flow.data.selectedClinic, 'Sikar');
    assert.strictEqual(flow.data.treatment, 'Hair Transplant (HT)');
    assert.strictEqual(flow.data.phone, '9874937736');

    // Step 1: User clicks "✏️ Edit Details"
    const editMenu = await KezzaAI.handleConsultationFlow('✏️ Edit Details', 'hinglish');
    assert.ok(editMenu.quickReplies.includes('📱 WhatsApp'));

    // Step 2: User clicks "📱 WhatsApp"
    const waPrompt = await KezzaAI.handleConsultationFlow('📱 WhatsApp', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.EDIT_WHATSAPP);
    assert.ok(waPrompt.text.includes('Please enter your 10-digit WhatsApp number'));
    assert.strictEqual(waPrompt.quickReplies.length, 0);

    // Step 3: Test invalid inputs -> Must reject and remain in EDIT_WHATSAPP
    const invalidList = [
        { input: '123', expectMsg: 'Please enter exactly 10 digits.' },
        { input: '123456', expectMsg: 'Please enter exactly 10 digits.' },
        { input: 'abcdefghij', expectMsg: 'Only numbers are allowed.' },
        { input: '98765abc10', expectMsg: 'Only numbers are allowed.' },
        { input: '5123456789', expectMsg: 'Please enter a valid Indian mobile number starting with 6, 7, 8 or 9.' },
        { input: 'hii', expectMsg: 'Only numbers are allowed.' },
        { input: 'hello', expectMsg: 'Only numbers are allowed.' }
    ];
    for (const item of invalidList) {
        const rejResp = await KezzaAI.handleConsultationFlow(item.input, 'hinglish');
        assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.EDIT_WHATSAPP, `Must stay in EDIT_WHATSAPP on invalid input: ${item.input}`);
        assert.ok(rejResp.text.includes(item.expectMsg), `Must show specific error message "${item.expectMsg}" for: ${item.input}, got: "${rejResp.text}"`);
    }

    // Step 4: User enters valid new WhatsApp number: 9876543210
    const successResp = await KezzaAI.handleConsultationFlow('9876543210', 'hinglish');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);
    assert.ok(successResp.text.includes('WhatsApp number updated successfully'));
    assert.ok(successResp.text.includes('9876543210'));
    assert.ok(successResp.text.includes('Kaunsi detail update karni hai') || successResp.text.includes('Which detail'));
    assert.ok(successResp.quickReplies.includes('📱 WhatsApp'));
    assert.ok(successResp.quickReplies.includes('✅ Confirm & Send'));

    // Step 5: Verify ONLY WhatsApp was updated, all other fields intact
    assert.strictEqual(flow.data.phone, '9876543210');
    assert.strictEqual(flow.data.name, 'Ravi');
    assert.strictEqual(flow.data.age, 22);
    assert.strictEqual(flow.data.patientLocation, 'Jaipur');
    assert.strictEqual(flow.data.selectedClinic, 'Sikar');
    assert.strictEqual(flow.data.category, 'hair');
    assert.strictEqual(flow.data.treatment, 'Hair Transplant (HT)');
    assert.strictEqual(flow.data.specialist, 'Elite Surgical');
    assert.strictEqual(flow.data.concernDetails, 'Less than 6 months');
    assert.strictEqual(flow.data.date, '20 August 2026');
    assert.strictEqual(flow.data.time, '10:00 AM');
});

// ---------------------------------------------------------------------
// 14. 20 PRODUCTION SCENARIO VISUAL ANALYSIS & SPECIALIST MATCH TESTS (SECTION 27)
// ---------------------------------------------------------------------
console.log('\n📋 14. 20 Production Scenario Visual Analysis & Specialist Match Tests (Section 27):');

// Scenario 1: Acne photo
it('Scenario 1: Acne photo -> SKIN + Dr. Amrita/Dr. Neelam', () => {
    const res = KezzaAI.getLocalPhotoAssessment('acne pimples and breakouts on forehead and cheeks', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.strictEqual(res.recommended_consultation, 'Acne Consultation');
    assert.strictEqual(res.department_key, 'SKIN');
    assert.ok(res.specialist.includes('Dr. Amrita Makhija') || res.specialist.includes('Dr. Neelam Choudhary'));
    assert.strictEqual(res.specialist_contact, '9216063686');
    assert.ok(res.image_quality_score >= 60);
    assert.ok(res.confidence_score >= 60);

    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('📷 PHOTO ASSESSMENT'));
    assert.ok(card.includes('📍 Area:'));
    assert.ok(card.includes('Skin'));
    assert.ok(card.includes('🔎 What I can see:'));
    assert.ok(card.includes('💡 Possible Concern:'));
    assert.ok(card.includes('📊 Preliminary Confidence:'));
    assert.ok(card.includes('🩺 Recommended Consultation:'));
    assert.ok(card.includes('Acne Consultation'));
    assert.ok(card.includes('👨‍⚕️ Recommended Specialist:'));
    assert.ok(card.includes('📍 Clinic:'));
    assert.ok(card.includes('💬 Why this consultation:'));
    assert.ok(card.includes('⚠️ <strong>Important:</strong>'));
});

// Scenario 2: Acne scar photo
it('Scenario 2: Acne scar photo -> SKIN + Acne Scar Consultation', () => {
    const res = KezzaAI.getLocalPhotoAssessment('acne scars atrophic pits and depressions on cheek', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.ok(res.recommended_consultation.includes('Acne') && res.recommended_consultation.includes('Scar'));
    assert.ok(res.specialist.includes('Dr. Amrita Makhija') || res.specialist.includes('Dr. Neelam Choudhary'));
    assert.strictEqual(res.specialist_contact, '9216063686');
});

// Scenario 3: Pigmentation photo
it('Scenario 3: Pigmentation photo -> SKIN + Pigmentation Consultation', () => {
    const res = KezzaAI.getLocalPhotoAssessment('pigmentation and melasma dark patches on cheeks and forehead', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.strictEqual(res.recommended_consultation, 'Pigmentation & Melasma Consultation');
    assert.strictEqual(res.department_key, 'SKIN');
    assert.ok(res.specialist.includes('Dr. Amrita Makhija') || res.specialist.includes('Dr. Neelam Choudhary'));
    assert.strictEqual(res.specialist_contact, '9216063686');
});

// Scenario 4: Dark-circle photo
it('Scenario 4: Dark-circle photo -> SKIN + Dark Circle Consultation', () => {
    const res = KezzaAI.getLocalPhotoAssessment('dark circles under eye tear trough shadows', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.strictEqual(res.recommended_consultation, 'Dark Circle Consultation');
    assert.ok(res.specialist.includes('Dr. Amrita Makhija') || res.specialist.includes('Dr. Neelam Choudhary'));
    assert.strictEqual(res.specialist_contact, '9216063686');
});

// Scenario 5: Skin-aging photo
it('Scenario 5: Skin-aging photo -> SKIN + Anti-Aging Consultation (Jaipur)', () => {
    const res = KezzaAI.getLocalPhotoAssessment('aging wrinkles fine lines on forehead', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.strictEqual(res.recommended_consultation, 'Anti-Aging Consultation');
    assert.strictEqual(res.specialist, 'Dr. Amrita Makhija');
    assert.strictEqual(res.location, 'Jaipur');
    assert.strictEqual(res.department_key, 'ANTI_AGING');
    assert.strictEqual(res.specialist_contact, '9216063686');
});

// Scenario 6: Clear normal skin
it('Scenario 6: Clear normal skin -> NO_CLEAR_CONCERN (no false diagnosis)', () => {
    const res = KezzaAI.getLocalPhotoAssessment('clear skin healthy skin with no problem', 'english');
    assert.strictEqual(res.status, 'NO_CLEAR_CONCERN');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.ok(res.quality_message.includes('healthy') || res.quality_message.includes('clear'));
    assert.ok(!JSON.stringify(res).includes('diffuse hair thinning'));

    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('PHOTO ASSESSMENT'));
    assert.ok(!card.includes('Recommended Consultation:'));
});

// Scenario 7: Hairline photo
it('Scenario 7: Hairline photo -> Hair Transplant + Elite Surgical Sikar', () => {
    const res = KezzaAI.getLocalPhotoAssessment('hairline recession receding temples norwood bald', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'HAIR_SCALP');
    assert.strictEqual(res.recommended_consultation, 'Hair Transplant Consultation');
    assert.ok(res.specialist.includes('Elite Surgical'));
    assert.strictEqual(res.location, 'Sikar');
    assert.strictEqual(res.specialist_contact, '8130888129');
    assert.strictEqual(res.department_key, 'HAIR_TRANSPLANT_SIKAR');
});

// Scenario 8: Crown photo
it('Scenario 8: Crown photo -> Hair Loss + Dr. Ankit Bhalothia', () => {
    const res = KezzaAI.getLocalPhotoAssessment('hair loss thinning on crown area', 'hinglish');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'HAIR_SCALP');
    assert.strictEqual(res.recommended_consultation, 'Hair Loss Consultation');
    assert.strictEqual(res.specialist, 'Dr. Ankit Bhalothia');
    assert.strictEqual(res.specialist_contact, '9216063681');
    assert.strictEqual(res.location, 'Jaipur & Sikar');
});

// Scenario 9: Diffuse thinning photo
it('Scenario 9: Diffuse thinning photo -> Hair Loss + Dr. Ankit Bhalothia', () => {
    const res = KezzaAI.getLocalPhotoAssessment('diffuse thinning and hair fall across scalp parting', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'HAIR_SCALP');
    assert.strictEqual(res.recommended_consultation, 'Hair Loss Consultation');
    assert.strictEqual(res.specialist, 'Dr. Ankit Bhalothia');
    assert.strictEqual(res.specialist_contact, '9216063681');
});

// Scenario 10: Patchy scalp photo
it('Scenario 10: Patchy scalp photo -> Hair Loss + Dr. Ankit Bhalothia', () => {
    const res = KezzaAI.getLocalPhotoAssessment('patchy scalp with circular bald patch', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'HAIR_SCALP');
    assert.strictEqual(res.recommended_consultation, 'Hair Loss Consultation');
    assert.strictEqual(res.specialist, 'Dr. Ankit Bhalothia');
    assert.strictEqual(res.specialist_contact, '9216063681');
});

// Scenario 11: Section 17 Face Photo with Hair Visible in Background
it('Scenario 11: Face photo with hair visible in background -> SKIN only + hair guidance note (Section 17)', () => {
    const res = KezzaAI.getLocalPhotoAssessment('face and cheek photo with acne and hair visible in background where scalp not assessable', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.ok(!res.recommended_consultation.toLowerCase().includes('hair loss'));
    assert.ok(res.hair_guidance_note !== undefined);
    assert.ok(res.hair_guidance_note.includes('Hair/scalp assessment is not possible from this angle'));

    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('Skin'));
    assert.ok(card.includes('Note on Hair:'));
    assert.ok(card.includes('Hair/scalp assessment is not possible from this angle'));
});

// Scenario 12: Blurry photo (quality < 60)
it('Scenario 12: Blurry photo (quality < 60) -> QUALITY_ISSUE rejection', () => {
    const res = KezzaAI.getLocalPhotoAssessment('blurry photo out of focus', 'english');
    assert.strictEqual(res.status, 'QUALITY_ISSUE');
    assert.strictEqual(res.image_quality, 'POOR');
    assert.ok(res.image_quality_score < 60);
    assert.ok(res.instructions.length >= 4);

    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('PHOTO QUALITY CHECK'));
    assert.ok(!card.includes('Recommended Consultation:'));
});

// Scenario 13: Dark photo (quality < 60)
it('Scenario 13: Dark photo (quality < 60) -> QUALITY_ISSUE rejection', () => {
    const res = KezzaAI.getLocalPhotoAssessment('too dark photo underexposed low light', 'english');
    assert.strictEqual(res.status, 'QUALITY_ISSUE');
    assert.strictEqual(res.image_quality, 'POOR');
    assert.ok(res.image_quality_score < 60);
});

// Scenario 14: Filtered photo (quality < 60)
it('Scenario 14: Filtered photo (quality < 60) -> QUALITY_ISSUE rejection', () => {
    const res = KezzaAI.getLocalPhotoAssessment('heavily filtered photo with beauty filter', 'english');
    assert.strictEqual(res.status, 'QUALITY_ISSUE');
    assert.strictEqual(res.image_quality, 'POOR');
    assert.ok(res.image_quality_score < 60);
});

// Scenario 15: Random non-medical image -> OTHER rejection
it('Scenario 15: Random non-medical image -> OTHER rejection', () => {
    const res = KezzaAI.getLocalPhotoAssessment('non_human dog sitting in car', 'english');
    assert.strictEqual(res.status, 'QUALITY_ISSUE');
    assert.strictEqual(res.body_area, 'OTHER');
    assert.ok(res.quality_message.includes("can't reliably identify a human skin or hair concern"));
});

// Scenario 16: Multiple hair photos combined
it('Scenario 16: Multiple hair photos combined -> Multi-photo unified assessment', () => {
    const res = KezzaAI.getLocalPhotoAssessment('hairline recession norwood and crown hair loss thinning', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'HAIR_SCALP');
    assert.ok(res.image_quality_score >= 60);
    assert.ok(res.confidence_score >= 60);
});

// Scenario 17: Multiple skin photos combined
it('Scenario 17: Multiple skin photos combined -> Multi-photo unified assessment', () => {
    const res = KezzaAI.getLocalPhotoAssessment('acne pimples on forehead and acne scars on cheek', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'SKIN');
    assert.ok(res.recommended_consultation.includes('Acne'));
});

// Scenario 18: Hindi query & output
it('Scenario 18: Hindi query & output card verification', () => {
    const res = KezzaAI.getLocalPhotoAssessment('acne pimples on face', 'hindi');
    const card = KezzaAI.renderPhotoAnalysisCard(res, 'hindi');
    assert.ok(card.includes('PHOTO ASSESSMENT'));
    assert.ok(card.includes('Acne Consultation'));
    assert.ok(card.includes('⚠️ <strong>Important:</strong>'));
});

// Scenario 19: Hinglish query & output
it('Scenario 19: Hinglish query & output card verification', () => {
    const res = KezzaAI.getLocalPhotoAssessment('hair loss baal jhad rahe hain crown me', 'hinglish');
    const card = KezzaAI.renderPhotoAnalysisCard(res, 'hinglish');
    assert.ok(card.includes('PHOTO ASSESSMENT'));
    assert.ok(card.includes('Hair Loss Consultation'));
    assert.ok(card.includes('Dr. Ankit Bhalothia'));
});

// Scenario 20: English query & output
it('Scenario 20: English query & output card verification', () => {
    const res = KezzaAI.getLocalPhotoAssessment('dark circles under eyes', 'english');
    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('PHOTO ASSESSMENT'));
    assert.ok(card.includes('Dark Circle Consultation'));
    assert.ok(card.includes('💬 Why this consultation:'));
    assert.ok(card.includes('⚠️ <strong>Important:</strong>'));
    assert.ok(!card.includes('You definitely have'));
    assert.ok(!card.includes('This confirms'));
    assert.ok(!card.includes('You are diagnosed with'));
    assert.ok(!card.includes('Guaranteed permanent cure'));
});

// Scenario 21: Weight-loss full body photo
it('Scenario 21: Weight-loss full body photo -> WEIGHT_LOSS + Wellness Team', () => {
    const res = KezzaAI.getLocalPhotoAssessment('full body photo for weight loss and body contouring', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'WEIGHT_LOSS');
    assert.strictEqual(res.recommended_consultation, 'Weight Management Consultation');
    assert.ok(res.specialist.includes('Kezza Wellness'));
    assert.strictEqual(res.specialist_contact, '9216063686');

    const card = KezzaAI.renderPhotoAnalysisCard(res, 'english');
    assert.ok(card.includes('Weight Management Consultation'));
    assert.ok(card.includes('👉 Next Step'));
    assert.ok(card.includes('Open WhatsApp'));
});

// Scenario 22: PMU eyebrow fading / touch-up photo
it('Scenario 22: PMU eyebrow photo -> PMU + Dr. Krishna Choudhary', () => {
    const res = KezzaAI.getLocalPhotoAssessment('eyebrow permanent makeup with fading pmu and touch up required', 'english');
    assert.strictEqual(res.status, 'OK');
    assert.strictEqual(res.body_area, 'PMU');
    assert.strictEqual(res.recommended_consultation, 'PMU / Microblading Consultation');
    assert.strictEqual(res.specialist, 'Dr. Krishna Choudhary');
    assert.strictEqual(res.specialist_contact, '9079161300');
});

itAsync('Photo Analysis seamlessly integrates into Consultation Booking Flow with pre-filled context', async () => {
    KezzaAI.resetFlow();
    
    // Simulate photo analysis completion with Acne Scars
    const photoAssessment = KezzaAI.getLocalPhotoAssessment('acne scars on cheek', 'hinglish');
    KezzaAI.setState({ lastPhotoAnalysis: photoAssessment });

    // User clicks "📅 Book Consultation"
    const bookingResp = await KezzaAI.generateLocalResponse('📅 Book Consultation');
    const flow = KezzaAI.getState().consultationFlow;

    assert.ok(flow !== null, 'Consultation flow should be started');
    assert.strictEqual(flow.data.category, 'skin');
    assert.strictEqual(flow.data.treatment, 'Acne / Acne Scar Consultation');
    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.NAME);
    assert.ok(bookingResp.text.toLowerCase().includes('name') || bookingResp.text.toLowerCase().includes('naam'));

    // Progress through flow to check final payload integrity
    await KezzaAI.handleConsultationFlow('Aman Sharma', 'hinglish');
    await KezzaAI.handleConsultationFlow('24', 'hinglish');
    await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    await KezzaAI.handleConsultationFlow('Jaipur', 'hinglish');
    await KezzaAI.handleConsultationFlow('Acne scars since 2 years', 'hinglish');
    await KezzaAI.handleConsultationFlow('22 August 2026', 'hinglish');
    await KezzaAI.handleConsultationFlow('11:00 AM', 'hinglish');
    await KezzaAI.handleConsultationFlow('9876543210', 'hinglish');

    assert.strictEqual(flow.state, KezzaAI.CONSULTATION_STATES.REVIEW);
    assert.strictEqual(flow.data.name, 'Aman Sharma');
    assert.strictEqual(flow.data.age, 24);
    assert.strictEqual(flow.data.phone, '9876543210');
    assert.strictEqual(flow.data.category, 'skin');
});

// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
asyncQueue.then(() => {
    console.log(`\n============================================`);
    console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
    console.log(`============================================\n`);
    if (passed !== total) process.exit(1);
});

