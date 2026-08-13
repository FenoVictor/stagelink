<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:draft,published,closed,expired',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ];
    }
}
