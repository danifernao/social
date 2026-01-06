<?php

namespace App\Utils;

use App\Models\Page;
use App\Utils\Locales;

/**
 * Proporciona utilidades para gestionar páginas informativas.
 */
class PageUtils
{
    /**
     * Obtiene el listado completo de tipos de páginas válidos.
     *
     * @return string[]
     */
    public static function getTypes(): array
    {
        return ['normal', 'about', 'terms', 'policy', 'guidelines'];
    }

    /**
     * Obtiene únicamente los tipos de páginas consideradas
     * como especiales.
     *
     * @return string[]
     */
    public static function getSpecialTypes(): array
    {
        return ['about', 'terms', 'policy', 'guidelines'];
    }

    /**
     * Obtiene las páginas especiales agrupadas por idioma.
     *
     * Para cada idioma habilitado, se devuelve un arreglo con
     * los tipos de páginas especiales y el slug correspondiente,
     * o null si la página no existe.
     *
     * @return array<string, array{
     *     about: array{slug: string}|null,
     *     terms: array{slug: string}|null,
     *     policy: array{slug: string}|null,
     *     guidelines: array{slug: string}|null
     * }>
     */
    public static function getSpecialPages(): array
    {
        // Obtiene los códigos de idioma habilitados en la aplicación.
        $languages = Locales::codes();

        // Inicializa la estructura base de la respuesta,
        // asignando null a cada tipo especial por idioma.
        $pagesByLang = [];
        foreach ($languages as $lang) {
            $pagesByLang[$lang] = array_fill_keys(
                self::getSpecialTypes(), null
            );
        }

        // Recupera todas las páginas de tipo especial
        // junto con su idioma y slug.
        $specialPages = Page::query()
            ->whereIn('type', self::getSpecialTypes())
            ->get(['language', 'type', 'slug']);

        // Asigna el slug de cada página encontrada
        // dentro de la estructura correspondiente
        // a su idioma y tipo.
        foreach ($specialPages as $page) {
            $pagesByLang[$page->language][$page->type] = [
                'slug' => $page->slug,
            ];
        }

        return $pagesByLang;
    }
}