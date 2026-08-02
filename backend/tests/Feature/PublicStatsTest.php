<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_get_stats(): void
    {
        $user = User::create(['name' => 'Student', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
        $user->studentProfile()->create(['bio' => 'Test', 'school' => 'Université', 'major' => 'Info', 'phone' => '+261341234567']);

        $companyUser = User::create(['name' => 'Company', 'email' => 'company@test.com', 'password' => bcrypt('password'), 'role' => 'company']);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp', 'status' => 'validated']);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/stats');

        $response->assertOk()
            ->assertJsonStructure(['internships', 'students', 'companies', 'placement']);
    }

    public function test_stats_count_published_internships(): void
    {
        $companyUser = User::create(['name' => 'Company', 'email' => 'company@test.com', 'password' => bcrypt('password'), 'role' => 'company']);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp']);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage 1',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage 2',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/stats');

        $response->assertOk()
            ->assertJsonPath('internships', 1);
    }
}
