<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachSpecializationCategory extends Model
{

    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active'];
    
    public function primaryCoaches()
    {
        return $this->hasMany(Coach::class, 'primary_specialization_id');
    }
    
    public function secondaryCoaches()
    {
        return $this->hasMany(Coach::class, 'secondary_specialization_id');
    }
}
