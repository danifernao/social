<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una reacción (emoji) hecha por un usuario
 * sobre un Post o Comment.
 */
class Reaction extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = ['user_id', 'emoji'];

    /**
     * Relación: el usuario que realizó la reacción.
     * 
     * @return BelongsTo<User, Reaction>
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación polimórfica: contenido en el que ocurrió la reacción.
     * Puede ser un Post o un Comment.
     *
     * @return MorphTo<Model, Reaction>
     */
    public function reactionable(): MorphTo {
        return $this->morphTo();
    }
}