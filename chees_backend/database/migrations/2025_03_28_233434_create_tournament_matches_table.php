<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('round_id')->constrained('tournament_rounds')->onDelete('cascade');
            $table->foreignId('white_player_id')->constrained('users');
            $table->foreignId('black_player_id')->constrained('users');
            $table->enum('result', ['1-0', '0-1', '1/2-1/2', '*'])->nullable();
            $table->dateTime('start_datetime')->nullable();
            $table->dateTime('end_datetime')->nullable();
            $table->text('pgn')->nullable();
            $table->integer('table_number')->nullable();
            $table->enum('status', ['scheduled', 'in-progress', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();  
        });
    }

    public function down()
    {
        Schema::dropIfExists('tournament_matches');
    }
};
