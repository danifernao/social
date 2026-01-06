<?php

namespace App\Utils;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Clase utilitaria para detectar menciones de usuarios dentro de un texto.
 */
class MentionParser
{
    /**
     * Extrae hasta cinco usuarios mencionados a partir
     * del contenido proporcionado.
     *
     * @param string $content Contenido de texto a analizar.
     * @return Collection Colección de usuarios mencionados existentes
     *                    en la base de datos.
     */
    public static function extractMentionedUsers(string $content): Collection
    {
        // Busca menciones que comiencen con "@" y cumplan
        // con el patrón de nombre de usuario definido.
        preg_match_all('/@([a-zA-Z0-9._]{4,15})/', $content, $matches);

        // Elimina nombres de usuario duplicados y limita
        // el resultado a los primeros cinco.
        $usernames = array_slice(array_unique($matches[1]), 0, 5);

        // Obtiene y retorna los usuarios correspondientes desde
        // la base de datos.
        return User::whereIn('username', $usernames)->get();
    }
}