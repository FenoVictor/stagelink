<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin()
    {
        return User::factory()->create(['name' => 'Admin', 'email' => 'admin@test.com', 'role' => 'admin', 'email_verified_at' => null]);
    }

    public function test_admin_can_list_audit_logs(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'login',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'browser' => 'Chrome',
            'result' => 'success',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/audit-logs');

        $response->assertOk();
    }

    public function test_admin_can_get_audit_actions(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'login',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'browser' => 'Chrome',
            'result' => 'success',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/audit-logs/actions');

        $response->assertOk();
    }

    public function test_admin_can_export_audit_logs(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/audit-logs/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_student_cannot_access_audit_logs(): void
    {
        $student = User::factory()->create(['name' => 'Student', 'email' => 'student@test.com', 'role' => 'student', 'email_verified_at' => null]);
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/audit-logs');

        $response->assertStatus(403);
    }

    public function test_audit_logs_can_filter_by_action(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'login',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'browser' => 'Chrome',
            'result' => 'success',
        ]);

        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'logout',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'browser' => 'Chrome',
            'result' => 'success',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/audit-logs?action=login');

        $response->assertOk();
    }
}
