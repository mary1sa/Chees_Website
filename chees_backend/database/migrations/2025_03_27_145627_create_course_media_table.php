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
        Schema::create('media', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('file_name', 255);
            $table->string('file_path', 255);
            $table->string('file_type', 50);
            $table->string('mime_type', 100);
            $table->integer('file_size'); // in KB
            $table->string('dimensions', 50)->nullable(); // for images, e.g. "1920x1080"
            $table->string('alt_text', 255)->nullable();
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
