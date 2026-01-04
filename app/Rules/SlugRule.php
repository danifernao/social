<?php

namespace App\Rules;

use App\Models\Page;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

/**
 * Regla de validación para comprobar que un slug tenga un formato válido
 * y sea único por idioma, tanto en creación como en edición de páginas.
 */
class SlugRule implements ValidationRule
{
    /**
     * Página actual en edición.
     * Puede ser nula cuando la validación se usa en creación.
     */
    protected ?Page $page;
    
    /**
     * Crea una nueva instancia de la regla con la página actual.
     *
     * @param Page|null $page  Página actual que se está editando.
     *                         Si es nula, se asume que la validación
     *                         es en creación.
     */
    public function __construct(?Page $page = null)
    {
        $this->page = $page;
    }

    /**
     * Valida que el slug de la páigna sea válido y único por idioma.
     *
     * @param string $attribute  Nombre del campo que se está validando.
     * @param mixed  $value      Valor del slug ingresado.
     * @param Closure $fail      Callback que registra el error de validación.
     */
    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail
    ): void
    {
        // Valida que el slug tenga un formato correcto.
        if ($value !== Str::slug($value)) {
            $fail(__('Slug contains invalid characters.'));
            return;
        }

        // Determina el idioma de la página:
        // - Desde el modelo si se está editando.
        // - Desde la solicitud HTTP si se está creando.
        $language = $this->page?->language ?? request('language');

        // Prepara la consulta para verificar si ya existe una página
        // con el mismo slug en el mismo idioma.
        $query = Page::where('slug', $value)
            ->where('language', $language);

        // Excluye la página actual del chequeo si se está editando.
        if ($this->page?->id) {
            $query->where('id', '!=', $this->page->id);
        }

        // Si existe otra página con el mismo slug e idioma,
        // falla la validación.
        if ($query->exists()) {
            $fail(__('Slug already in use in this language.'));
        }
    }
}