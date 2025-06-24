<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
     * @return BelongsToMany<Post>
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class);
    }
}
