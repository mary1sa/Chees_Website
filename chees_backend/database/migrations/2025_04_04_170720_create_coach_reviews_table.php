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
        Schema::create('coach_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            
            $table->tinyInteger('rating');
            $table->text('review_text')->nullable();
            
            $table->tinyInteger('teaching_clarity_rating')->nullable();
            $table->tinyInteger('communication_rating')->nullable();
            $table->tinyInteger('knowledge_depth_rating')->nullable();
            
            
            $table->timestamps();
            
            $table->unique(['coach_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_reviews');
    }
};
