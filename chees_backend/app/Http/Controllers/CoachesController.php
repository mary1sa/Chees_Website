<?php

namespace App\Http\Controllers;

use App\Models\Coach;
use Illuminate\Http\Request;

class CoachesController extends Controller
{
    public function adminIndex()
    {
        $coaches = Coach::with('user') 
                        ->orderBy('created_at', 'desc')
                        ->get();
    
        return response()->json($coaches);
    }



  

    // Admin: Get approved coaches
    public function indexApprovedRejected()
    {
        $coaches = Coach::with('user')->whereIn('status', ['approved', 'rejected'])->get();
    
        return response()->json($coaches);
    }
    public function getCoachByUser($user_id)
{
    $coach = Coach::where('user_id', $user_id)->first();

    if (!$coach) {
        return response()->json(['message' => 'Coach not found'], 404);
    }

    return response()->json($coach);
}

    // Admin & Coach: List all coaches
    public function index()
    {
        return response()->json(Coach::all());
    }

    // Admin & Coach: Show specific coach profile if approved
    public function show($id)
    {
        $coach = Coach::findOrFail($id);
    
        return response()->json($coach);
    }
    

    // Admin: List coaches with pending status
    public function pendingCoaches()
    {
        $pendingCoaches = Coach::with('user')
        ->where('status', 'pending')->get();

        return response()->json([
            'message' => 'Pending coaches retrieved successfully.',
            'data' => $pendingCoaches,
        ]);
    }

    // Admin & Coach
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:coaches,user_id',
            'title' => 'nullable|string|max:50',
            'fide_id' => 'nullable|string|max:50',
            'national_title' => 'nullable|string|max:50',
            'certification_level' => 'nullable|string|max:100',
            'rating' => 'required|integer',
            'peak_rating' => 'nullable|integer',
            'years_teaching_experience' => 'required|integer',
            'primary_specialization_id' => 'nullable|exists:coach_specialization_categories,id',
            'secondary_specialization_id' => 'nullable|exists:coach_specialization_categories,id',
            'hourly_rate' => 'required|numeric',
            'preferred_languages' => 'nullable|array',
            'teaching_formats' => 'nullable|array',
            'communication_methods' => 'nullable|array',
            'professional_bio' => 'required|string',
            'video_introduction_url' => 'nullable|string|max:255',
            'social_media_links' => 'nullable|array',
            'status' => 'required|in:approved,pending',
        ]);
    
        $coach = Coach::create($validated);
    
        return response()->json([
            'message' => 'Demande envoyée avec succès.',
            'data' => $coach,
        ], 201);
    }
    

    // Admin & Coach: Update a coach profile
    public function update(Request $request, $id)
    {
        $coach = Coach::findOrFail($id);
    
        $validated = $request->validate([
            'title' => 'nullable|string|max:50',
            'fide_id' => 'nullable|string|max:50',
            'national_title' => 'nullable|string|max:50',
            'certification_level' => 'nullable|string|max:100',
            'rating' => 'nullable|integer',
            'peak_rating' => 'nullable|integer',
            'years_teaching_experience' => 'nullable|integer',
            'primary_specialization_id' => 'nullable|exists:coach_specialization_categories,id',
            'secondary_specialization_id' => 'nullable|exists:coach_specialization_categories,id',
            'hourly_rate' => 'nullable|numeric',
            'preferred_languages' => 'nullable|array',
            'teaching_formats' => 'nullable|array',
            'communication_methods' => 'nullable|array',
            'professional_bio' => 'nullable|string',
            'video_introduction_url' => 'nullable|string|max:255',
            'social_media_links' => 'nullable|array',
        ]);
    
        $coach->update($validated);
    
        return response()->json([
            'message' => 'Coach mis à jour avec succès.',
            'data' => $coach,
        ]);
    }
    
    // Admin: Delete a coach profile
    public function destroy($id)
    {
        $coach = Coach::findOrFail($id);
        $coach->delete();

        return response()->json(['message' => 'Coach supprimé avec succès.']);
    }

    // Admin: Approve a coach
    public function approve($id)
    {
        $coach = Coach::findOrFail($id);
        $coach->status = 'approved';
        $coach->save();

        return response()->json(['message' => 'Coach accepté avec succès.']);
    }

    // Admin: Reject a coach
    public function reject($id)
    {
        $coach = Coach::findOrFail($id);
        $coach->status = 'rejected';
        $coach->save();

        return response()->json(['message' => 'Coach rejeté avec succès.']);
    }
}
