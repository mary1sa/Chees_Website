<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'item_type',
        'item_id',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Polymorphic relationship with the wishlist item
    public function item()
    {
        return $this->morphTo();
    }
    
    // Specific relationship for course items
    public function course()
    {
        if ($this->item_type === 'course') {
            return $this->belongsTo(Course::class, 'item_id');
        }
        return null;
    }
    
    // Specific relationship for book items
    public function book()
    {
        return $this->belongsTo(Book::class, 'item_id')->where('item_type', 'book');
    }
    
    // Specific relationship for event items
    public function event()
    {
        return $this->belongsTo(Event::class, 'item_id')->where('item_type', 'event');
    }
}

