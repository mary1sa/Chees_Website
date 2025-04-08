<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseMedia extends Model
{
    use HasFactory;

    protected $table = 'media'; // Explicitly set table name since "media" is both singular and plural

    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'dimensions',
        'alt_text',
        'title',
        'description',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Get full URL
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
