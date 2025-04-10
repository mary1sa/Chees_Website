<?php

namespace App\Http\Controllers;

use App\Models\CoachSpecializationCategory;
use Illuminate\Http\Request;

class CoachSpecializationCategoryController extends Controller
{
    public function index()
    {
        return response()->json(CoachSpecializationCategory::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:coach_specialization_categories',
            'description' => 'nullable|string',
        ]);

        $specialization = CoachSpecializationCategory::create($request->only(['name', 'description']));
        return response()->json($specialization, 201);
    }

    public function show($id)
    {
        $specialization = CoachSpecializationCategory::findOrFail($id);
        return response()->json($specialization, 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|unique:coach_specialization_categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $specialization = CoachSpecializationCategory::findOrFail($id);
        $specialization->update($request->only(['name', 'description']));
        return response()->json($specialization, 200);
    }

    public function destroy($id)
    {
        $specialization = CoachSpecializationCategory::findOrFail($id);
        $specialization->delete();
        return response()->json(['message' => 'Specialization category deleted successfully'], 200);
    }
}
