<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Favorite;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityFixTest extends TestCase
{
    use RefreshDatabase;

    private function createStudent(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'name' => 'Student',
            'email' => 'student@test.com',
            'role' => 'student',
        ], $attributes));
        $user->studentProfile()->create([]);

        return $user;
    }

    private function createCompany(): array
    {
        $user = User::factory()->create([
            'name' => 'Company',
            'email' => 'company@test.com',
            'role' => 'company',
        ]);
        $company = Company::create(['user_id' => $user->id, 'name' => 'TestCorp']);

        return [$user, $company];
    }

    private function createInternship(Company $company): Internship
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

    public function test_banned_user_cannot_login(): void
    {
        $user = $this->createStudent(['banned_at' => now(), 'status' => 'banned']);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(403);
    }

    public function test_banned_user_token_is_rejected_on_authenticated_route(): void
    {
        $user = $this->createStudent();
        $token = $user->createToken('test')->plainTextToken;
        $user->update(['banned_at' => now(), 'status' => 'banned']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user');

        $response->assertStatus(403);
    }

    public function test_application_status_is_forced_to_pending(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;
        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", [
                'cover_letter' => 'Motivé',
                'status' => 'accepted',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('applications', [
            'internship_id' => $internship->id,
            'student_id' => $student->id,
            'status' => 'pending',
        ]);
    }

    public function test_unverified_student_cannot_apply(): void
    {
        $student = $this->createStudent(['email_verified_at' => null]);
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;
        $internship = $this->createInternship($company);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/internships/{$internship->id}/apply", ['cover_letter' => 'Motivé']);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('applications', ['internship_id' => $internship->id]);
    }

    public function test_public_list_includes_is_favorited_for_authenticated_user(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $student->createToken('test')->plainTextToken;
        $internship = $this->createInternship($company);
        Favorite::create(['student_id' => $student->id, 'internship_id' => $internship->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/internships');

        $response->assertOk();
        $this->assertTrue($response->json('data.0.is_favorited'));
    }

    public function test_user_search_does_not_expose_email_or_phone(): void
    {
        $searcher = $this->createStudent();
        $target = User::factory()->create([
            'name' => 'Findable User',
            'firstname' => 'Findable',
            'lastname' => 'User',
            'email' => 'secret@example.com',
            'phone' => '+261340000000',
            'role' => 'company',
        ]);
        $token = $searcher->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/users/search?q=Findable');

        $response->assertOk()
            ->assertJsonCount(1);
        $item = $response->json('0');
        $this->assertArrayNotHasKey('email', $item);
        $this->assertArrayNotHasKey('phone', $item);

        $byEmail = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/users/search?q=secret@example.com');
        $this->assertCount(0, $byEmail->json());
    }

    public function test_profile_views_are_scoped_to_the_student(): void
    {
        $student = $this->createStudent();
        $other = $this->createStudent(['email' => 'other@test.com']);
        ActivityLog::create(['action' => 'profile_view', 'subject_type' => User::class, 'subject_id' => $student->id]);
        ActivityLog::create(['action' => 'profile_view', 'subject_type' => User::class, 'subject_id' => $other->id]);
        $token = $student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/student/dashboard');

        $response->assertOk();
        $this->assertEquals(1, $response->json('stats.profile_views'));
    }

    public function test_cv_download_is_logged_and_serves_the_file(): void
    {
        Storage::fake('public');
        $student = $this->createStudent();
        $file = UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf');
        $path = $file->store('cvs', 'public');
        $student->studentProfile()->update(['cv_path' => $path, 'cv_uploaded_at' => now()]);

        [$companyUser, $company] = $this->createCompany();
        $token = $companyUser->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->get("/api/students/{$student->id}/cv");

        $response->assertOk();
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'cv_download',
            'subject_type' => User::class,
            'subject_id' => $student->id,
        ]);
    }

    public function test_cv_download_is_404_without_cv(): void
    {
        $student = $this->createStudent();
        [$companyUser, $company] = $this->createCompany();
        $token = $companyUser->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->get("/api/students/{$student->id}/cv");

        $response->assertStatus(404);
    }
}
