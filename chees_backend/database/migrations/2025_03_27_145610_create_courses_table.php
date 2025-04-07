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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->foreignId('level_id')->constrained('course_levels');
            $table->text('description');
            $table->string('thumbnail', 255)->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('duration'); // in minutes
            $table->integer('max_students')->nullable();
            $table->boolean('is_online')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
