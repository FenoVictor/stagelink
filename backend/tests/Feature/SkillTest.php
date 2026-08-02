<?php

namespace Tests\Feature;

use App\Models\Skill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_skills(): void
    {
        Skill::create(['name' => 'PHP']);
        Skill::create(['name' => 'Laravel']);
        Skill::create(['name' => 'React']);

        $response = $this->getJson('/api/skills');

        $response->assertOk()
            ->assertJsonCount(3);
    }

    public function test_skills_are_ordered_by_name(): void
    {
        Skill::create(['name' => 'React']);
        Skill::create(['name' => 'Angular']);
        Skill::create(['name' => 'Vue.js']);

        $response = $this->getJson('/api/skills');

        $names = collect($response->json())->pluck('name')->toArray();
        $this->assertEquals(['Angular', 'React', 'Vue.js'], $names);
    }
}
