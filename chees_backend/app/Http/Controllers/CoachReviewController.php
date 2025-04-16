<?php

namespace App\Http\Controllers;

use App\Models\CoachReview;
use App\Models\Coach;
use App\Models\User;
use Illuminate\Http\Request;

class CoachReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'coach_id' => 'required|exists:coaches,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string',
            'teaching_clarity_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'knowledge_depth_rating' => 'nullable|integer|min:1|max:5',
        ]);

        $existingReview = CoachReview::where('coach_id', $request->coach_id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this coach.'], 400);
        }

        $review = new CoachReview();
        $review->coach_id = $request->coach_id;
        $review->user_id = $request->user_id;
        $review->rating = $request->rating;
        $review->review_text = $request->review_text;
        $review->teaching_clarity_rating = $request->teaching_clarity_rating;
        $review->communication_rating = $request->communication_rating;
        $review->knowledge_depth_rating = $request->knowledge_depth_rating;
        $review->save();

        return response()->json(['message' => 'Review submitted successfully!'], 200);
    }

    public function show($coachId)
    {
        $reviews = CoachReview::where('coach_id', $coachId)->get();

        return response()->json($reviews);
    }
}
