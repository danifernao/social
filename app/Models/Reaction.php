<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una reacción (emoji) hecha por un usuario
 * sobre una entidad "reactionable" (como Post o Comment).
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
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación polimórfica que vincula esta reacción con cualquier modelo "reactionable"
     * (por ejemplo, Post o Comment).
     *
     * @return MorphTo
     */
    public function reactionable(): MorphTo {
        return $this->morphTo();
    }
}