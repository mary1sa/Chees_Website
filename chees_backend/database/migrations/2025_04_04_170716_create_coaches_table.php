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
        Schema::create('coaches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();
            
            $table->string('title', 50)->nullable();
            $table->string('fide_id', 50)->nullable();
            $table->string('national_title', 50)->nullable();
            $table->string('certification_level', 100)->nullable();
            
            $table->integer('rating')->default(1200);
            $table->integer('peak_rating')->nullable();
            $table->integer('years_teaching_experience')->default(0);
            
            $table->foreignId('primary_specialization_id')->nullable()
                  ->constrained('coach_specialization_categories')->onDelete('set null');
            $table->foreignId('secondary_specialization_id')->nullable()
                  ->constrained('coach_specialization_categories')->onDelete('set null');
            
            $table->decimal('hourly_rate', 10, 2);
            $table->json('preferred_languages')->nullable();
            $table->json('teaching_formats')->nullable();
            $table->json('communication_methods')->nullable();
            
            $table->text('professional_bio');
            $table->string('video_introduction_url', 255)->nullable();
            $table->json('social_media_links')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coaches');
    }
};
