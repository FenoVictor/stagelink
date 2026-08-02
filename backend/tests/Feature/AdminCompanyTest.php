<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCompanyTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin()
    {
        return User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
    }

    private function createCompany()
    {
        $user = User::create(['name' => 'Company', 'email' => 'company@test.com', 'password' => bcrypt('password'), 'role' => 'company']);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);
        return [$user, $company];
    }

    public function test_admin_can_list_companies(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/companies');

        $response->assertOk();
    }

    public function test_admin_can_validate_company(): void
    {
        $admin = $this->createAdmin();
        [$user, $company] = $this->createCompany();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/companies/{$company->id}/validate");

        $response->assertOk();
        $this->assertDatabaseHas('companies', ['id' => $company->id, 'status' => 'validated']);
        $this->assertNotNull($company->fresh()->verified_at);
    }

    public function test_admin_can_suspend_company(): void
    {
        $admin = $this->createAdmin();
        [$user, $company] = $this->createCompany();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/companies/{$company->id}/suspend");

        $response->assertOk();
        $this->assertDatabaseHas('companies', ['id' => $company->id, 'status' => 'suspended']);
    }

    public function test_admin_can_reactivate_company(): void
    {
        $admin = $this->createAdmin();
        [$user, $company] = $this->createCompany();
        $company->update(['status' => 'suspended']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/admin/companies/{$company->id}/reactivate");

        $response->assertOk();
        $this->assertDatabaseHas('companies', ['id' => $company->id, 'status' => 'validated']);
    }

    public function test_admin_can_delete_company(): void
    {
        $admin = $this->createAdmin();
        [$user, $company] = $this->createCompany();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/companies/{$company->id}");

        $response->assertOk();
        $this->assertSoftDeleted('companies', ['id' => $company->id]);
    }

    public function test_student_cannot_access_admin_companies(): void
    {
        $student = User::create(['name' => 'Student', 'email' => 'student@test.com', 'password' => bcrypt('password'), 'role' => 'student']);
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/companies');

        $response->assertStatus(403);
    }
}
