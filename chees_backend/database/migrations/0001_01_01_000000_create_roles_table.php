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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });


        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'admin', 'description' => 'Administrator of the system'],
            ['id' => 2, 'name' => 'coach', 'description' => 'Coach with special privileges'],
            ['id' => 3, 'name' => 'member', 'description' => 'Regular member (default role)'],

        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
