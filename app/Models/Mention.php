<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una mención a un usuario dentro de un Post o un Comment.
 */
class Mention extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'mentionable_id',
        'mentionable_type',
    ];

    /**
     * Relación: usuario que fue mencionado.
     * 
     * @return BelongsTo<User, Mention>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación polimórfica: contenido en el que ocurrió la mención.
     * Puede ser un Post o un Comment.
     *
     * @return MorphTo<Model, Mention>
     */
    public function mentionable()
    {
        return $this->morphTo();
    }
}