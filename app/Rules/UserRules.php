<?php

namespace App\Rules;

use App\Models\User;
use Illuminate\Validation\Rule;

class UserRules
{
    public static function username(?int $ignoreId = null): array
    {
        return [
            'required',
            'string',
            'min:4',
            'max:15',
            'regex:/^[a-zA-Z](?!.*[._]{2})[a-zA-Z0-9._]*[a-zA-Z0-9]$/',
            Rule::unique(User::class, 'username')->ignore($ignoreId),
        ];
    }

    public static function email(?int $ignoreId = null): array
    {
        return [
            'required',
            'string',
            'lowercase',
            'email',
            'max:255',
            Rule::unique(User::class, 'email')->ignore($ignoreId),
        ];
    }
}