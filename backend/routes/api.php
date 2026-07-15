<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminCompanyController;
use App\Http\Controllers\Api\AdminInternshipController;
use App\Http\Controllers\Api\AdminStatsController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyApplicationController;
use App\Http\Controllers\Api\CompanyInternshipController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentDashboardController;
use App\Http\Controllers\Api\StudentPublicController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\NeighborhoodController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\UserSearchController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/internships', [InternshipController::class, 'index']);
Route::get('/internships/filters', [InternshipController::class, 'filters']);
Route::get('/internships/{internship}', [InternshipController::class, 'show']);
Route::get('/cities', CityController::class);
Route::get('/skills', SkillController::class);

// Location hierarchy
Route::get('/locations/countries', [LocationController::class, 'countries']);
Route::get('/locations/{country}/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/provinces/{province}/regions', [LocationController::class, 'regions']);
Route::get('/locations/regions/{region}/districts', [LocationController::class, 'districts']);
Route::get('/locations/districts/{district}/communes', [LocationController::class, 'communes']);
Route::get('/locations/communes/{commune}/neighborhoods', [LocationController::class, 'neighborhoods']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Shared authenticated routes
    Route::get('/users/search', [UserSearchController::class, 'search']);
    Route::post('/neighborhoods', [NeighborhoodController::class, 'store']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/internships/{internship}/favorite', [FavoriteController::class, 'toggle']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/students/{user}/profile', [StudentPublicController::class, 'show']);

    // Student routes
    Route::middleware('role:student')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/internships/{internship}/apply', [ApplicationController::class, 'store']);
        Route::get('/student/dashboard', StudentDashboardController::class);
        Route::get('/student/internships', [\App\Http\Controllers\Api\StudentInternshipController::class, 'index']);
        Route::post('/student/internships/{internship}/start', [\App\Http\Controllers\Api\StudentInternshipController::class, 'start']);
        Route::put('/student/internship-student/{internshipStudent}/complete', [\App\Http\Controllers\Api\StudentInternshipController::class, 'complete']);
        Route::get('/student/internship-student/{internshipStudent}/attestation', [\App\Http\Controllers\Api\StudentInternshipController::class, 'attestation']);
    });

    // Company routes
    Route::middleware('role:company')->prefix('company')->group(function () {
        Route::get('/profile', [CompanyProfileController::class, 'show']);
        Route::post('/profile', [CompanyProfileController::class, 'update']);
        Route::apiResource('/internships', CompanyInternshipController::class);
        Route::get('/internships/{internship}/applications', [CompanyApplicationController::class, 'index']);
        Route::put('/applications/{application}', [CompanyApplicationController::class, 'update']);
        Route::post('/interviews', [InterviewController::class, 'store']);
        Route::put('/interviews/{interview}', [InterviewController::class, 'update']);
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Stats
        Route::get('/stats', AdminStatsController::class);

        // Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        Route::post('/users/{user}/ban', [AdminUserController::class, 'ban']);
        Route::post('/users/{user}/unban', [AdminUserController::class, 'unban']);
        Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
        Route::get('/password-resets', [AdminUserController::class, 'passwordResets']);

        // Students
        Route::get('/students', [AdminStudentController::class, 'index']);
        Route::get('/students/{user}', [AdminStudentController::class, 'show']);

        // Companies
        Route::get('/companies', [AdminCompanyController::class, 'index']);
        Route::get('/companies/{company}', [AdminCompanyController::class, 'show']);
        Route::post('/companies/{company}/validate', [AdminCompanyController::class, 'validate']);
        Route::post('/companies/{company}/suspend', [AdminCompanyController::class, 'suspend']);
        Route::post('/companies/{company}/reactivate', [AdminCompanyController::class, 'reactivate']);
        Route::delete('/companies/{company}', [AdminCompanyController::class, 'destroy']);

        // Internships
        Route::get('/internships', [AdminInternshipController::class, 'index']);
        Route::put('/internships/{internship}', [AdminInternshipController::class, 'update']);
        Route::delete('/internships/{internship}', [AdminInternshipController::class, 'destroy']);

        // Categories
        Route::apiResource('/categories', AdminCategoryController::class);

        // Neighborhoods
        Route::get('/neighborhoods/pending', [NeighborhoodController::class, 'pending']);
        Route::get('/neighborhoods/pending-count', [NeighborhoodController::class, 'pendingCount']);
        Route::post('/neighborhoods/{neighborhood}/approve', [NeighborhoodController::class, 'approve']);
        Route::post('/neighborhoods/{neighborhood}/reject', [NeighborhoodController::class, 'reject']);
    });
});
