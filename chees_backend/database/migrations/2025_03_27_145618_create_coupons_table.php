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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50);
            $table->string('type', 50); 
            $table->decimal('value', 10, 2);
            $table->text('description')->nullable();
            $table->decimal('min_purchase',10,2)->default(0.00);
            $table->decimal('max_discount',10,2)->nullable();
            $table->string('applies_to', 50)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->integer('uses_limit')->nullable();
            $table->integer('uses_count')->default(0);
            $table->integer('per_user_limit')->default(1);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
