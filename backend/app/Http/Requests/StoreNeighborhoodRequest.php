<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNeighborhoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commune_id' => 'required|exists:communes,id',
            'name' => 'required|string|max:100',
        ];
    }
}
