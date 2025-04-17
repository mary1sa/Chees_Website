<?php

use App\Http\Controllers\CoachesController;
use App\Http\Controllers\CoachReviewController;
use App\Http\Controllers\CoachSpecializationCategoryController;
use App\Http\Controllers\MemberBookingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\EventTypeController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\BookRatingController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\CourseLevelController;
use App\Http\Controllers\CourseMediaController;
use App\Http\Controllers\BookCategoryController;
use App\Http\Controllers\Member\CoachController;
use App\Http\Controllers\CourseSessionController;
use App\Http\Controllers\CourseMaterialController;
use App\Http\Controllers\TournamentMatchController;
use App\Http\Controllers\TournamentRoundController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\SessionAttendanceController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

//roles

Route::get('/roles', [RoleController::class, 'index']);

Route::get('/roles/{id}', [RoleController::class, 'show']);

Route::post('/roles', [RoleController::class, 'store']);

Route::put('/roles/{id}', [RoleController::class, 'update']);

Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

// User management routes
Route::get('/users', [UserController::class, 'getAllUsers']);
Route::get('/all-users', [UserController::class, 'getAllUsersWithoutRoleFilter']);
Route::get('/users/count', [UserController::class, 'getUserCount']);
Route::get('/users/{id}', [UserController::class, 'getUserById']);
Route::post('/users', [UserController::class, 'createUser']);
Route::put('/users/{id}', [UserController::class, 'updateUser']);
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

// Get coaches for course creation
Route::get('/coaches', [UserController::class, 'getCoaches']);

//CoatchSpecializationCategoryController
Route::get('specializations', [CoachSpecializationCategoryController::class, 'index']);
Route::post('specializations', [CoachSpecializationCategoryController::class, 'store']);
Route::get('specializations/{id}', [CoachSpecializationCategoryController::class, 'show']);
Route::put('specializations/{id}', [CoachSpecializationCategoryController::class, 'update']);
Route::delete('specializations/{id}', [CoachSpecializationCategoryController::class, 'destroy']);
//Coaches
//Route::apiResource('coaches', CoachController::class);
// Event Types
Route::apiResource('event-types', EventTypeController::class);

// Events
Route::apiResource('events', EventController::class);
Route::get('events/{event}/registration-status', [EventController::class,'registrationStatus']);
// Route::get('events/{event}/rounds', [EventController::class, 'rounds']);

// Event Registrations
Route::apiResource('registrations', controller: EventRegistrationController::class)->except(['store']);
Route::post('events/{event}/register', [EventRegistrationController::class, 'register']);
Route::get('/events/available', [EventRegistrationController::class, 'availableEvents']);
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

// Course Materials
Route::apiResource('course-materials', CourseMaterialController::class);
Route::get('course-materials/{id}/download', [CourseMaterialController::class, 'download']);
Route::get('course-materials/{id}/view', [CourseMaterialController::class, 'stream']);
Route::get('course-materials/{id}/stream', [CourseMaterialController::class, 'stream']);
Route::post('course-materials/{id}/update-with-file', [CourseMaterialController::class, 'updateWithFile']);

// Course Media
Route::apiResource('course-media', CourseMediaController::class);

// Course Progress (new endpoints)
Route::prefix('course-progress')->group(function() {
    Route::get('/{user}/{course}', [CourseProgressController::class, 'show']);
    Route::put('/{id}', [CourseProgressController::class, 'update']);
    Route::post('/bulk-update', [CourseProgressController::class, 'bulkUpdate']);
    Route::get('/user/{user}', [CourseProgressController::class, 'getUserProgress']);
    Route::get('/course/{course}', [CourseProgressController::class, 'getCourseProgress']);
    Route::post('/{id}/complete-lesson', [CourseProgressController::class, 'completeLesson']);
});

// Payments for courses and books and events
Route::middleware('auth:api')->group(function () {
    Route::apiResource('payments', PaymentController::class);
    Route::get('users/{user}/payments', [PaymentController::class, 'userPayments']);
    Route::post('payments/{payment}/verify', [PaymentController::class, 'verifyPayment']);
});

// Wishlist can be used for courses and books
Route::middleware('auth:api')->group(function () {
    Route::apiResource('wishlists', WishlistController::class);
    Route::get('users/{user}/wishlist', [WishlistController::class, 'userWishlist']);
    Route::post('wishlists/toggle/{course}', [WishlistController::class, 'toggle']);
});

