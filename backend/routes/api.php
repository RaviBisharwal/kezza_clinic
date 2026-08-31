<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConsultationController;

/*
|--------------------------------------------------------------------------
| Kezza Clinic — API Routes
|--------------------------------------------------------------------------
|
| Frontend (HTML/CSS/JS) se yeh endpoints call honge.
| Base URL: http://localhost:8000/api/
|
*/

// ── Health Check ─────────────────────────────────────────────────────────────
Route::get('/health', function () {
    return response()->json([
        'status'  => 'ok',
        'service' => 'Kezza Clinic Laravel API',
        'version' => '1.0.0',
        'time'    => now()->toDateTimeString(),
    ]);
});

// ── Contact Form ──────────────────────────────────────────────────────────────
// POST   /api/contact        → Submit contact form (public)
// GET    /api/contacts       → List all contacts (admin)
// GET    /api/contacts/{id}  → Show single contact (admin)
// PUT    /api/contacts/{id}  → Update status (admin)
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/contacts', [ContactController::class, 'index']);
Route::get('/contacts/{contact}', [ContactController::class, 'show']);
Route::put('/contacts/{contact}', [ContactController::class, 'update']);

// ── Consultation Booking ──────────────────────────────────────────────────────
// POST   /api/consultation         → Book consultation (public)
// GET    /api/consultations        → List all (admin) ?status=NEW&category=SKIN
// GET    /api/consultations/{id}   → Show single (admin)
// PUT    /api/consultations/{id}   → Update status/notes (admin)
Route::post('/consultation', [ConsultationController::class, 'store']);
Route::post('/consultations', [ConsultationController::class, 'store']);
Route::get('/consultations', [ConsultationController::class, 'index']);
Route::get('/consultations/{consultation}', [ConsultationController::class, 'show']);
Route::put('/consultations/{consultation}', [ConsultationController::class, 'update']);
