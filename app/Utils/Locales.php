<?php

namespace App\Utils;

/**
 * Clase utilitaria para gestionar los idiomas habilitados en la aplicación.
 */
class Locales
{
    /**
     * Retorna el listado completo de idiomas con su código y etiqueta.
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
     * Retorna un listado con los códigos de idioma.
     *
     * @return array<int, string>
     */
    public static function codes(): array
    {
        return array_column(self::all(), 'lang');
    }

    /**
     * Retorna la etiqueta de un idioma dado su código.
     * Devuelve nulo si el código no existe.
     *
     * @param string $lang
     * @return string|null
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