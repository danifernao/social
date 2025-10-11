<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una página informativa.
 */
class Page extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'title',
        'slug',
        'content',
    ];

    /**
     * Verifica si ya existe una página de un tipo específico en un idioma determinado.
     *
     * @param string $type Tipo de la página.
     * @param string $language Idioma de la página.
     * @param int|null $exceptId ID de la página que debe excluirse de la comprobación.
     * @return bool Devuelve verdadero si existe otra página con el mismo tipo e idioma.
     */
    public static function existsOfTypeInLanguage(string $type, string $language, ?int $exceptId = null): bool
    {
        return static::where('language', $language)
            ->where('type', $type)
            ->when($exceptId, fn($q) => $q->where('id', '!=', $exceptId))
            ->exists();
    }
}