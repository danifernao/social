<?php

namespace App\Utils;

use App\Models\User;

/**
 * Clase utilitaria para detectar menciones de usuarios en un texto.
 */
class MentionParser
{
    /**
     * Extrae hasta 5 usuarios mencionados en el contenido proporcionado.
     *
     * Una mención válida empieza con "@" seguida de un nombre de usuario
     * entre 4 y 15 caracteres, compuesto por letras, números, puntos o guiones bajos.
     *
     * @param string $content Contenido a analizar.
     * @return \Illuminate\Support\Collection<int, \App\Models\User> Colección de usuarios mencionados.
     */
    public static function extractMentionedUsers(string $content)
    {
        // Busca menciones que empiecen con @ y cumplan con el patrón de nombre de usuario.
        preg_match_all('/@([a-zA-Z0-9._]{4,15})/', $content, $matches);

        // Elimina duplicados y toma solo los primeros 5 nombres de usuario mencionados.
        $usernames = array_slice(array_unique($matches[1]), 0, 5);

        // Devuelve una colección de los usuarios encontrados en la base de datos.
        return User::whereIn('username', $usernames)->get();
    }
}