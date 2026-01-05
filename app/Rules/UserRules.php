<?php

namespace App\Rules;

use App\Models\User;
use Illuminate\Validation\Rule;

/**
 * Define reglas de validación reutilizables para campos del usuario.
 */
class UserRules
{
    /**
     * Reglas de validación para el nombre de usuario.
     *
     * @param int|null $ignoreId ID del usuario a ignorar en la validación de
     *                           unicidad (útil al editar un usuario existente).
     * @return array<int, mixed> Conjunto de reglas de validación.
     */
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

    /**
     * Reglas de validación para el correo electrónico.
     *
     * @param int|null $ignoreId ID del usuario a ignorar en la validación de
     *                           unicidad (útil al editar un usuario existente).
     * @return array<int, mixed> Conjunto de reglas de validación.
     */
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