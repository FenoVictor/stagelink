<?php

namespace App\Http\Controllers\Api;

use App\Events\NewNotification;
use App\Http\Controllers\Controller;
use App\Mail\ApplicationStatusChanged;
use App\Models\Application;
use App\Models\Internship;
use App\Models\Notification;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompanyApplicationController extends Controller
{
    public function index(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('manageApplications', $internship);

        $applications = Application::with(['student.studentProfile'])
            ->where('internship_id', $internship->id)
            ->latest()
            ->get();

        return response()->json($applications);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $this->authorize('update', $application);

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,rejected,interview',
        ]);

        DB::beginTransaction();
        try {
            $application->load(['student', 'internship.company']);

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

            AuditService::log('application_status_change', "Candidature {$statusLabel} pour \"{$application->internship->title}\"", $application, null, 'success', [
                'new_status' => $validated['status'],
                'student_id' => $application->student_id,
                'internship_id' => $application->internship_id,
            ]);

            try {
                $notification = Notification::create([
                    'user_id' => $application->student_id,
                    'type' => 'application',
                    'title' => 'Candidature ' . $statusLabel,
                    'message' => 'Votre candidature pour "' . $application->internship->title . '" a été ' . $statusLabel . '.',
                ]);
                broadcast(new NewNotification($notification));
            } catch (\Throwable $e) {
                Log::error('Status change notification creation failed', [
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Application status updated', [
                'application_id' => $application->id,
                'internship_id' => $application->internship_id,
                'new_status' => $validated['status'],
                'company_id' => $application->internship->company_id,
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

    public function export(Request $request, Internship $internship): StreamedResponse
    {
        $this->authorize('export', $internship);

        $applications = Application::with(['student.studentProfile'])
            ->where('internship_id', $internship->id)
            ->latest()
            ->get();

        $filename = 'candidatures_' . str_replace(' ', '_', $internship->title) . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($applications, $internship) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF"); // BOM UTF-8
            fputcsv($handle, ['Candidatures pour : ' . $internship->title], ';');
            fputcsv($handle, [], ';');
            fputcsv($handle, ['Étudiant', 'Email', 'Téléphone', 'Statut', 'Pertinence', 'Lettre de motivation', 'Date de candidature'], ';');
            foreach ($applications as $app) {
                $student = $app->student;
                $profile = $student->studentProfile;
                fputcsv($handle, [
                    ($student->firstname ?? '') . ' ' . ($student->lastname ?? ''),
                    $student->email ?? '',
                    $student->phone ?? '',
                    match ($app->status) { 'pending' => 'En attente', 'accepted' => 'Acceptée', 'rejected' => 'Refusée', 'interview' => 'Entretien', default => $app->status },
                    match ($app->relevance) { 'high' => 'Élevée', 'medium' => 'Moyenne', 'low' => 'Faible', default => '' },
                    strip_tags($app->cover_letter ?? ''),
                    $app->created_at?->format('d/m/Y H:i') ?? '',
                ], ';');
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
