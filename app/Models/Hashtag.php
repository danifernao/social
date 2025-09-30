<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una etiqueta (hashtag) utilizada
 * en una o varias publicaciones.
 */
class Hashtag extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Relación: publicaciones que usan la etiqueta.
     *
     * @return BelongsToMany<Post, Hashtag>
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class);
    }
}