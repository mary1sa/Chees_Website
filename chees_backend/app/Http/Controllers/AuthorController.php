<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AuthorController extends Controller
{
    public function index()
    {
        $authors = Author::withCount('books')->with('books')->get();
        return response()->json($authors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('authors', 'public');
        }

        $author = Author::create($validated);
        return response()->json($author, 201);
    }

    public function show(Author $author)
    {
        return response()->json($author->load('books'));
    }

    public function update(Request $request, Author $author)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($author->photo) {
                Storage::disk('public')->delete($author->photo);
            }
            $validated['photo'] = $request->file('photo')->store('authors', 'public');
        }

        $author->update($validated);
        return response()->json($author);
    }

    public function destroy(Author $author)
    {
        try {
            // First, disassociate all books from this author
            $author->books()->update(['author_id' => null]);
            
            // Then delete the author's photo if exists
            if ($author->photo) {
                Storage::disk('public')->delete($author->photo);
            }
            
            // Finally delete the author
            $author->delete();
            
            return response()->json([
                'message' => 'Author deleted successfully. Associated books were preserved.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting author',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}