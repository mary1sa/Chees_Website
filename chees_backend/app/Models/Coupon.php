<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'description',
        'min_purchase',
        'max_discount',
        'applies_to',
        'entity_id',
        'uses_limit',
        'uses_count',
        'per_user_limit',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'uses_limit' => 'integer',
        'uses_count' => 'integer',
        'per_user_limit' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];
    
    // Check if coupon is valid
    public function isValid()
    {
        $now = now();
        return $this->is_active &&
               ($this->start_date === null || $this->start_date <= $now) &&
               ($this->end_date === null || $this->end_date >= $now) &&
               ($this->uses_limit === null || $this->uses_count < $this->uses_limit);
    }
}
