<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('session_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('file_path', 255)->nullable();
            $table->string('file_type', 50)->nullable();
            $table->boolean('is_downloadable')->default(true);
            $table->integer('order_number')->default(0);
            $table->timestamps();
        });

        // Add foreign keys separately after table creation
        Schema::table('course_materials', function (Blueprint $table) {
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')
                  ->onDelete('cascade');
                  
            $table->foreign('session_id')
                  ->references('id')
                  ->on('course_sessions')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('course_materials', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropForeign(['session_id']);
        });
        
        Schema::dropIfExists('course_materials');
    }
};