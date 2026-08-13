<?php

namespace Tests\Feature;

use App\Mail\ForgotPassword;
use App\Models\LoginLog;
use App\Models\PasswordResetToken;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class SecurityFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'name' => 'Jean Dupont',
            'firstname' => 'Jean',
            'lastname' => 'Dupont',
            'email' => 'jean@test.com',
            'role' => 'student',
        ], $attributes));
    }

    private function enable2fa(User $user, string $token): array
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/2fa/enable');

        $response->assertOk();

        return $response->json();
    }

    private function confirm2fa(User $user, string $token, string $secret): void
    {
        $otp = app(Google2FA::class)->getCurrentOtp($secret);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/2fa/confirm', ['code' => $otp])
            ->assertOk();
    }

    public function test_two_factor_enable_returns_secret_and_recovery_codes(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $data = $this->enable2fa($user, $token);

        $this->assertArrayHasKey('secret', $data);
        $this->assertArrayHasKey('otpauth_url', $data);
        $this->assertStringStartsWith('otpauth://', $data['otpauth_url']);
        $this->assertCount(8, $data['recovery_codes']);
        $this->assertNotNull($user->fresh()->two_factor_secret);
    }

    public function test_two_factor_status_defaults_to_disabled(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/2fa/status');

        $response->assertOk()
            ->assertJson(['enabled' => false]);
    }

    public function test_two_factor_confirm_rejects_wrong_code(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $this->enable2fa($user, $token);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/2fa/confirm', ['code' => '000000']);

        $response->assertStatus(422);
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_two_factor_confirm_with_valid_code_enables(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);

        $this->confirm2fa($user, $token, $data['secret']);

        $this->assertNotNull($user->fresh()->two_factor_confirmed_at);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/2fa/status')
            ->assertJson(['enabled' => true]);
    }

    public function test_login_requires_2fa_when_enabled(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);
        $this->confirm2fa($user, $token, $data['secret']);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJson(['requires_2fa' => true]);
        $tempToken = $login->json('temp_token');
        $this->assertNotNull($tempToken);

        $otp = app(Google2FA::class)->getCurrentOtp($data['secret']);
        $verify = $this->withHeader('Authorization', 'Bearer '.$tempToken)
            ->postJson('/api/2fa/verify', ['code' => $otp]);

        $verify->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $finalToken = $verify->json('token');
        $this->withHeader('Authorization', 'Bearer '.$finalToken)
            ->getJson('/api/user')
            ->assertOk();
    }

    public function test_2fa_login_rejects_invalid_code(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);
        $this->confirm2fa($user, $token, $data['secret']);

        $tempToken = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('temp_token');

        $this->withHeader('Authorization', 'Bearer '.$tempToken)
            ->postJson('/api/2fa/verify', ['code' => '000000'])
            ->assertStatus(422);
    }

    public function test_2fa_login_with_recovery_code(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);
        $this->confirm2fa($user, $token, $data['secret']);
        $recoveryCode = $data['recovery_codes'][0];

        $tempToken = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('temp_token');

        $response = $this->withHeader('Authorization', 'Bearer '.$tempToken)
            ->postJson('/api/2fa/verify', ['code' => $recoveryCode]);

        $response->assertOk();
        $this->assertNotNull($response->json('token'));

        $remaining = $this->withHeader('Authorization', 'Bearer '.$response->json('token'))
            ->getJson('/api/2fa/status')
            ->json('recovery_codes');
        $this->assertCount(7, $remaining);
        $this->assertNotContains($recoveryCode, $remaining);
    }

    public function test_two_factor_disable_requires_password_and_code(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);
        $this->confirm2fa($user, $token, $data['secret']);
        $otp = app(Google2FA::class)->getCurrentOtp($data['secret']);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/2fa/disable', ['code' => $otp, 'password' => 'password']);

        $response->assertOk();
        $fresh = $user->fresh();
        $this->assertNull($fresh->two_factor_secret);
        $this->assertNull($fresh->two_factor_recovery_codes);
        $this->assertNull($fresh->two_factor_confirmed_at);
    }

    public function test_two_factor_disable_rejects_wrong_password(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $data = $this->enable2fa($user, $token);
        $this->confirm2fa($user, $token, $data['secret']);
        $otp = app(Google2FA::class)->getCurrentOtp($data['secret']);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/2fa/disable', ['code' => $otp, 'password' => 'wrong'])
            ->assertStatus(422);

        $this->assertNotNull($user->fresh()->two_factor_secret);
    }

    public function test_create_api_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/tokens', ['name' => 'CI Deployment']);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'token', 'expires_at']);
        $this->assertNotNull($response->json('expires_at'));
        $this->assertEquals('CI Deployment', $response->json('name'));
    }

    public function test_list_api_tokens_marks_current(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $user->createToken('other');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/tokens');

        $response->assertOk()
            ->assertJsonCount(2);
        $current = collect($response->json())->firstWhere('is_current', true);
        $this->assertNotNull($current);
    }

    public function test_revoke_api_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;
        $other = $user->createToken('revokable');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson("/api/tokens/{$other->accessToken->id}")
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $other->accessToken->id]);

        Auth::forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$other->plainTextToken)
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    public function test_rotate_api_token_revokes_all_previous(): void
    {
        $user = $this->createUser();
        $oldToken = $user->createToken('old')->plainTextToken;
        $user->createToken('another');

        $response = $this->withHeader('Authorization', 'Bearer '.$oldToken)
            ->postJson('/api/tokens/rotate');

        $response->assertOk()
            ->assertJsonStructure(['token', 'expires_at']);

        $this->assertEquals(1, $user->tokens()->count());

        Auth::forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$oldToken)
            ->getJson('/api/user')
            ->assertStatus(401);

        Auth::forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$response->json('token'))
            ->getJson('/api/user')
            ->assertOk();
    }

    public function test_revoke_unknown_token_returns_404(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/tokens/999999')
            ->assertStatus(404);
    }

    public function test_login_success_is_logged(): void
    {
        $this->createUser();

        $this->postJson('/api/login', [
            'email' => 'jean@test.com',
            'password' => 'password',
        ])->assertOk();

        $this->assertDatabaseHas('login_logs', [
            'email' => 'jean@test.com',
            'success' => true,
            'failure_reason' => null,
        ]);
    }

    public function test_failed_login_is_logged_with_reason(): void
    {
        $this->createUser();

        $this->postJson('/api/login', [
            'email' => 'jean@test.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);

        $this->assertDatabaseHas('login_logs', [
            'email' => 'jean@test.com',
            'success' => false,
        ]);
    }

    public function test_suspicious_login_detected_on_user_agent_change(): void
    {
        $this->createUser();

        $this->withHeader('User-Agent', 'FirstBrowser/1.0')
            ->postJson('/api/login', ['email' => 'jean@test.com', 'password' => 'password'])
            ->assertOk();

        $this->withHeader('User-Agent', 'SuspiciousClient/9.9')
            ->postJson('/api/login', ['email' => 'jean@test.com', 'password' => 'password'])
            ->assertOk();

        $latest = LoginLog::where('email', 'jean@test.com')->orderByDesc('created_at')->first();
        $this->assertTrue($latest->suspicious);
    }

    public function test_admin_can_view_login_logs(): void
    {
        $admin = $this->createUser(['email' => 'admin@test.com', 'role' => 'admin']);
        $adminToken = $admin->createToken('test')->plainTextToken;
        LoginLog::create([
            'email' => 'someone@test.com',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'UA',
            'success' => true,
            'suspicious' => false,
            'created_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->getJson('/api/admin/login-logs');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_non_admin_cannot_view_login_logs(): void
    {
        $student = $this->createUser();
        $token = $student->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/login-logs')
            ->assertStatus(403);
    }

    public function test_forgot_password_creates_token_and_queues_email(): void
    {
        Mail::fake();
        $this->createUser();

        $response = $this->postJson('/api/forgot-password', ['email' => 'jean@test.com']);

        $response->assertOk();
        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'jean@test.com']);
        Mail::assertQueued(ForgotPassword::class);
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user = $this->createUser();
        $user->createToken('old')->plainTextToken;
        $plainToken = Str::random(64);
        PasswordResetToken::create([
            'email' => $user->email,
            'token' => Hash::make($plainToken),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $plainToken,
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('newpassword', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/reset-password', [
            'email' => 'jean@test.com',
            'token' => 'invalid-token',
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertStatus(400);
    }

    public function test_reset_password_rejects_expired_token(): void
    {
        $user = $this->createUser();
        PasswordResetToken::create([
            'email' => $user->email,
            'token' => Hash::make('expired-token'),
            'created_at' => now()->subHours(2),
        ]);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => 'expired-token',
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ])->assertStatus(400);

        $this->assertFalse(Hash::check('newpassword', $user->fresh()->password));
    }

    public function test_email_verification_via_signed_url(): void
    {
        $user = $this->createUser(['email_verified_at' => null]);

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->getJson($url)->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_rejects_wrong_hash(): void
    {
        $user = $this->createUser(['email_verified_at' => null]);

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1('wrong@email.com'),
        ]);

        $this->getJson($url)->assertStatus(400);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_verification_email(): void
    {
        Notification::fake();
        $user = $this->createUser(['email_verified_at' => null]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/email/verification/send');

        $response->assertOk();
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_resend_verification_email_noop_when_verified(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/email/verification/send')
            ->assertOk()
            ->assertJson(['message' => 'Email déjà vérifié.']);
    }
}
