<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present(): void
    {
        $response = $this->getJson('/api/internships');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    public function test_hsts_header_is_present(): void
    {
        $response = $this->getJson('/api/internships');

        $response->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    public function test_csp_header_is_present(): void
    {
        $response = $this->getJson('/api/internships');

        $response->assertHeader('Content-Security-Policy');
    }

    public function test_health_endpoint_returns_200(): void
    {
        $response = $this->get('/up');

        $response->assertOk();
    }

    public function test_login_returns_429_when_throttled(): void
    {
        User::factory()->create(['name' => 'Test', 'email' => 'throttle@test.com', 'role' => 'student', 'email_verified_at' => null]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'throttle@test.com',
                'password' => 'wrongpassword',
            ]);
        }

        $response = $this->postJson('/api/login', [
            'email' => 'throttle@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429);
    }
}
