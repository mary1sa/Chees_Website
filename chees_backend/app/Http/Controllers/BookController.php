<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Author;
use App\Models\BookCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with(['author', 'category'])->filter()->paginate(10);
        return response()->json($books);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:book_categories,id',
            'author_id' => 'required|exists:authors,id',
            'isbn' => 'nullable|string|max:20|unique:books',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'pages' => 'nullable|integer|min:1',
            'publisher' => 'nullable|string|max:100',
            'publication_date' => 'nullable|date',
            'language' => 'nullable|string|max:50',
            'format' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:50',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $book = Book::create($validated);
        return response()->json($book->load(['author', 'category']), 201);
    }

    public function show(Book $book)
    {
        return response()->json($book->load(['author', 'category', 'ratings.user']));
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:book_categories,id',
            'author_id' => 'required|exists:authors,id',
            'isbn' => 'nullable|string|max:20|unique:books,isbn,'.$book->id,
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'pages' => 'nullable|integer|min:1',
            'publisher' => 'nullable|string|max:100',
            'publication_date' => 'nullable|date',
            'language' => 'nullable|string|max:50',
            'format' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:50',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('cover_image')) {
            // Delete old cover if exists
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $book->update($validated);
        return response()->json($book->load(['author', 'category']));
    }

    public function destroy(Book $book)
    {
        if ($book->cover_image) {
            Storage::disk('public')->delete($book->cover_image);
        }

        $book->delete();
        return response()->json(null, 204);
    }

    public function getFilters()
    {
        return response()->json([
            'categories' => BookCategory::all(),
            'authors' => Author::all()
        ]);
    }
}