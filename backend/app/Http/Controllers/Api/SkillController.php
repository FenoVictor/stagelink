<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;

class SkillController extends Controller
{
    public function __invoke()
    {
        return response()->json(Skill::select('id', 'name')->orderBy('name')->get());
    }
}
