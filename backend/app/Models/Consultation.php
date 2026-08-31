<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'consultation_id',
        'full_name',
        'email',
        'phone',
        'age',
        'patient_city',
        'clinic_location',
        'category',
        'treatment',
        'concern',
        'preferred_date',
        'preferred_time',
        'department_key',
        'specialist',
        'whatsapp_number',
        'status',
        'source',
        'notes',
        'ip_address',
    ];
}
