<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin()
    {
        return User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
    }

    private function createStudent()
    {
        return User::create(['name' => 'Student', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/users');

        $response->assertOk();
    }

    public function test_student_cannot_access_admin_users(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_show_user(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/admin/users/{$student->id}");

        $response->assertOk()
            ->assertJson(['email' => 'student@test.com']);
    }

    public function test_admin_can_ban_user(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/users/{$student->id}/ban");

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $student->id, 'status' => 'banned']);
    }

    public function test_admin_can_unban_user(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $student->update(['status' => 'banned', 'banned_at' => now()]);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/users/{$student->id}/unban");

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $student->id, 'status' => 'active']);
    }

    public function test_admin_cannot_ban_admin(): void
    {
        $admin = $this->createAdmin();
        $otherAdmin = User::create(['name' => 'Other Admin', 'email' => 'other@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/users/{$otherAdmin->id}/ban");

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/users/{$student->id}");

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $student->id]);
    }

    public function test_admin_cannot_delete_admin(): void
    {
        $admin = $this->createAdmin();
        $otherAdmin = User::create(['name' => 'Other Admin', 'email' => 'other@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/users/{$otherAdmin->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_reset_user_password(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/users/{$student->id}/reset-password", [
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertOk();
    }

    public function test_admin_can_update_user(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/users/{$student->id}", [
                'firstname' => 'Jean',
                'lastname' => 'Dupont',
            ]);

        $response->assertOk();
    }

    public function test_admin_can_search_users(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $this->createStudent();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/users?search=student');

        $response->assertOk();
    }
}
