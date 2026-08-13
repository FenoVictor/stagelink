<?php

namespace App\Http\Controllers\Api;

use App\Events\NewNotification;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInterviewRequest;
use App\Http\Requests\UpdateInterviewRequest;
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

        $perPage = min((int) $request->input('per_page', 50), 100);

        if ($user->role === 'company') {
            $interviews = Interview::whereHas('application.internship.company', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->paginate($perPage);
        } elseif ($user->role === 'student') {
            $interviews = Interview::whereHas('application', function ($q) use ($user) {
                $q->where('student_id', $user->id);
            })
                ->with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->paginate($perPage);
        } else {
            $interviews = Interview::with(['application.internship:id,title', 'application.student:id,name'])
                ->orderBy('date')
                ->paginate($perPage);
        }

        return response()->json($interviews);
    }

    public function store(StoreInterviewRequest $request): JsonResponse
    {
        $this->authorize('create', Interview::class);

        $data = $request->validated();

        $application = Application::findOrFail($data['application_id']);

        $this->authorize('update', $application);

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
            $notification = Notification::create([
                'user_id' => $application->student_id,
                'type' => 'interview',
                'title' => 'Entretien programmé',
                'message' => 'Un entretien a été programmé pour "'.$application->internship->title.'" le '.$interview->date->format('d/m/Y à H:i').'.',
            ]);
            broadcast(new NewNotification($notification));
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

    public function update(UpdateInterviewRequest $request, Interview $interview): JsonResponse
    {
        $this->authorize('update', $interview);

        $data = $request->validated();

        $interview->update($data);

        Log::info('Entretien mis à jour', [
            'interview_id' => $interview->id,
            'data' => $data,
        ]);

        return response()->json($interview->load(['application.internship:id,title', 'application.student:id,name']));
    }
}
