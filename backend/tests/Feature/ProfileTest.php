<?php

namespace Tests\Feature;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        $user = User::factory()->create(['name' => 'Student', 'email' => 'profile@test.com', 'role' => 'student', 'email_verified_at' => null]);
        $user->studentProfile()->create([]);

        return $user;
    }

    public function test_student_can_get_profile(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/profile');

        $response->assertOk()
            ->assertJson(['email' => 'profile@test.com']);
    }

    public function test_student_can_update_profile(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/profile', [
                'firstname' => 'Jean',
                'lastname' => 'Dupont',
                'phone' => '+261341234567',
                'bio' => 'Développeur passionné',
                'school' => 'Université de Toliara',
                'major' => 'Informatique',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'bio' => 'Développeur passionné',
            'school' => 'Université de Toliara',
        ]);
    }

    public function test_student_can_update_skills(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $skill1 = Skill::create(['name' => 'PHP']);
        $skill2 = Skill::create(['name' => 'Laravel']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/profile', [
                'skills' => [
                    ['id' => $skill1->id, 'level' => 'Avancé'],
                    ['id' => $skill2->id, 'level' => 'Débutant'],
                ],
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('student_skills', ['student_id' => $user->id, 'skill_id' => $skill1->id, 'level' => 'Avancé']);
        $this->assertDatabaseHas('student_skills', ['student_id' => $user->id, 'skill_id' => $skill2->id, 'level' => 'Débutant']);
    }

    public function test_student_can_upload_cv(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $cv = UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/profile', [
                'cv' => $cv,
            ]);

        $response->assertOk();
        $this->assertNotNull($user->fresh()->studentProfile->cv_path);
    }

    public function test_unauthenticated_cannot_access_profile(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    public function test_company_cannot_access_student_profile(): void
    {
        $company = User::factory()->create(['name' => 'Company', 'email' => 'co@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $token = $company->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/profile');

        $response->assertStatus(403);
    }
}
