<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Internship;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InterviewTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        return User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student', 'email_verified_at' => null]);
    }

    private function createCompany()
    {
        $user = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);

        return [$user, $company];
    }

    public function test_company_can_create_interview(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $student = $this->createStudent();
        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/interviews', [
                'application_id' => $application->id,
                'date' => now()->addDays(7)->toDateTimeString(),
                'meeting_link' => 'https://meet.example.com/abc',
                'location' => 'Toliara',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('interviews', [
            'application_id' => $application->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_student_cannot_create_interview(): void
    {
        $student = $this->createStudent();
        $token = $student->createToken('test')->plainTextToken;

        [$user, $company] = $this->createCompany();
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/interviews', [
                'application_id' => $application->id,
                'date' => now()->addDays(7)->toDateTimeString(),
            ]);

        $response->assertStatus(403);
    }

    public function test_company_can_update_interview(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $student = $this->createStudent();
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $interview = Interview::create([
            'application_id' => $application->id,
            'date' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/company/interviews/{$interview->id}", [
                'status' => 'completed',
                'notes' => 'Bon entretien',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('interviews', ['id' => $interview->id, 'status' => 'completed']);
    }

    public function test_student_can_list_interviews(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        Interview::create([
            'application_id' => $application->id,
            'date' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/interviews');

        $response->assertOk();
    }

    public function test_interview_past_date_returns_422(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $student = $this->createStudent();
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/interviews', [
                'application_id' => $application->id,
                'date' => now()->subDays(1)->toDateTimeString(),
            ]);

        $response->assertStatus(422);
    }
}
