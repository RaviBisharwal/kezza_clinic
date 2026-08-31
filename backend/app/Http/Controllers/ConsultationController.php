<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ConsultationController extends Controller
{
    // Department phone number lookup table
    private array $departmentPhones = [
        'HAIR_LOSS'       => '919216063681',
        'HAIR_TRANSPLANT' => '918130888129',
        'SKIN'            => '919216063686',
        'ANTI_AGING'      => '919216063686',
        'PMU'             => '919079161300',
        'SMP'             => '919079161300',
        'WEIGHT_LOSS'     => '919057546221',
        'ENT_RHINOPLASTY' => '919284517427',
    ];

    private array $departmentLabels = [
        'HAIR_LOSS'       => 'Hair Loss Team (Dr. Ankit Bhalothia)',
        'HAIR_TRANSPLANT' => 'Hair Transplant — Elite Surgical, Sikar',
        'SKIN'            => 'Skin Team (Dr. Amrita Makhija / Dr. Neelam Choudhary)',
        'ANTI_AGING'      => 'Skin Team (Dr. Amrita Makhija / Dr. Neelam Choudhary)',
        'PMU'             => 'PMU Team (Dr. Krishna Choudhary)',
        'SMP'             => 'SMP Team (Kezza SMP)',
        'WEIGHT_LOSS'     => 'Weight Loss Team',
        'ENT_RHINOPLASTY' => 'ENT & Rhinoplasty (Dr. Mandhata Sharma)',
    ];

    /**
     * Store a new consultation booking.
     * POST /api/consultation
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (empty($input['name']) && !empty($input['full_name'])) {
            $input['name'] = $input['full_name'];
        }
        if (empty($input['phone']) && !empty($input['mobile_number'])) {
            $input['phone'] = $input['mobile_number'];
        }
        if (empty($input['patientCity']) && !empty($input['patient_city'])) {
            $input['patientCity'] = $input['patient_city'];
        }
        if (empty($input['selectedClinic']) && !empty($input['clinic_location'])) {
            $input['selectedClinic'] = $input['clinic_location'];
        }
        if (empty($input['concernDetails']) && !empty($input['concern'])) {
            $input['concernDetails'] = $input['concern'];
        }
        if (empty($input['date']) && !empty($input['preferred_date'])) {
            $input['date'] = $input['preferred_date'];
        }
        if (empty($input['time']) && !empty($input['preferred_time'])) {
            $input['time'] = $input['preferred_time'];
        }

        $validator = Validator::make($input, [
            'name'           => 'required|string|min:2|max:100',
            'phone'          => 'required|string|min:7|max:20',
            'age'            => 'nullable|integer|min:1|max:120',
            'email'          => 'nullable|email|max:150',
            'patientCity'    => 'nullable|string|max:100',
            'selectedClinic' => 'nullable|string|max:100',
            'category'       => 'nullable|string|max:50',
            'treatment'      => 'nullable|string|max:200',
            'concernDetails' => 'nullable|string|max:1000',
            'date'           => 'nullable|string|max:50',
            'time'           => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Generate unique consultation ID
        $consultationId = 'KEZZA-' . date('Y') . '-' . random_int(100000, 999999);

        $category      = strtoupper($request->input('category', 'HAIR_LOSS'));
        $deptPhone     = $this->departmentPhones[$category] ?? $this->departmentPhones['HAIR_LOSS'];
        $deptLabel     = $this->departmentLabels[$category] ?? 'Kezza Team';
        $clinicCity    = stripos($request->input('selectedClinic', ''), 'sikar') !== false ? 'Sikar' : 'Jaipur';

        $consultation = Consultation::create([
            'consultation_id'  => $consultationId,
            'full_name'        => $request->input('name'),
            'email'            => $request->input('email'),
            'phone'            => $request->input('phone'),
            'age'              => $request->input('age'),
            'patient_city'     => $request->input('patientCity'),
            'clinic_location'  => $clinicCity,
            'category'         => $category,
            'treatment'        => $request->input('treatment'),
            'concern'          => $request->input('concernDetails'),
            'preferred_date'   => $request->input('date'),
            'preferred_time'   => $request->input('time'),
            'department_key'   => $category,
            'specialist'       => $deptLabel,
            'whatsapp_number'  => $deptPhone,
            'status'           => 'NEW',
            'source'           => 'WEBSITE_FORM',
            'ip_address'       => $request->ip(),
        ]);

        return response()->json([
            'status'          => 'success',
            'message'         => 'Consultation booked successfully!',
            'consultationId'  => $consultationId,
            'department'      => $deptLabel,
            'whatsappNumber'  => $deptPhone,
        ], 201);
    }

    /**
     * List all consultations (admin).
     * GET /api/consultations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Consultation::latest();

        // Optional filters
        if ($request->has('status')) {
            $query->where('status', strtoupper($request->input('status')));
        }
        if ($request->has('category')) {
            $query->where('category', strtoupper($request->input('category')));
        }

        $consultations = $query->get();

        return response()->json([
            'status' => 'success',
            'count'  => $consultations->count(),
            'data'   => $consultations,
        ]);
    }

    /**
     * Show single consultation.
     * GET /api/consultations/{id}
     */
    public function show(Consultation $consultation): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $consultation,
        ]);
    }

    /**
     * Update consultation status.
     * PUT /api/consultations/{id}
     */
    public function update(Request $request, Consultation $consultation): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:NEW,CONTACTED,CONFIRMED,DONE,CANCELLED',
            'notes'  => 'nullable|string|max:1000',
        ]);

        $consultation->update([
            'status' => $request->input('status'),
            'notes'  => $request->input('notes', $consultation->notes),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Consultation updated.',
            'data'    => $consultation,
        ]);
    }
}
