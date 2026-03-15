<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa un registro del historial
 * de cambios de una publicación o comentario.
 */
class ContentHistory extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'historable_id',
        'historable_type',
        'content',
    ];


    /**
     * Relación polimórfica: contenido de la publicación o comentario.
     */
    public function historable()
    {
        return $this->morphTo();
    }

    /**
     * Relación: usuario que realizó la modificación.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
