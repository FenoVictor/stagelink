<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityController extends Controller
{
    public function __invoke()
    {
        return response()->json(City::select('id', 'name', 'province')->orderBy('name')->get());
    }
}
