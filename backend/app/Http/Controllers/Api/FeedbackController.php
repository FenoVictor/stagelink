<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackRequest;
use App\Mail\NewFeedback;
use App\Models\Feedback;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FeedbackController extends Controller
{
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = auth('sanctum')->user();

        $data['user_id'] = $user?->id;

        if ($user) {
            $data['name'] = $user->name;
            $data['email'] = $user->email;
        }

        $feedback = Feedback::create($data);

        AuditService::log(
            'feedback.submitted',
            'Nouveau retour utilisateur (' . $feedback->type . ')',
            $feedback,
            $user?->id
        );

        $recipient = config('services.feedback.email');
        if ($recipient) {
            try {
                Mail::to($recipient)->queue(new NewFeedback($feedback));
            } catch (\Throwable $e) {
                Log::error('Feedback email failed to queue', [
                    'feedback_id' => $feedback->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Merci pour votre contribution ! Votre avis nous aidera à améliorer StageLink.',
            'feedback' => $feedback,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Feedback::with('user:id,name,email');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($search = trim((string) $request->search)) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $feedbacks = $query->latest()->paginate(min((int) ($request->per_page ?? 20), 50));

        return response()->json($feedbacks);
    }

    public function update(UpdateFeedbackRequest $request, Feedback $feedback): JsonResponse
    {
        $data = $request->validated();

        $feedback->update($data);

        AuditService::log(
            'feedback.updated',
            'Retour utilisateur mis à jour (statut: ' . $feedback->status . ')',
            $feedback,
            $request->user()->id
        );

        return response()->json(['message' => 'Retour mis à jour.', 'feedback' => $feedback->load('user:id,name,email')]);
    }

    public function stats(): JsonResponse
    {
        $total = Feedback::count();

        $byStatus = [];
        foreach (Feedback::STATUSES as $status) {
            $byStatus[$status] = Feedback::where('status', $status)->count();
        }

        $byType = [];
        foreach (Feedback::TYPES as $type) {
            $byType[$type] = Feedback::where('type', $type)->count();
        }

        $averageRating = (float) Feedback::whereNotNull('rating')->avg('rating');
        $ratingCount = (int) Feedback::whereNotNull('rating')->count();

        return response()->json([
            'total' => $total,
            'by_status' => $byStatus,
            'by_type' => $byType,
            'average_rating' => round($averageRating, 1),
            'rating_count' => $ratingCount,
        ]);
    }
}
