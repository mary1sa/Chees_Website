<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventTypeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\TournamentController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);











Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Event Types
Route::apiResource('event-types', EventTypeController::class);

// Events
Route::apiResource('events', EventController::class);

Route::get('events/{event}/registration-status', [EventController::class,'registrationStatus']);

Route::get('events/{event}/rounds', [EventController::class, 'rounds']);

// Event Registrations
// Route::apiResource('registrations', EventRegistrationController::class);
// Route::post('events/{event}/register', [EventRegistrationController::class, 'register']);
// Route::post('registrations/{registration}/cancel', [EventRegistrationController::class, 'cancel']);
// Route::post('registrations/{registration}/confirm-payment', [EventRegistrationController::class, 'confirmPayment']);

// Event Registrations
Route::apiResource('registrations', EventRegistrationController::class)->except(['store']);
Route::post('events/{event}/register', [EventRegistrationController::class, 'register']);
Route::post('registrations/{registration}/cancel', [EventRegistrationController::class, 'cancel']);
Route::post('registrations/{registration}/confirm-payment', [EventRegistrationController::class, 'confirmPayment']);
Route::get('users/{user}/registrations', [EventRegistrationController::class, 'userRegistrations']);
Route::get('events/{event}/registrations', [EventRegistrationController::class, 'getEventRegistrations']);
// Tournament Management
// Route::post('events/{event}/create-rounds', [TournamentController::class, 'createRounds'])
//     ->middleware('auth:sanctum');
// Route::post('events/{event}/rounds/{round}/generate-pairings', [TournamentController::class, 'generatePairings'])
//     ->middleware('auth:sanctum');
// Route::post('matches/{match}/record-result', [TournamentController::class, 'recordMatchResult'])
//     ->middleware('auth:sanctum');
// Route::get('events/{event}/standings', [TournamentController::class, 'standings']);