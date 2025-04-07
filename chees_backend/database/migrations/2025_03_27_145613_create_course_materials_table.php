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
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('course_sessions')->nullOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('file_path', 255)->nullable();
            $table->string('file_type', 50)->nullable(); // pdf, video, image, etc.
            $table->boolean('is_downloadable')->default(true);
            $table->integer('order_number')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};
