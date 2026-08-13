<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Support\Facades\Cache;

class SkillController extends Controller
{
    public function __invoke()
    {
        return response()->json(Cache::remember('skills.list', 86400, fn () => Skill::select('id', 'name')->orderBy('name')->get()
        ));
    }
}
