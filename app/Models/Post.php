<?php

namespace App\Models;

use App\Traits\HasReactions;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa una publicación realizada por un usuario.
 */
class Post extends Model
{
    use HasReactions;

    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'content',
    ];

    /**
     * Atributos que se agregan automáticamente al serializar.
     *
     * @var list<string>
     */
    protected $appends = ['type'];

    /**
     * Atributo computado: tipo del modelo, útil para el frontend.
     *
     * @return string
     */
    public function getTypeAttribute()
    {
        return 'post';
    }

    /**
     * Relación: usuario que creó la publicación.
     *
     * @return BelongsTo<User, Post>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: comentarios realizados en esta publicación.
     *
     * @return HasMany<Comment>
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relación polimórfica: reacciones asociadas a esta publicación.
     *
     * @return MorphMany<Reaction>
     */
    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactionable');
    }

    /**
     * Relación: etiquetas asociadas a la publicación.
     *
     * @return BelongsToMany<Hashtag>
     */
    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class);
    }
}
