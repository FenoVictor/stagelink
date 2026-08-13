<?php

namespace App\Http\Controllers\Api;

use App\Events\NewMessage;
use App\Events\NewNotification;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 50), 100);

        $conversations = $request->user()->conversations()
            ->with(['lastMessage.sender', 'student:id,name', 'company:id,name', 'internship:id,title'])
            ->withCount(['messages as unread_count' => function ($q) use ($request) {
                $q->whereNull('read_at')->where('sender_id', '!=', $request->user()->id);
            }])
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        return response()->json($conversations);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $conversation->load(['messages.sender', 'student:id,name', 'company:id,name', 'internship:id,title']);

        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        $conversation->participants()
            ->where('user_id', $request->user()->id)
            ->update(['last_read_at' => now()]);

        return response()->json($conversation);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $authUser = $request->user();

        if (isset($data['recipient_id'])) {
            $recipient = User::findOrFail($data['recipient_id']);
            if ($authUser->role === 'student' && $recipient->role === 'company') {
                $studentId = $authUser->id;
                $companyId = $recipient->id;
            } elseif ($authUser->role === 'company' && $recipient->role === 'student') {
                $studentId = $recipient->id;
                $companyId = $authUser->id;
            } else {
                abort(422, 'Impossible de déterminer les rôles de la conversation.');
            }
        } else {
            $studentId = $data['student_id'] ?? abort(422, 'student_id requis.');
            $companyId = $data['company_id'] ?? abort(422, 'company_id requis.');
        }

        if ($studentId === $companyId) {
            abort(422, 'L\'étudiant et l\'entreprise doivent être des utilisateurs différents.');
        }

        $conversation = Conversation::firstOrCreate(
            [
                'student_id' => $studentId,
                'company_id' => $companyId,
            ]
        );

        if (isset($data['internship_id']) && ! $conversation->internship_id) {
            $conversation->update(['internship_id' => $data['internship_id']]);
        }

        foreach ([$studentId, $companyId] as $uid) {
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversation->id,
                'user_id' => $uid,
            ]);
        }

        $message = $conversation->messages()->create([
            'sender_id' => $authUser->id,
            'message' => $data['message'],
        ]);

        $conversation->touch();

        broadcast(new NewMessage($message));

        $otherParticipantId = $studentId === $authUser->id ? $companyId : $studentId;

        try {
            $notification = Notification::create([
                'user_id' => $otherParticipantId,
                'type' => 'message:'.$conversation->id,
                'title' => 'Nouveau message',
                'message' => $authUser->name.' vous a envoyé un message.',
            ]);
            broadcast(new NewNotification($notification));
        } catch (\Throwable $e) {
            Log::error('Message notification creation failed', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('Message envoyé', [
            'conversation_id' => $conversation->id,
            'sender_id' => $authUser->id,
        ]);

        return response()->json([
            'conversation' => $conversation->load('messages.sender'),
            'message' => $message->load('sender'),
        ], 201);
    }
}
