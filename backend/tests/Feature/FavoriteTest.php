<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Favorite;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteTest extends TestCase
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

    private function createInternship($company)
    {
        return Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Dev',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);
    }

    public function test_student_can_list_favorites(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        Favorite::create(['student_id' => $student->id, 'internship_id' => $internship->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/favorites');

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_student_can_favorite_internship(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/internships/{$internship->id}/favorite");

        $response->assertOk()
            ->assertJson(['favorited' => true]);

        $this->assertDatabaseHas('favorites', [
            'student_id' => $student->id,
            'internship_id' => $internship->id,
        ]);
    }

    public function test_favorite_toggle_removes_existing(): void
    {
        $student = $this->createStudent();
        [$user, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);
        Favorite::create(['student_id' => $student->id, 'internship_id' => $internship->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/internships/{$internship->id}/favorite");

        $response->assertOk()
            ->assertJson(['favorited' => false]);

        $this->assertDatabaseMissing('favorites', [
            'student_id' => $student->id,
            'internship_id' => $internship->id,
        ]);
    }

    public function test_unauthenticated_cannot_list_favorites(): void
    {
        $response = $this->getJson('/api/favorites');

        $response->assertStatus(401);
    }

    public function test_company_cannot_favorite(): void
    {
        [$user, $company] = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/internships/{$internship->id}/favorite");

        $response->assertStatus(403);
    }
}
