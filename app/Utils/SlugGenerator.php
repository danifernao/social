<?php

namespace App\Utils;

use App\Models\Page;
use Illuminate\Support\Str;

/**
 * Clase utilitaria para generar slugs únicos y válidos.
 */
class SlugGenerator
{
    /**
     * Genera un slug único a partir de un valor dado o un título.
     *
     * - Si se proporciona un slug, se valida su formato.
     * - Si no se proporciona, se genera a partir del título.
     * - Si el slug ya existe, se agrega un sufijo aleatorio.
     *
     * @param string|null $slug Slug proporcionado por el usuario.
     * @param string $title Texto base (título de la página).
     * @param int|null $excludeId ID a excluir en la verificación de unicidad (para updates).
     * @return string Slug único y válido.
     */
    public static function generate(?string $slug, string $title, ?int $excludeId = null): string
    {
        // Si el usuario no proporcionó slug, se genera desde el título.
        $baseSlug = $slug ?: Str::slug($title);

        // Si el título no contiene caracteres válidos, crea uno genérico.
        if (empty($baseSlug)) {
            $baseSlug = 'page';
        }

        // Se asegura de que cumpla el patrón permitido (letras minúsculas, números y guiones).
        $baseSlug = preg_replace('/[^a-z0-9\-]/', '', $baseSlug);

        // Si el slug ya existe, se le añade un sufijo aleatorio hasta encontrar uno libre.
        $uniqueSlug = $baseSlug;

        while (
            Page::where('slug', $uniqueSlug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $uniqueSlug = "{$baseSlug}-" . Str::lower(Str::random(5));
        }

        return $uniqueSlug;
    }
}