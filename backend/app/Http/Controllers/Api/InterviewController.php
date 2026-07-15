<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InterviewScheduled;
use App\Models\Application;
use App\Models\Interview;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'company') {
            $interviews = Interview::whereHas('application.internship.company', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->get();
        } elseif ($user->role === 'student') {
            $interviews = Interview::whereHas('application', function ($q) use ($user) {
                $q->where('student_id', $user->id);
            })
                ->with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->get();
        } else {
            $interviews = Interview::with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->get();
        }

        return response()->json($interviews);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'date' => 'required|date|after:now',
            'meeting_link' => 'nullable|url|max:255',
            'notes' => 'nullable|string|max:2000',
            'location' => 'nullable|string|max:255',
        ]);

        $application = Application::findOrFail($data['application_id']);

        $internship = $application->internship;
        if ($internship->company->user_id !== $request->user()->id) {
            abort(403);
        }

        $interview = Interview::create([
            'application_id' => $application->id,
            'date' => $data['date'],
            'meeting_link' => $data['meeting_link'] ?? null,
            'notes' => $data['notes'] ?? null,
            'location' => $data['location'] ?? null,
        ]);

        try {
            Mail::to($application->student->email)
                ->queue(new InterviewScheduled($interview));
        } catch (\Throwable $e) {
            Log::error('Interview email failed to queue', [
                'interview_id' => $interview->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            Notification::create([
                'user_id' => $application->student_id,
                'type' => 'interview',
                'title' => 'Entretien programmé',
                'message' => 'Un entretien a été programmé pour "' . $application->internship->title . '" le ' . $interview->date->format('d/m/Y à H:i') . '.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Interview notification creation failed', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('Entretien programmé', [
            'application_id' => $application->id,
            'date' => $data['date'],
        ]);

        return response()->json($interview->load(['application.internship:id,title', 'application.student:id,name']), 201);
    }

    public function update(Request $request, Interview $interview): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'company' && $interview->application->internship->company->user_id !== $user->id) {
            abort(403);
        }

        $data = $request->validate([
            'date' => 'sometimes|date|after:now',
            'meeting_link' => 'nullable|url|max:255',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string|max:2000',
            'location' => 'nullable|string|max:255',
        ]);

        $interview->update($data);

        Log::info('Entretien mis à jour', [
            'interview_id' => $interview->id,
            'data' => $data,
        ]);

        return response()->json($interview->load(['application.internship:id,title', 'application.student:id,name']));
    }
}
