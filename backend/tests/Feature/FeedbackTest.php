<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role = 'admin', string $email = 'feedback@test.com')
    {
        return User::create(['name' => 'User', 'email' => $email, 'password' => bcrypt('password'), 'role' => $role]);
    }

    public function test_guest_can_submit_feedback(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/feedback', [
            'type' => 'feature',
            'message' => 'Ajouter un calendrier pour voir les dates limites des offres.',
            'rating' => 5,
            'name' => 'Victor',
            'email' => 'victor@example.com',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('feedbacks', [
            'type' => 'feature',
            'rating' => 5,
            'name' => 'Victor',
            'email' => 'victor@example.com',
            'status' => 'new',
        ]);
    }

    public function test_authenticated_user_is_automatically_identified(): void
    {
        Mail::fake();
        $user = $this->createUser('student', 'student@test.com');
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/feedback', [
                'type' => 'improvement',
                'message' => 'Ceci est un message suffisamment long pour passer la validation.',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('feedbacks', [
            'user_id' => $user->id,
            'type' => 'improvement',
            'name' => 'User',
            'email' => 'student@test.com',
        ]);
    }

    public function test_message_validation_fails_when_too_short(): void
    {
        $response = $this->postJson('/api/feedback', [
            'type' => 'bug',
            'message' => 'court',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_invalid_type_rejected(): void
    {
        $response = $this->postJson('/api/feedback', [
            'type' => 'not-a-type',
            'message' => 'Message valide suffisamment long.',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_admin_can_list_feedback(): void
    {
        $admin = $this->createUser();
        $token = $admin->createToken('test')->plainTextToken;

        Feedback::create(['type' => 'feature', 'message' => 'Premier retour très intéressant sur la plateforme.', 'status' => 'new']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/feedback');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_update_feedback_status_and_note(): void
    {
        $admin = $this->createUser();
        $token = $admin->createToken('test')->plainTextToken;

        $feedback = Feedback::create(['type' => 'bug', 'message' => 'Bug détecté dans la recherche de la page d accueil.', 'status' => 'new']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/feedback/{$feedback->id}", [
                'status' => 'in_progress',
                'admin_note' => 'À corriger rapidement.',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('feedbacks', [
            'id' => $feedback->id,
            'status' => 'in_progress',
            'admin_note' => 'À corriger rapidement.',
        ]);
    }

    public function test_admin_can_get_feedback_stats(): void
    {
        $admin = $this->createUser();
        $token = $admin->createToken('test')->plainTextToken;

        Feedback::create(['type' => 'feature', 'message' => 'Premier retour utilisateur sur la plateforme.', 'rating' => 5, 'status' => 'new']);
        Feedback::create(['type' => 'bug', 'message' => 'Second retour signalant un bug rencontré.', 'rating' => 3, 'status' => 'done']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/feedback/stats');

        $response->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('by_status.new', 1)
            ->assertJsonPath('by_status.done', 1)
            ->assertJsonPath('by_type.feature', 1)
            ->assertJsonPath('average_rating', 4);
    }

    public function test_non_admin_cannot_access_feedback_admin_routes(): void
    {
        $student = $this->createUser('student', 'student2@test.com');
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/feedback');

        $response->assertForbidden();
    }
}
