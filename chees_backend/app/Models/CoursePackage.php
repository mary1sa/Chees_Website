<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CoursePackage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'discount_percentage',
        'is_active',
        'duration_days',
        'thumbnail',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'float',
        'discount_percentage' => 'float',
        'is_active' => 'boolean',
        'duration_days' => 'integer',
    ];

    /**
     * Get the courses included in this package.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_package_items')
                    ->withPivot('order')
                    ->orderBy('course_package_items.order');
    }

    /**
     * Get the users who have purchased this package.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_course_packages')
                    ->withPivot('purchase_date', 'expiry_date', 'status', 'payment_id')
                    ->withTimestamps();
    }

    /**
     * Calculate the total original price of all courses in the package.
     */
    public function getOriginalPriceAttribute()
    {
        return $this->courses()->sum('price');
    }

    /**
     * Calculate the savings amount based on the discount.
     */
    public function getSavingsAttribute()
    {
        $originalPrice = $this->getOriginalPriceAttribute();
        return $originalPrice - $this->price;
    }

    /**
     * Calculate the savings percentage.
     */
    public function getSavingsPercentageAttribute()
    {
        $originalPrice = $this->getOriginalPriceAttribute();
        if ($originalPrice == 0) return 0;
        
        return round(($this->getSavingsAttribute() / $originalPrice) * 100, 2);
    }

    /**
     * Scope a query to only include active packages.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
