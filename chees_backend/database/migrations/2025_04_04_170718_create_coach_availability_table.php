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
        Schema::create('coach_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            
            $table->enum('availability_type', [
                'regular', 
                'special', 
                'blocked', 
                'holiday', 
                'limited'
            ])->default('regular');
            
            $table->integer('max_students')->default(1);
            $table->integer('current_bookings')->default(0);
            $table->string('location', 100)->nullable();
            $table->text('booking_notes')->nullable();
            $table->boolean('is_bookable')->default(true);
            
            $table->timestamps();
            
            $table->unique(['coach_id', 'date', 'start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_availability');
    }
};
