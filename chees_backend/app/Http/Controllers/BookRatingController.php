<?php

namespace App\Http\Controllers;

use App\Models\BookRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookRatingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Book $book)
    {
        $ratings = $book->ratings()->with('user')->latest()->paginate(10);
        return response()->json($ratings);
    }

    public function store(Request $request, Book $book)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'review' => 'nullable|string|max:1000'
        ]);

        // Check if user already rated this book
        if ($book->ratings()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'You have already rated this book'], 422);
        }

        $rating = $book->ratings()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null
        ]);

        return response()->json($rating->load('user'), 201);
    }

    public function update(Request $request, BookRating $rating)
    {
        $this->authorize('update', $rating);

        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'review' => 'nullable|string|max:1000'
        ]);

        $rating->update($validated);
        return response()->json($rating->load('user'));
    }

    public function destroy(BookRating $rating)
    {
        $this->authorize('delete', $rating);
        
        $rating->delete();
        return response()->json(null, 204);
    }
}