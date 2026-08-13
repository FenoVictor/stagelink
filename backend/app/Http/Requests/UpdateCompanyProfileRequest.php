<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'industry' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'city_id' => 'nullable|exists:cities,id',
            'address' => 'nullable|string|max:1000',
            'employees_count' => 'nullable|integer|min:0',
            'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];
    }
}
