<?php

namespace Tests\Feature;

use App\Models\Commune;
use App\Models\Country;
use App\Models\District;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_countries(): void
    {
        Country::create(['name' => 'Madagascar', 'iso_code' => 'MG']);

        $response = $this->getJson('/api/locations/countries');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Madagascar']);
    }

    public function test_public_can_list_provinces(): void
    {
        $country = Country::create(['name' => 'Madagascar', 'iso_code' => 'MG']);
        Province::create(['name' => 'Toliara', 'country_id' => $country->id]);

        $response = $this->getJson("/api/locations/{$country->id}/provinces");

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_public_can_list_regions(): void
    {
        $country = Country::create(['name' => 'Madagascar', 'iso_code' => 'MG']);
        $province = Province::create(['name' => 'Toliara', 'country_id' => $country->id]);
        Region::create(['name' => 'Atsimo-Andrefana', 'province_id' => $province->id]);

        $response = $this->getJson("/api/locations/provinces/{$province->id}/regions");

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_public_can_list_communes_hierarchy(): void
    {
        $country = Country::create(['name' => 'Madagascar', 'iso_code' => 'MG']);
        $province = Province::create(['name' => 'Toliara', 'country_id' => $country->id]);
        $region = Region::create(['name' => 'Atsimo-Andrefana', 'province_id' => $province->id]);
        $district = District::create(['name' => 'Toliara Urban', 'region_id' => $region->id]);
        $commune = Commune::create(['name' => 'Toliara', 'district_id' => $district->id]);

        $response = $this->getJson("/api/locations/communes/{$commune->id}/hierarchy");

        $response->assertOk()
            ->assertJsonStructure(['country', 'province', 'region', 'district', 'commune']);
    }
}
