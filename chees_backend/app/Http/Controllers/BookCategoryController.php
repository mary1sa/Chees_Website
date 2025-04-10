<?php

namespace App\Http\Controllers;

use App\Models\BookCategory;
use Illuminate\Http\Request;

class BookCategoryController extends Controller
{
    public function index()
    {
        $categories = BookCategory::with('parent', 'children')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:book_categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:book_categories,id'
        ]);

        $category = BookCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show(BookCategory $bookCategory)
    {
        return response()->json($bookCategory->load('parent', 'children', 'books'));
    }

    public function update(Request $request, BookCategory $bookCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:book_categories,name,'.$bookCategory->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:book_categories,id'
        ]);

        $bookCategory->update($validated);
        return response()->json($bookCategory);
    }

    public function destroy(BookCategory $bookCategory)
    {
        // Prevent deletion if category has books or is a parent category
        if ($bookCategory->books()->exists() || $bookCategory->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with books or subcategories'], 422);
        }

        $bookCategory->delete();
        return response()->json(null, 204);
    }
}