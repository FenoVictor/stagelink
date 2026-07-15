<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ApplicationStatusChanged;
use App\Models\Application;
use App\Models\Internship;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CompanyApplicationController extends Controller
{
    public function index(Request $request, Internship $internship): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($internship->company_id !== $company->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $applications = Application::with(['student.studentProfile'])
            ->where('internship_id', $internship->id)
            ->latest()
            ->get();

        return response()->json($applications);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $company = $request->user()->companyProfile;

        if ($application->internship->company_id !== $company->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,rejected,interview',
        ]);

        DB::beginTransaction();
        try {
            $application->update($validated);

            DB::commit();

            try {
                Mail::to($application->student->email)
                    ->queue(new ApplicationStatusChanged($application));
            } catch (\Throwable $e) {
                Log::error('Status change email failed to queue', [
                    'application_id' => $application->id,
                    'status' => $validated['status'],
                    'error' => $e->getMessage(),
                ]);
            }

            $statusLabel = match ($validated['status']) {
                'accepted' => 'acceptée',
                'rejected' => 'refusée',
                'interview' => 'en entretien',
                default => $validated['status'],
            };

            try {
                Notification::create([
                    'user_id' => $application->student_id,
                    'type' => 'application',
                    'title' => 'Candidature ' . $statusLabel,
                    'message' => 'Votre candidature pour "' . $application->internship->title . '" a été ' . $statusLabel . '.',
                ]);
            } catch (\Throwable $e) {
                Log::error('Status change notification creation failed', [
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Application status updated', [
                'application_id' => $application->id,
                'internship_id' => $application->internship_id,
                'new_status' => $validated['status'],
                'company_id' => $company->id,
            ]);

            return response()->json($application);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Application status update failed', [
                'application_id' => $application->id,
                'status' => $validated['status'] ?? null,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Erreur lors de la mise à jour.'], 500);
        }
    }
}
