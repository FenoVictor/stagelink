<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_internship_list(): void
    {
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp']);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Public',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_public_internship_detail_increments_views(): void
    {
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp']);

        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage View',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
            'views_count' => 0,
        ]);

        $this->getJson("/api/internships/{$internship->id}");
        $this->getJson("/api/internships/{$internship->id}");

        $this->assertDatabaseHas('internships', ['id' => $internship->id, 'views_count' => 2]);
    }

    public function test_public_company_page(): void
    {
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp', 'status' => 'validated']);

        $response = $this->getJson("/api/companies/{$company->id}");

        $response->assertOk()
            ->assertJsonPath('name', 'TestCorp');
    }

    public function test_unvalidated_company_returns_404(): void
    {
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'company@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp', 'status' => 'pending']);

        $response = $this->getJson("/api/companies/{$company->id}");

        $response->assertStatus(404);
    }

    public function test_public_categories(): void
    {
        Category::create(['name' => 'Informatique', 'slug' => 'informatique']);
        Category::create(['name' => 'Marketing', 'slug' => 'marketing']);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(2);
    }
}
