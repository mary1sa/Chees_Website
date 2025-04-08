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
        Schema::create('enrollment_course', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('progress')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Each course can only be in an enrollment once
            $table->unique(['enrollment_id', 'course_id']);
        });
        
        // Update the enrollments table to remove course_id and progress
        Schema::table('enrollments', function (Blueprint $table) {
            // Make these changes carefully in production - back up data first!
            // $table->dropColumn('course_id');
            // $table->dropColumn('progress');
            
            // Instead of directly dropping columns, you might want to:
            // 1. Keep the columns for now
            // 2. Migrate existing data to the new structure
            // 3. Drop the columns in a separate migration after data migration
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_course');
    }
};
