<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin()
    {
        return User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password'), 'role' => 'admin']);
    }

    public function test_admin_can_list_categories(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        Category::create(['name' => 'Informatique', 'slug' => 'informatique']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/categories');

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_admin_can_create_category(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/categories', [
                'name' => 'Marketing',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('categories', ['name' => 'Marketing', 'slug' => 'marketing']);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $category = Category::create(['name' => 'Old Name', 'slug' => 'old-name']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/categories/{$category->id}", [
                'name' => 'New Name',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name', 'slug' => 'new-name']);
    }

    public function test_admin_can_delete_category(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $category = Category::create(['name' => 'To Delete', 'slug' => 'to-delete']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/categories/{$category->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_duplicate_name_returns_422(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        Category::create(['name' => 'Informatique', 'slug' => 'informatique']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/categories', [
                'name' => 'Informatique',
            ]);

        $response->assertStatus(422);
    }

    public function test_name_required_returns_422(): void
    {
        $admin = $this->createAdmin();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
