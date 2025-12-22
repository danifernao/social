<?php

namespace App\Rules;

use App\Models\Page;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

class SlugRule implements ValidationRule
{
    protected ?Page $page;
    
    // Recibe opcionalmente la página actual para validar en edición.
    // Si es nula, se asume que la validación es en creación.
    public function __construct(?Page $page = null)
    {
        $this->page = $page;
    }

    /**
     * Valida que el slug de la páigna sea válido y único por idioma.
     *
     * @param string $attribute  Nombre del campo.
     * @param mixed  $value      Valor a validar.
     * @param Closure $fail      Callback de error.
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

        // Determina el idioma de la página (edición)
        // o desde la solicitud HTTP (creación).
        $language = $this->page?->language ?? request('language');

        // Prepara la consulta para comprobar si ya existe una página
        // con el mismo slug e idioma.
        $query = Page::where('slug', $value)
            ->where('language', $language);

        // Excluye la página actual si se está editando.
        if ($this->page?->id) {
            $query->where('id', '!=', $this->page->id);
        }

        if ($query->exists()) {
            $fail(__('Slug already in use in this language.'));
        }
    }
}