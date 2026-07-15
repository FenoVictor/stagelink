<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commune;
use App\Models\Country;
use App\Models\District;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function countries(): JsonResponse
    {
        return response()->json(Country::orderBy('name')->get(['id', 'name', 'iso_code']));
    }

    public function provinces(Country $country): JsonResponse
    {
        return response()->json($country->provinces()->orderBy('name')->get(['id', 'name']));
    }

    public function regions(Province $province): JsonResponse
    {
        return response()->json($province->regions()->orderBy('name')->get(['id', 'name']));
    }

    public function districts(Region $region): JsonResponse
    {
        return response()->json($region->districts()->orderBy('name')->get(['id', 'name']));
    }

    public function communes(District $district): JsonResponse
    {
        return response()->json($district->communes()->orderBy('name')->get(['id', 'name']));
    }

    public function neighborhoods(Commune $commune): JsonResponse
    {
        return response()->json(
            $commune->neighborhoods()->where('verified', true)->orderBy('name')->get(['id', 'name'])
        );
    }
}
