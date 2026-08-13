<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Internship;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent()
    {
        $user = User::factory()->create(['name' => 'Student', 'email' => 'notif@test.com', 'role' => 'student']);

        return $user;
    }

    public function test_user_can_list_notifications(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $notif = Notification::create([
            'user_id' => $user->id,
            'type' => 'application',
            'title' => 'Test',
            'message' => 'Test notification',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/notifications');

        $response->assertOk();
        $this->assertDatabaseHas('notifications', ['id' => $notif->id, 'user_id' => $user->id]);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        $notif = Notification::create([
            'user_id' => $user->id,
            'type' => 'application',
            'title' => 'Test',
            'message' => 'Test notification',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson("/api/notifications/{$notif->id}/read");

        $response->assertOk();
        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_user_can_mark_all_as_read(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;

        Notification::create(['user_id' => $user->id, 'type' => 'application', 'title' => 'N1', 'message' => 'msg1']);
        Notification::create(['user_id' => $user->id, 'type' => 'application', 'title' => 'N2', 'message' => 'msg2']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/notifications/read-all');

        $response->assertOk();
        $this->assertEquals(0, Notification::where('user_id', $user->id)->whereNull('read_at')->count());
    }

    public function test_application_creates_notification_for_company(): void
    {
        $student = $this->createStudent();
        $companyUser = User::factory()->create(['name' => 'Company', 'email' => 'comp@test.com', 'role' => 'company', 'email_verified_at' => null]);
        $company = Company::create(['user_id' => $companyUser->id, 'name' => 'TestCorp']);
        $internship = Internship::create([
            'company_id' => $company->id,
            'title' => 'Stage Test',
            'description' => 'Description',
            'location' => 'Toliara',
            'type' => 'remote',
            'duration' => '3 mois',
            'status' => 'published',
        ]);

        $token = $student->createToken('test')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Motivé']);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $companyUser->id,
            'type' => 'application',
        ]);
    }
}
