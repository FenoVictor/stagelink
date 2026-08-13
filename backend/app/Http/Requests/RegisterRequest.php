<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'firstname' => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,company',
            'company_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|string|url',
            'location' => 'nullable|string',
            'industry' => 'nullable|string',
        ];
    }
}
