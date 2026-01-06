<?php

namespace App\Utils;

/**
 * Proporciona utilidades para gestionar los idiomas
 * habilitados en la aplicación.
 */
class Locales
{
    /**
     * Obtiene el listado completo de idiomas disponibles.
     * 
     * Cada idioma incluye:
     *  - lang: código del idioma (ej. "en", "es").
     *  - label: nombre legible del idioma.
     *
     * @return array<int, array{lang: string, label: string}>
     */
    public static function all(): array
    {
        return [
            ['lang' => 'en', 'label' => 'English'],
            ['lang' => 'es', 'label' => 'Español'],
        ];
    }

    /**
     * Obtiene únicamente los códigos de los idiomas disponibles.
     *
     * @return array<int, string>
     */
    public static function codes(): array
    {
        return array_column(self::all(), 'lang');
    }

    /**
     * Obtiene la etiqueta legible de un idioma a partir de su código.
     *
     * @param string $lang Código del idioma.
     * @return string|null Etiqueta del idioma o null si no existe.
     */
    public static function label(string $lang): ?string
    {
        foreach (self::all() as $locale) {
            if ($locale['lang'] === $lang) {
                return $locale['label'];
            }
        }

        return null;
    }
}