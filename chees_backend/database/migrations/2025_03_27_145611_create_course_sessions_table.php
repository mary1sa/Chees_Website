<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coach_id')->constrained();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->string('zoom_link', 255)->nullable();
            $table->string('meeting_id', 100)->nullable();
            $table->string('meeting_password', 100)->nullable();
            $table->integer('max_participants');
            $table->boolean('is_recorded')->default(false);
            $table->string('recording_url', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_sessions');
    }
};
