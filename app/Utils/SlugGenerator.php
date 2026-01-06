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
     * Genera un slug único para una página.
     *
     * Comportamiento:
     * - Si se proporciona un slug, se normaliza y valida.
     * - Si no se proporciona, se genera a partir del título.
     * - Si el slug ya existe en el mismo idioma,
     *   se añade un sufijo aleatorio.
     * 
     * @param string      $title     Texto base desde el cual
     *                               se puede generar el slug.
     * @param string|null $slug      Slug proporcionado por el usuario.
     * @param string      $language  Idioma de la página.
     * @param int|null    $excludeId ID del registro a excluir
     *                               al verificar unicidad
     *                               (útil en actualizaciones).
     *
     * @return string Slug único y válido.
     */
    public static function generate(
        string $title,
        ?string $slug,
        string $language,
        ?int $excludeId = null
    ): string
    {
        // Si no se proporciona un slug, se genera a partir del título.
        $baseSlug = $slug ?: Str::slug($title);

        // Si el resultado está vacío (por ejemplo,
        // títulos sin caracteres válidos), se asigna un valor genérico.
        if (empty($baseSlug)) {
            $baseSlug = 'page';
        }

        // Slug final que se validará contra la base de datos.
        $uniqueSlug = $baseSlug;

        // Verifica que el slug sea único dentro del mismo idioma.
        while (
            Page::where('slug', $uniqueSlug)
                ->where('language', $language)
                ->when(
                    $excludeId,
                    fn($q) => $q->where('id', '!=', $excludeId)
                )
                ->exists()
        ) {
            // Si el slug ya existe, se agrega un sufijo aleatorio.
            $uniqueSlug = "{$baseSlug}-" . Str::lower(Str::random(5));
        }

        return $uniqueSlug;
    }
}