// Course Package Routes
Route::prefix('course-packages')->group(function() {
    // Public routes
    Route::get('/', [CoursePackageController::class, 'index']);
    Route::get('/{id}', [CoursePackageController::class, 'show']);
    
    // Protected routes
    Route::middleware('auth:api')->group(function() {
        Route::post('/', [CoursePackageController::class, 'store']);
        Route::put('/{id}', [CoursePackageController::class, 'update']);
        Route::delete('/{id}', [CoursePackageController::class, 'destroy']);
        Route::put('/{id}/courses', [CoursePackageController::class, 'updateCourses']);
        Route::post('/{id}/purchase', [CoursePackageController::class, 'purchase']);
    });
});

// Course API routes
Route::prefix('courses')->group(function () {
    // Public course routes
    Route::get('/', [CourseController::class, 'index']);
    
    // Protected course routes that require authentication
    Route::middleware('auth:api')->group(function () {
        Route::get('/purchased', [CourseController::class, 'getPurchasedCourses']);
        Route::post('/purchase', [CourseController::class, 'purchaseCourse']);
        Route::get('/check-purchase/{course}', [CourseController::class, 'checkPurchaseStatus']);
        Route::post('/validate-coupon', [CourseController::class, 'validateCoupon']);
        
        Route::post('/', [CourseController::class, 'store']);
        Route::put('/{course}', [CourseController::class, 'update']);
        Route::post('/{course}/update-with-file', [CourseController::class, 'updateWithFile']);
        Route::delete('/{course}', [CourseController::class, 'destroy']);
    });
    
    // These routes must be defined after the specific routes to avoid conflicts
    Route::get('/{course}', [CourseController::class, 'show']);
    Route::get('/{course}/sessions', [CourseController::class, 'getSessions']);
    Route::get('/{course}/materials', [CourseController::class, 'getMaterials']);
});

// Course-related resources - Using only auth:api for consistency with other routes
// Public course-related resources
Route::apiResource('course-levels', CourseLevelController::class)->only(['index', 'show']);

Route::middleware('auth:api')->group(function () {
    // Protected course-related resources
    Route::apiResource('course-levels', CourseLevelController::class)->except(['index', 'show']);
    Route::get('/course-sessions/upcoming', [CourseSessionController::class, 'upcoming']);
    Route::get('/course-sessions/past', [CourseSessionController::class, 'past']);
    Route::apiResource('course-sessions', CourseSessionController::class);
    Route::apiResource('session-attendances', SessionAttendanceController::class);
    Route::apiResource('coupons', CouponController::class);
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    // User routes
    Route::get('/profile', [UserController::class, 'show']);
    Route::put('/profile', [UserController::class, 'update']);
    
    // Course sessions
    //Route::post('/course-sessions/{courseSession}/attend', [SessionAttendanceController::class, 'store']);
    
    // Course materials
    //Route::get('/course-materials/{courseMaterial}', [CourseMaterialController::class, 'show']);
    
    // Course packages
    Route::get('/me/packages', [CoursePackageController::class, 'myPackages']);
    Route::get('/me/active-packages', [CoursePackageController::class, 'myActivePackages']);
    Route::post('/me/packages/{id}/cancel', [CoursePackageController::class, 'cancelPackage']);
    
    // Course progress
    
    // Wishlist
    Route::apiResource('/wishlist', WishlistController::class);
});

// Event players
Route::get('events/{event}/confirmed-players', [EventController::class, 'getConfirmedPlayers'])
    ->where('event', '[0-9]+'); // Ensure the parameter is numeric
//books

Route::apiResource('categories', BookCategoryController::class);
Route::apiResource('authors', AuthorController::class);
Route::apiResource('books', BookController::class);
Route::apiResource('books.ratings', BookRatingController::class)->only(['index', 'store']);
Route::apiResource('ratings', BookRatingController::class)->only(['update', 'destroy']);
Route::apiResource('orders', OrderController::class)->middleware('auth:api');
Route::apiResource('order-items', OrderItemController::class)->only(['show']);
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
Route::get('/order-items', [OrderItemController::class, 'index']);
Route::get('/orders/user/{userId}', [OrderController::class, 'getUserOrders']);
