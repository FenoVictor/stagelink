<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'firstname' => 'Jean',
            'lastname' => 'Dupont',
            'email' => 'jean@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token'])
            ->assertJson(['user' => ['email' => 'jean@example.com', 'role' => 'student']]);

        $this->assertDatabaseHas('users', ['email' => 'jean@example.com', 'role' => 'student']);
        $this->assertDatabaseHas('student_profiles', ['user_id' => User::where('email', 'jean@example.com')->first()->id]);
    }

    public function test_company_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'firstname' => 'Marie',
            'lastname' => 'Martin',
            'email' => 'marie@company.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'company',
            'company_name' => 'TechCorp',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'marie@company.com', 'role' => 'company']);
        $this->assertDatabaseHas('companies', ['name' => 'TechCorp']);
    }

    public function test_register_requires_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['firstname', 'lastname', 'email', 'password', 'role']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['name' => 'Test', 'email' => 'dup@example.com', 'role' => 'student', 'email_verified_at' => null]);

        $response = $this->postJson('/api/register', [
            'firstname' => 'Test',
            'lastname' => 'User',
            'email' => 'dup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create(['name' => 'Login Test', 'email' => 'login@test.com', 'password' => 'password123', 'role' => 'student', 'email_verified_at' => null]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@test.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create(['name' => 'Test', 'email' => 'wrong@test.com', 'password' => 'password123', 'role' => 'student', 'email_verified_at' => null]);

        $response = $this->postJson('/api/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['name' => 'Logout Test', 'email' => 'logout@test.com', 'password' => 'password123', 'role' => 'student', 'email_verified_at' => null]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout');

        $response->assertOk();
    }

    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create(['name' => 'Profile Test', 'email' => 'profile@test.com', 'password' => 'password123', 'role' => 'student', 'email_verified_at' => null]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user');

        $response->assertOk()
            ->assertJson(['email' => 'profile@test.com']);
    }

    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_gets_401_without_json_accept_header(): void
    {
        $response = $this->get('/api/user', ['Accept' => '*/*']);

        $response->assertStatus(401);
    }

    public function test_invalid_token_gets_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid.token.value')
            ->get('/api/user', ['Accept' => '*/*']);

        $response->assertStatus(401);
    }

    public function test_error_responses_include_cors_headers(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $response = $this->getJson('/api/user', ['Origin' => $origin]);

        $response->assertStatus(401)
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
