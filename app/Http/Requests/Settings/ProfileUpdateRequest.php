<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use App\Rules\UserRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => UserRules::username($this->user()->id),
            'email'    => UserRules::email($this->user()->id),
            'avatar' => ['nullable', 'mimes:jpg,jpeg,png', 'max:2048'],
            'remove_avatar' => ['boolean'],
        ];
    }
}
