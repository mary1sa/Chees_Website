<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTypeController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\TournamentMatchController;
use App\Http\Controllers\TournamentRoundController;
use App\Http\Controllers\EventRegistrationController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


//User 


Route::get('/users', [UserController::class, 'getAllUsers']);
Route::get('/users/{id}', [UserController::class, 'getUserById']);
Route::post('/users', [UserController::class, 'createUser']);
Route::post('/users/{id}', [UserController::class, 'updateUser']);
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);


// Event Types
Route::apiResource('event-types', EventTypeController::class);

// Events
Route::apiResource('events', EventController::class);
Route::get('events/{event}/registration-status', [EventController::class,'registrationStatus']);
Route::get('events/{event}/rounds', [EventController::class, 'rounds']);

// Event Registrations
Route::apiResource('registrations', controller: EventRegistrationController::class)->except(['store']);
Route::post('events/{event}/register', [EventRegistrationController::class, 'register']);
Route::post('registrations/{registration}/cancel', [EventRegistrationController::class, 'cancel']);
Route::post('registrations/{registration}/confirm-payment', [EventRegistrationController::class, 'confirmPayment']);
Route::get('users/{user}/registrations', [EventRegistrationController::class, 'userRegistrations']);
Route::get('events/{event}/registrations', [EventRegistrationController::class, 'getEventRegistrations']);

// Tournament Rounds
Route::get('events/{event}/rounds', [TournamentRoundController::class, 'index']);
Route::post('events/{event}/rounds', [TournamentRoundController::class, 'store']);
Route::get('rounds/{round}', [TournamentRoundController::class, 'show']);
Route::put('rounds/{round}', [TournamentRoundController::class, 'update']);
Route::delete('rounds/{round}', [TournamentRoundController::class, 'destroy']);
Route::post('rounds/{round}/start', [TournamentRoundController::class, 'startRound']);
Route::post('rounds/{round}/complete', [TournamentRoundController::class, 'completeRound']);

// Tournament Matches
Route::get('rounds/{round}/matches', [TournamentMatchController::class, 'index']);
Route::post('rounds/{round}/matches', [TournamentMatchController::class, 'store']);
Route::get('matches/{match}', [TournamentMatchController::class, 'show']);
Route::put('matches/{match}', [TournamentMatchController::class, 'update']);
Route::delete('matches/{match}', [TournamentMatchController::class, 'destroy']);
Route::post('matches/{match}/start', [TournamentMatchController::class, 'startMatch']);
Route::post('matches/{match}/result', [TournamentMatchController::class, 'recordResult']);
Route::get('players/{player}/matches', [TournamentMatchController::class, 'playerMatches']);