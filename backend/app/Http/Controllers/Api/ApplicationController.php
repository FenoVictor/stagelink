<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewApplication;
use App\Models\Application;
use App\Models\Internship;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with(['internship.company'])
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($applications);
    }

    public function store(Request $request, Internship $internship): JsonResponse
    {
        $request->validate([
            'cover_letter' => 'nullable|string',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'status' => 'nullable|in:pending,accepted,rejected,interview',
        ]);

        $existing = Application::where('internship_id', $internship->id)
            ->where('student_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà postulé à cette offre.'], 409);
        }

        DB::beginTransaction();
        try {
            $data = [
                'internship_id' => $internship->id,
                'student_id' => $request->user()->id,
                'cover_letter' => $request->cover_letter,
            ];

            if ($request->hasFile('cv')) {
                $data['cv_path'] = $request->file('cv')->store('cvs', 'public');
            }

            $data['relevance'] = $this->calculateRelevance($request->user(), $internship);

            $application = Application::create($data);

            DB::commit();

            try {
                Mail::to($internship->company->user->email)
                    ->queue(new NewApplication($application));
            } catch (\Throwable $e) {
                Log::error('Application email failed to queue', [
                    'application_id' => $application->id,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                Notification::create([
                    'user_id' => $internship->company->user_id,
                    'type' => 'application',
                    'title' => 'Nouvelle candidature',
                    'message' => $application->student->name . ' a postulé à "' . $internship->title . '".',
                ]);
            } catch (\Throwable $e) {
                Log::error('Application notification creation failed', [
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Application submitted', [
                'application_id' => $application->id,
                'internship_id' => $internship->id,
                'student_id' => $request->user()->id,
                'relevance' => $data['relevance'],
            ]);

            return response()->json($application, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Application creation failed', [
                'internship_id' => $internship->id,
                'student_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Erreur lors de la candidature.'], 500);
        }
    }

    private function calculateRelevance($student, Internship $internship): string
    {
        $student->loadMissing(['studentProfile', 'skills']);
        $profile = $student->studentProfile;

        $score = 0;
        $haystack = mb_strtolower($internship->title . ' ' . ($internship->description ?? '') . ' ' . ($internship->requirements ?? ''));
        if ($internship->category) {
            $haystack .= ' ' . mb_strtolower($internship->category->name);
        }

        // Skills match (up to +40)
        foreach ($student->skills as $skill) {
            $skillName = mb_strtolower($skill->name);
            if (str_contains($haystack, $skillName)) {
                $score += 20;
            }
        }

        // Major match (up to +20)
        if ($profile && $profile->major) {
            $major = mb_strtolower($profile->major);
            if (str_contains($haystack, $major)) {
                $score += 20;
            }
        }

        // School reputation proxy (+10 if school is set)
        if ($profile && $profile->school) {
            $score += 10;
        }

        if ($score >= 40) return 'high';
        if ($score >= 20) return 'medium';
        return 'low';
    }
}
