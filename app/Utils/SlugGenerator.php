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
     * @param string      $title       Texto base desde el cual
     *                                 se puede generar el slug.
     * @param string|null $slug        Slug proporcionado por el usuario.
     * @param string      $language    Idioma de la página.
     * @param int|null    $excluded_id ID del registro a excluir
     *                                 al verificar unicidad
     *                                 (útil en actualizaciones).
     *
     * @return string                  Slug único y válido.
     */
    public static function generate(
        string $title,
        ?string $slug,
        string $language,
        ?int $excluded_id = null
    ): string
    {
        // Si no se proporciona un slug, se genera a partir del título.
        $base_slug = $slug ?: Str::slug($title);

        // Si el resultado está vacío (por ejemplo,
        // títulos sin caracteres válidos), se asigna un valor genérico.
        if (empty($base_slug)) {
            $base_slug = 'page';
        }

        // Slug final que se validará contra la base de datos.
        $unique_slug = $base_slug;

        // Verifica que el slug sea único dentro del mismo idioma.
        while (
            Page::where('slug', $unique_slug)
                ->where('language', $language)
                ->when(
                    $excluded_id,
                    fn($q) => $q->where('id', '!=', $excluded_id)
                )
                ->exists()
        ) {
            // Si el slug ya existe, se agrega un sufijo aleatorio.
            $unique_slug = "{$base_slug}-" . Str::lower(Str::random(5));
        }

        return $unique_slug;
    }
}