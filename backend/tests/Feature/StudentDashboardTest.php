<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        $user = User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student', 'email_verified_at' => null]);
        $user->studentProfile()->create([]);

        return $user;
    }

    public function test_student_can_get_dashboard(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/student/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'completion',
                'missing_steps',
                'achieved_steps',
                'stats',
                'recommendations',
                'badges',
                'tip',
            ]);
    }

    public function test_empty_profile_has_0_completion(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/student/dashboard');

        $response->assertOk()
            ->assertJsonPath('completion', 0);
    }

    public function test_full_profile_has_higher_completion(): void
    {
        $student = $this->createStudent();
        $student->studentProfile()->update([
            'bio' => 'Développeur passionné',
            'school' => 'Université de Toliara',
            'major' => 'Informatique',
            'phone' => '+261341234567',
        ]);
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/student/dashboard');

        $response->assertOk();
        $this->assertGreaterThan(0, $response->json('completion'));
    }

    public function test_company_cannot_access_student_dashboard(): void
    {
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $token = $companyUser->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/student/dashboard');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/student/dashboard');

        $response->assertStatus(401);
    }
}
