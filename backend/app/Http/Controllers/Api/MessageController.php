<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        $isParticipant = $conversation->participants()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isParticipant) {
            abort(403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        $isParticipant = $conversation->participants()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isParticipant) {
            abort(403);
        }

        $data = $request->validate([
            'message' => 'nullable|string|max:5000',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ]);

        if (!$request->has('message') && !$request->hasFile('file')) {
            abort(422, 'Un message ou un fichier est requis.');
        }

        $messageData = [
            'sender_id' => $request->user()->id,
            'message' => $data['message'] ?? null,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $messageData['file_path'] = $file->store('message-attachments', 'public');
            $messageData['file_name'] = $file->getClientOriginalName();
            $messageData['file_size'] = $file->getSize();
        }

        $message = $conversation->messages()->create($messageData);

        $conversation->touch();

        $otherParticipantId = $conversation->participants()
            ->where('user_id', '!=', $request->user()->id)
            ->value('user_id');

        if ($otherParticipantId) {
            try {
                Notification::create([
                    'user_id' => $otherParticipantId,
                    'type' => 'message:' . $conversation->id,
                    'title' => 'Nouveau message',
                    'message' => $request->user()->name . ' vous a envoyé un message.',
                ]);
            } catch (\Throwable $e) {
                Log::error('Message notification creation failed', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Message envoyé', [
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'has_file' => $request->hasFile('file'),
        ]);

        return response()->json($message->load('sender'), 201);
    }
}
