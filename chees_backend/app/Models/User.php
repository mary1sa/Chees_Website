<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Order;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id', 'username', 'email', 'password',
        'first_name', 'last_name', 'profile_picture',
        'chess_rating', 'bio', 'phone', 'date_of_birth',
        'address', 'is_active', 'email_verified_at', 'remember_token',"city"
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }


    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }
    
    /**
     * Check if user is a coach
     */
    public function isCoach()
    {
        return $this->hasRole('coach');
    }
    
    /**
     * Get courses coached by this user
     */
    public function coachedCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'coach_id');
    }
    
    /**
     * Get all course sessions coached by this user
     */
    public function coachedSessions(): HasMany
    {
        return $this->hasMany(CourseSession::class, 'coach_id');
    }
    
    /**
     * Get course progress records for this user
     */
    public function courseProgress(): HasMany
    {
        return $this->hasMany(CourseProgress::class);
    }
    
    /**
     * Get course packages purchased by this user
     */
    public function coursePackages(): BelongsToMany
    {
        return $this->belongsToMany(CoursePackage::class, 'user_course_packages')
                    ->withPivot('purchase_date', 'expiry_date', 'status', 'payment_id')
                    ->withTimestamps();
    }
    
    /**
     * Get only active course packages for this user
     */
    public function activePackages()
    {
        return $this->coursePackages()
                    ->wherePivot('status', 'active')
                    ->wherePivot('expiry_date', '>', now())
                    ->orWherePivot('expiry_date', null);
    }
    
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
