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
     * Genera un nombre de usuario único.
     * 
     * El formato es: user_XXXXXXXX
     * 
     * Donde "XXXXXXXX" corresponde a 8 caracteres aleatorios en minúscula.
     *
     * Si el nombre generado ya existe en la base de datos,
     * el proceso se repite hasta encontrar uno disponible.
     *
     * @return string Nombre de usuario único.
     */
    public static function generate(): string
    {
        do {
            $username = 'user_' . Str::lower(Str::random(8));
        } while (User::where('username', $username)->exists());

        return $username;
    }
}