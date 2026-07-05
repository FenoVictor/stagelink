<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminInternshipController;
use App\Http\Controllers\Api\AdminStatsController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyApplicationController;
use App\Http\Controllers\Api\CompanyInternshipController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\ProfileController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/internships', [InternshipController::class, 'index']);
Route::get('/internships/{internship}', [InternshipController::class, 'show']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Student profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Applications (student)
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/internships/{internship}/apply', [ApplicationController::class, 'store']);

    // Company routes
    Route::middleware('role:company')->prefix('company')->group(function () {
        Route::get('/profile', [CompanyProfileController::class, 'show']);
        Route::post('/profile', [CompanyProfileController::class, 'update']);
        Route::apiResource('/internships', CompanyInternshipController::class);
        Route::get('/internships/{internship}/applications', [CompanyApplicationController::class, 'index']);
        Route::put('/applications/{application}', [CompanyApplicationController::class, 'update']);
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', AdminStatsController::class);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        Route::get('/internships', [AdminInternshipController::class, 'index']);
        Route::put('/internships/{internship}', [AdminInternshipController::class, 'update']);
        Route::delete('/internships/{internship}', [AdminInternshipController::class, 'destroy']);
        Route::apiResource('/categories', AdminCategoryController::class);
    });
});
