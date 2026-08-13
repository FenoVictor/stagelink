<?php

namespace App\Http\Requests;

use App\Models\Feedback;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(Feedback::TYPES)],
            'message' => 'required|string|min:10|max:3000',
            'rating' => 'nullable|integer|min:1|max:5',
            'name' => 'nullable|string|max:120',
            'email' => 'nullable|email|max:190',
        ];
    }
}
