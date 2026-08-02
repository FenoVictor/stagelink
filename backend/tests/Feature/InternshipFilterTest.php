<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Company;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternshipFilterTest extends TestCase
{
    use RefreshDatabase;

    private function createCompany()
    {
        $user = User::create(['name' => 'Company', 'email' => 'company@test.com', 'password' => bcrypt('password'), 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);
        return $company;
    }

    public function test_filter_by_type(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Remote',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Onsite',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'onsite',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships?type=remote');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_filter_by_location(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Toliara',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Tana',
            'description' => 'Description',
            'location' => 'Antananarivo',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships?location=Toliara');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_filter_by_keyword(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Laravel',
            'description' => 'Développement web avec Laravel',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stagiaire Marketing',
            'description' => 'Marketing digital',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships?keyword=Laravel');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_draft_internships_not_listed(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Brouillon',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/internships');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_sort_by_salary(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage 500k',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'salary' => 500000,
            'status' => 'published',
        ]);

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage 1M',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'salary' => 1000000,
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships?sort=salary&order=desc');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_filters_endpoint_returns_options(): void
    {
        $company = $this->createCompany();

        Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'study_level' => 'Bac+3',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/internships/filters');

        $response->assertOk()
            ->assertJsonStructure(['locations', 'durations', 'study_levels']);
    }
}
