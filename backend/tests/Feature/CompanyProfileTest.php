<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyProfileTest extends TestCase
{
    use RefreshDatabase;

    private function createCompany()
    {
        $user = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);

        return $user;
    }

    public function test_company_can_get_profile(): void
    {
        $user = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/company/profile');

        $response->assertOk()
            ->assertJson(['name' => 'TestCorp']);
    }

    public function test_company_can_update_profile(): void
    {
        $user = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/profile', [
                'name' => 'Updated Corp',
                'description' => 'Nouvelle description',
                'website' => 'https://example.com',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('companies', ['user_id' => $user->id, 'name' => 'Updated Corp']);
    }

    public function test_student_cannot_access_company_profile(): void
    {
        $student = User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student', 'email_verified_at' => null]);
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/company/profile');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_company_profile(): void
    {
        $response = $this->getJson('/api/company/profile');

        $response->assertStatus(401);
    }

    public function test_invalid_website_url_returns_422(): void
    {
        $user = $this->createCompany();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/company/profile', [
                'website' => 'not-a-url',
            ]);

        $response->assertStatus(422);
    }
}
