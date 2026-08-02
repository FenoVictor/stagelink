<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GDPRTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        $user = User::create(['name' => 'Student', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
        $user->studentProfile()->create([]);
        return $user;
    }

    public function test_user_can_get_data_info(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/gdpr/data-info');

        $response->assertOk()
            ->assertJsonStructure(['retention', 'your_data', 'rights']);
    }

    public function test_user_can_export_data(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/gdpr/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function test_delete_requires_confirmation(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/gdpr/delete-account', [
                'password' => 'password',
                'confirmation' => 'WRONG',
            ]);

        $response->assertStatus(422);
    }

    public function test_delete_requires_password(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/gdpr/delete-account', [
                'confirmation' => 'SUPPRIMER',
            ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_export(): void
    {
        $response = $this->getJson('/api/gdpr/export');

        $response->assertStatus(401);
    }
}
