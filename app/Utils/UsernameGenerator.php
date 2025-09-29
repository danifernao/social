<?php

namespace App\Utils;

use App\Models\User;
use Illuminate\Support\Str;

/**
 * Clase utilitaria para generar nombres de usuario únicos.
 */
class UsernameGenerator
{
    /**
     * Genera un nombre de usuario único con el prefijo "user_"
     * seguido de 8 caracteres aleatorios en minúscula.
     *
     * Si el nombre ya existe en la base de datos, repite el proceso
     * hasta encontrar uno disponible.
     *
     * @return string Nombre de usuario único.
     */
    public static function generate(): string
    {
        do {
            // Construye un username con el prefijo y 8 caracteres aleatorios
            $username = 'user_' . Str::lower(Str::random(8));
        } while (User::where('username', $username)->exists());

        return $username;
    }
}