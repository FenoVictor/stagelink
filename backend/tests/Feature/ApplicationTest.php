<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        return User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student']);
    }

    private function createCompany()
    {
        $user = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);

        return [$user, $company];
    }

    private function createInternship($company)
    {
        return Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Dev',
            'description' => 'Description du stage',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);
    }

    public function test_student_can_list_own_applications(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/applications');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_student_can_apply_with_cover_letter(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cover_letter' => 'Je suis très motivé.',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('applications', [
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'cover_letter' => 'Je suis très motivé.',
        ]);
    }

    public function test_student_can_apply_with_cv_upload(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        $cv = UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cv' => $cv,
                'cover_letter' => 'Avec CV',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('applications', [
            'internship_id' => $internship->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_company_cannot_apply(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cover_letter' => 'Test',
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_apply(): void
    {
        [$user, $company] = $this->createCompany();
        $internship = $this->createInternship($company);

        $response = $this->postJson("/api/internships/{$internship->id}/apply", [
            'cover_letter' => 'Test',
        ]);

        $response->assertStatus(401);
    }

    public function test_application_creates_notification_for_company(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cover_letter' => 'Motivé',
            ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $companyUser->id,
            'type' => 'application',
        ]);
    }

    public function test_duplicate_application_returns_409(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Première']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Deuxième']);

        $response->assertStatus(409);
    }

    public function test_company_can_view_internship_applications(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        $student = $this->createStudent();
        Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/company/internships/{$internship->id}/applications");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_company_can_update_application_status(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        $student = $this->createStudent();
        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/company/applications/{$application->id}", [
                'status' => 'accepted',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'status' => 'accepted']);
    }

    public function test_status_change_creates_notification_for_student(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        $student = $this->createStudent();
        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/company/applications/{$application->id}", [
                'status' => 'accepted',
            ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $student->id,
            'type' => 'application',
        ]);
    }

    public function test_invalid_status_returns_422(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        $student = $this->createStudent();
        $application = Application::create([
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/company/applications/{$application->id}", [
                'status' => 'invalid_status',
            ]);

        $response->assertStatus(422);
    }
}
