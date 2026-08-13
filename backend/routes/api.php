<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminCompanyController;
use App\Http\Controllers\Api\AdminInternshipController;
use App\Http\Controllers\Api\AdminStatsController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminUserController;

use App\Http\Controllers\Api\AdminAuditLogController;
use App\Http\Controllers\Api\AdminSecurityController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyApplicationController;
use App\Http\Controllers\Api\CompanyInternshipController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\GdprController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MetricsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentDashboardController;
use App\Http\Controllers\Api\StudentPublicController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\NeighborhoodController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserSearchController;

// Public routes
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]);
})->name('health');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/2fa/verify', [AuthController::class, 'verifyTwoFactor'])->middleware(['auth:sanctum', 'banned', 'throttle:5,10']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
Route::get('/internships', [InternshipController::class, 'index']);
Route::get('/internships/filters', [InternshipController::class, 'filters']);
Route::get('/internships/{internship}', [InternshipController::class, 'show']);
Route::get('/cities', CityController::class);
Route::get('/skills', SkillController::class);
Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/companies/{company}', [\App\Http\Controllers\Api\PublicCompanyController::class, 'show']);
Route::get('/stats', \App\Http\Controllers\Api\PublicStatsController::class);
Route::post('/feedback', [FeedbackController::class, 'store'])->middleware('throttle:feedback');

// Location hierarchy
Route::get('/locations/countries', [LocationController::class, 'countries']);
Route::get('/locations/{country}/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/provinces/{province}/regions', [LocationController::class, 'regions']);
Route::get('/locations/regions/{region}/districts', [LocationController::class, 'districts']);
Route::get('/locations/districts/{district}/communes', [LocationController::class, 'communes']);
Route::get('/locations/communes/{commune}/neighborhoods', [LocationController::class, 'neighborhoods']);
Route::get('/locations/communes/{commune}/hierarchy', [LocationController::class, 'communeHierarchy']);

// Authenticated routes
Route::middleware(['auth:sanctum', 'banned'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // 2FA
    Route::prefix('2fa')->group(function () {
        Route::get('/status', [TwoFactorController::class, 'status']);
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
        Route::get('/qr-code', [TwoFactorController::class, 'qrCode']);
    });

    // Token management
    Route::get('/tokens', [TokenController::class, 'index']);
    Route::post('/tokens', [TokenController::class, 'store']);
    Route::post('/tokens/rotate', [TokenController::class, 'rotate']);
    Route::delete('/tokens/{tokenId}', [TokenController::class, 'destroy']);

    // Shared authenticated routes
    Route::post('/email/verification/send', [EmailVerificationController::class, 'sendVerification']);
    Route::get('/users/search', [UserSearchController::class, 'search']);
    Route::post('/neighborhoods', [NeighborhoodController::class, 'store']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/internships/{internship}/favorite', [FavoriteController::class, 'toggle']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store'])->middleware('verified');
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/students/{user}/profile', [StudentPublicController::class, 'show']);
    Route::get('/students/{user}/cv', [StudentPublicController::class, 'cv']);

    // GDPR
    Route::get('/gdpr/data-info', [GdprController::class, 'dataInfo']);
    Route::get('/gdpr/export', [GdprController::class, 'exportData']);
    Route::delete('/gdpr/delete-account', [GdprController::class, 'deleteAccount']);

    // Student routes
    Route::middleware('role:student')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/internships/{internship}/apply', [ApplicationController::class, 'store'])->middleware('verified');
        Route::get('/student/dashboard', StudentDashboardController::class);
        Route::get('/student/internships', [\App\Http\Controllers\Api\StudentInternshipController::class, 'index']);
        Route::post('/student/internships/{internship}/start', [\App\Http\Controllers\Api\StudentInternshipController::class, 'start'])->middleware('verified');
        Route::put('/student/internship-student/{internshipStudent}/complete', [\App\Http\Controllers\Api\StudentInternshipController::class, 'complete'])->middleware('verified');
        Route::get('/student/internship-student/{internshipStudent}/attestation', [\App\Http\Controllers\Api\StudentInternshipController::class, 'attestation']);
    });

    // Company routes
    Route::middleware('role:company')->prefix('company')->group(function () {
        Route::get('/profile', [CompanyProfileController::class, 'show']);
        Route::post('/profile', [CompanyProfileController::class, 'update']);
        Route::apiResource('/internships', CompanyInternshipController::class)->except(['store']);
        Route::post('/internships', [CompanyInternshipController::class, 'store'])->middleware('verified');
        Route::get('/internships/{internship}/applications', [CompanyApplicationController::class, 'index']);
        Route::get('/internships/{internship}/applications/export', [CompanyApplicationController::class, 'export']);
        Route::put('/applications/{application}', [CompanyApplicationController::class, 'update'])->middleware('verified');
        Route::post('/interviews', [InterviewController::class, 'store'])->middleware('verified');
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
        Route::post('/companies/{company}/validate', [AdminCompanyController::class, 'validateCompany']);
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

        // Audit Logs
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
        Route::get('/audit-logs/actions', [AdminAuditLogController::class, 'actions']);
        Route::get('/audit-logs/export', [AdminAuditLogController::class, 'export']);

        // Security
        Route::get('/security/secrets-status', [AdminSecurityController::class, 'secretsStatus']);
        Route::post('/security/secrets-check', [AdminSecurityController::class, 'runSecretsCheck']);

        // Metrics / Observability
        Route::get('/metrics/dashboard', [MetricsController::class, 'dashboard']);

        // Feedback
        Route::get('/feedback', [FeedbackController::class, 'index']);
        Route::get('/feedback/stats', [FeedbackController::class, 'stats']);
        Route::put('/feedback/{feedback}', [FeedbackController::class, 'update']);

        // Login Logs
        Route::get('/login-logs', [\App\Http\Controllers\Api\AdminLoginLogController::class, 'index']);
        Route::get('/login-logs/stats', [\App\Http\Controllers\Api\AdminLoginLogController::class, 'stats']);
        Route::get('/login-logs/export', [\App\Http\Controllers\Api\AdminLoginLogController::class, 'export']);
    });
});
