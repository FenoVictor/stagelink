<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Internship;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        return User::create(['name' => 'Student', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
    }

    private function createCompany()
    {
        $user = User::create(['name' => 'Company', 'email' => 'company@test.com', 'password' => bcrypt('password'), 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);
        return [$user, $company];
    }

    private function createConversationWithParticipants(User $student, User $companyUser): Conversation
    {
        $conversation = Conversation::create([
            'student_id' => $student->id,
            'company_id' => $companyUser->id,
        ]);

        ConversationParticipant::create(['conversation_id' => $conversation->id, 'user_id' => $student->id]);
        ConversationParticipant::create(['conversation_id' => $conversation->id, 'user_id' => $companyUser->id]);

        return $conversation;
    }

    public function test_user_can_list_conversations(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $conversation = Conversation::create([
            'student_id' => $student->id,
            'company_id' => $companyUser->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/conversations');

        $response->assertOk();
    }

    public function test_user_can_create_conversation(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/conversations', [
                'recipient_id' => $companyUser->id,
                'message' => 'Bonjour, je suis intéressé par votre offre.',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('conversations', [
            'student_id' => $student->id,
            'company_id' => $companyUser->id,
        ]);
        $this->assertDatabaseHas('messages', [
            'message' => 'Bonjour, je suis intéressé par votre offre.',
            'sender_id' => $student->id,
        ]);
    }

    public function test_user_can_view_conversation(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $conversation = $this->createConversationWithParticipants($student, $companyUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/conversations/{$conversation->id}");

        $response->assertOk();
    }

    public function test_cannot_view_others_conversation(): void
    {
        $student = $this->createStudent();
        $otherStudent = User::create(['name' => 'Other', 'email' => 'other@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
        [$companyUser, $company] = $this->createCompany();
        $token = $otherStudent->createToken('test')->plainTextToken;

        $conversation = $this->createConversationWithParticipants($student, $companyUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/conversations/{$conversation->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_send_message(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $conversation = $this->createConversationWithParticipants($student, $companyUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'message' => 'Merci pour votre réponse.',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $student->id,
            'message' => 'Merci pour votre réponse.',
        ]);
    }

    public function test_user_can_list_messages(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $conversation = $this->createConversationWithParticipants($student, $companyUser);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $student->id,
            'message' => 'Hello',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_empty_message_returns_422(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $conversation = $this->createConversationWithParticipants($student, $companyUser);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/conversations/{$conversation->id}/messages", []);

        $response->assertStatus(422);
    }
}
