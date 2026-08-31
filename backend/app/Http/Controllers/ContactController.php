<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Store a new contact form submission.
     * POST /api/contact
     */
    public function store(Request $request): JsonResponse
    {
        // Validate incoming data
        $validator = Validator::make($request->all(), [
            'fullName'  => 'required|string|min:2|max:100',
            'email'     => 'required|email|max:150',
            'phone'     => 'required|string|min:7|max:20',
            'message'   => 'required|string|min:5|max:2000',
            'service'   => 'nullable|string|max:100',
            'subject'   => 'nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Save to database
        $contact = Contact::create([
            'full_name'  => $request->input('fullName'),
            'email'      => $request->input('email'),
            'phone'      => $request->input('phone'),
            'service'    => $request->input('service'),
            'subject'    => $request->input('subject'),
            'message'    => $request->input('message'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Thank you! Your message has been received. We will contact you within 1-2 hours.',
            'id'      => $contact->id,
        ], 201);
    }

    /**
     * List all contacts (admin use — protect this with middleware in production).
     * GET /api/contacts
     */
    public function index(): JsonResponse
    {
        $contacts = Contact::latest()->get();

        return response()->json([
            'status' => 'success',
            'data'   => $contacts,
        ]);
    }

    /**
     * Show single contact.
     * GET /api/contacts/{id}
     */
    public function show(Contact $contact): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $contact,
        ]);
    }

    /**
     * Update contact status (e.g., mark as replied).
     * PUT /api/contacts/{id}
     */
    public function update(Request $request, Contact $contact): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:new,read,replied',
        ]);

        $contact->update(['status' => $request->input('status')]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Contact updated.',
            'data'    => $contact,
        ]);
    }
}
