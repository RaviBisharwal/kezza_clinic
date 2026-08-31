<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->string('consultation_id')->unique(); // KEZZA-2026-XXXXXX
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone', 20);
            $table->integer('age')->nullable();
            $table->string('patient_city')->nullable();
            $table->string('clinic_location')->nullable();  // Jaipur | Sikar
            $table->string('category');                      // HAIR_LOSS | SKIN | etc.
            $table->string('treatment')->nullable();
            $table->text('concern')->nullable();
            $table->string('preferred_date')->nullable();
            $table->string('preferred_time')->nullable();
            $table->string('department_key')->nullable();
            $table->string('specialist')->nullable();
            $table->string('whatsapp_number', 20)->nullable();
            $table->string('status', 20)->default('NEW');   // NEW | CONTACTED | DONE
            $table->string('source', 50)->default('WEBSITE_FORM');
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
