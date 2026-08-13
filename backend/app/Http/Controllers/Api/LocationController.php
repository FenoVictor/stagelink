<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\Country;
use App\Models\District;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    private const TTL = 86400;

    public function countries(): JsonResponse
    {
        return response()->json(Cache::remember('location.countries', self::TTL, fn () => Country::orderBy('name')->get(['id', 'name', 'iso_code'])
        ));
    }

    public function provinces(Country $country): JsonResponse
    {
        return response()->json(Cache::remember("location.provinces.{$country->id}", self::TTL, fn () => $country->provinces()->orderBy('name')->get(['id', 'name'])
        ));
    }

    public function regions(Province $province): JsonResponse
    {
        return response()->json(Cache::remember("location.regions.{$province->id}", self::TTL, fn () => $province->regions()->orderBy('name')->get(['id', 'name'])
        ));
    }

    public function districts(Region $region): JsonResponse
    {
        return response()->json(Cache::remember("location.districts.{$region->id}", self::TTL, fn () => $region->districts()->orderBy('name')->get(['id', 'name'])
        ));
    }

    public function communes(District $district): JsonResponse
    {
        return response()->json(Cache::remember("location.communes.{$district->id}", self::TTL, fn () => $district->communes()->orderBy('name')->get(['id', 'name'])
        ));
    }

    public function neighborhoods(Commune $commune): JsonResponse
    {
        return response()->json(Cache::remember("location.neighborhoods.{$commune->id}", 3600, fn () => $commune->neighborhoods()->where('verified', true)->orderBy('name')->get(['id', 'name'])
        ));
    }

    public function communeHierarchy(Commune $commune): JsonResponse
    {
        $commune->load('district.region.province.country');

        return response()->json([
            'commune' => ['id' => $commune->id, 'name' => $commune->name],
            'district' => $commune->district ? ['id' => $commune->district->id, 'name' => $commune->district->name] : null,
            'region' => $commune->district?->region ? ['id' => $commune->district->region->id, 'name' => $commune->district->region->name] : null,
            'province' => $commune->district?->region?->province ? ['id' => $commune->district->region->province->id, 'name' => $commune->district->region->province->name] : null,
            'country' => $commune->district?->region?->province?->country ? ['id' => $commune->district->region->province->country->id, 'name' => $commune->district->region->province->country->name, 'iso_code' => $commune->district->region->province->country->iso_code] : null,
        ]);
    }
}
