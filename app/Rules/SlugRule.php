<?php

namespace App\Rules;

use App\Models\Page;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

class SlugRule implements ValidationRule
{
    protected ?Page $page;
    
    public function __construct(?Page $page = null)
    {
        $this->page = $page;
    }

    /**
     * Ejecuta la validación del idioma.
     *
     * @param  string  $attribute  Nombre del atributo que se valida.
     * @param  mixed   $value      Valor del atributo.
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     *         Callback que se ejecuta si la validación falla.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Verifica que el slug tenga formato válido.
        if ($value !== Str::slug($value)) {
            $fail(__('Slug contains invalid characters.'));
            return;
        }

        // Obtiene el idioma desde el modelo o desde la solictud HTTP.
        $language = $this->page?->language ?? request('language');

        // Prepara la consulta para comprobar si ya existe una página con el mismo slug e idioma.
        $query = Page::where('slug', $value)
            ->where('language', $language);

        // Si se está actualizando la página, la ignora en la consulta.
        if ($this->page?->id) {
            $query->where('id', '!=', $this->page->id);
        }

        if ($query->exists()) {
            $fail(__('Slug already in use in this language.'));
        }
    }
}