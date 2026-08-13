<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternshipTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        $user = User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student']);

        return $user;
    }

    private function createCompany()
    {
        $user = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);

        return [$user, $company];
    }

    public function test_public_can_list_internships(): void
    {
        [$user, $company] = $this->createCompany();
        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Dev',
            'description' => 'Poste de développeur',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_public_can_view_internship_detail(): void
    {
        [$user, $company] = $this->createCompany();
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Dev',
            'description' => 'Description du stage',
            'location' => 'Toliara',
            'type' => 'hybrid',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson("/api/internships/{$internship->id}");

        $response->assertOk()
            ->assertJsonPath('internship.title', 'Stagiaire Dev');
    }

    public function test_company_can_create_internship(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/internships', [
                'title' => 'Nouveau Stage',
                'description' => 'Description du stage',
                'requirements' => 'Prérequis',
                'location' => 'Toliara',
                'type' => 'remote',
                'duration' => '3 mois',
                'study_level' => 'Bac+3',
                'salary' => 500000,
                'slots' => 2,
                'deadline' => '2026-12-31',
                'status' => 'published',
            ]);

        $response->assertStatus(201)
            ->assertJson(['title' => 'Nouveau Stage']);

        $this->assertDatabaseHas('internships', ['title' => 'Nouveau Stage']);
    }

    public function test_company_can_update_internship(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Ancien titre',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/company/internships/{$internship->id}", [
                'title' => 'Nouveau titre',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('internships', ['id' => $internship->id, 'title' => 'Nouveau titre']);
    }

    public function test_company_can_delete_internship(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'À supprimer',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/company/internships/{$internship->id}");

        $response->assertOk();
        $this->assertNotNull($internship->fresh()->deleted_at);
    }

    public function test_student_can_apply_to_internship(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Ouvert',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cover_letter' => 'Je suis très motivé pour ce stage.',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('applications', [
            'internship_id' => $internship->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_student_cannot_apply_twice(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Première candidature']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Deuxième candidature']);

        $response->assertStatus(409);
    }

    public function test_internship_search_by_keyword(): void
    {
        [$user, $company] = $this->createCompany();
        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Laravel',
            'description' => 'Développement web avec Laravel et PHP',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);
        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Marketing',
            'description' => 'Marketing digital et réseaux sociaux',
            'location' => 'Antananarivo',
            'type' => 'onsite',
            'duration' => '2 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships?keyword=Laravel');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
