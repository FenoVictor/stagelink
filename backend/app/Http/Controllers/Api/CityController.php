<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    public function __invoke()
    {
        return response()->json(Cache::remember('cities.list', 86400, fn () => City::select('id', 'name', 'province')->orderBy('name')->get()
        ));
    }
}
