<?php

namespace App\Utils;

use App\Models\Page;
use App\Utils\Locales;

/**
 * Clase utilitaria para manejar operaciones relacionadas con páginas informativas.
 */
class PageUtils
{
    /**
     * Devuelve todos los tipos de páginas válidos.
     *
     * @return string[]
     */
    public static function getTypes(): array
    {
        return ['normal', 'about', 'terms', 'policy', 'guidelines'];
    }

    /**
     * Devuelve solo los tipos de páginas especiales.
     *
     * @return string[]
     */
    public static function getSpecialTypes(): array
    {
        return ['about', 'terms', 'policy', 'guidelines'];
    }

    /**
     * Devuelve las páginas especiales agrupadas por idioma.
     * 
     * @return array<string, array{
     *    policy: array{slug: string}|null,
     *    guidelines: array{slug: string}|null
     * }>
     */
    public static function getSpecialPages(): array
    {
        // Obtiene los códigos de idioma habilitados en la aplicación.
        $languages = Locales::codes();

        // Estructura base de la respuesta.
        $pagesByLang = [];
        foreach ($languages as $lang) {
            $pagesByLang[$lang] = array_fill_keys(self::getSpecialTypes(), null);
        }

        // Busca todas las páginas de tipo especial.
        $specialPages = Page::query()
            ->whereIn('type', self::getSpecialTypes())
            ->get(['language', 'type', 'slug']);

        // Añade el slug de las páginas encontradas en la respuesta.
        foreach ($specialPages as $page) {
            $pagesByLang[$page->language][$page->type] = [
                'slug' => $page->slug,
            ];
        }

        return $pagesByLang;
    }
}