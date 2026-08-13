<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'student',
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a student.
     */
    public function asStudent(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'student',
        ]);
    }

    /**
     * Indicate that the user is a company account.
     */
    public function asCompany(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'company',
        ]);
    }

    /**
     * Indicate that the user is an administrator.
     */
    public function asAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Create the student profile alongside the user (mirrors the register flow).
     */
    public function withStudentProfile(): static
    {
        return $this->afterCreating(function (User $user) {
            StudentProfile::firstOrCreate(['user_id' => $user->id]);
        });
    }

    /**
     * Create the company profile alongside the user (mirrors the register flow).
     */
    public function withCompany(array $attributes = []): static
    {
        return $this->afterCreating(function (User $user) use ($attributes) {
            Company::firstOrCreate(array_merge(['user_id' => $user->id, 'name' => $user->name], $attributes));
        });
    }
}
