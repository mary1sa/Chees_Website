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
        Schema::create('coach_performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained()->onDelete('cascade')->unique();
            
            $table->integer('total_students_coached')->default(0);
            $table->integer('active_students')->default(0);
            $table->integer('total_courses_conducted')->default(0);
            $table->integer('successful_course_completions')->default(0);
            
            $table->decimal('average_student_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('average_hourly_earnings', 10, 2)->default(0);
            
            $table->decimal('student_growth_rate', 5, 2)->default(0);
            $table->decimal('revenue_growth_rate', 5, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_performance_metrics');
    }
};
