<?php

namespace App\Utils;

use App\Models\Page;
use App\Utils\Locales;

/**
 * Clase utilitaria para obtener las páginas especiales (policy y guidelines)
 * organizadas por idioma. Si una página no existe, su valor es nulo.
 */
class SpecialPages
{
    /**
     * Devuelve las páginas especiales agrupadas por idioma.
     * 
     * @return array<string, array{
     *    policy: array{slug: string}|null,
     *    guidelines: array{slug: string}|null
     * }>
     */
    public static function get(): array
    {
        // Obtiene los códigos de idioma habilitados en la aplicación.
        $languages = Locales::codes();

        // Estructura base.
        $pagesByLang = [];
        foreach ($languages as $lang) {
            $pagesByLang[$lang] = [
                'policy' => null,
                'guidelines' => null,
            ];
        }

        // Busca todas las páginas de tipo "policy" o "guidelines".
        $specialPages = Page::query()
            ->whereIn('type', ['policy', 'guidelines'])
            ->get(['language', 'type', 'slug']);

        foreach ($specialPages as $page) {
            $pagesByLang[$page->language][$page->type] = [
                'slug' => $page->slug,
            ];
        }

        return $pagesByLang;
    }
}