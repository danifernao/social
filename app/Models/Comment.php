<?php

namespace App\Models;

use App\Traits\HasReactions;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa un comentario realizado por un usuario
 * en una publicación (Post).
 */
class Comment extends Model
{
    use HasReactions;

    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
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
        return 'comment';
    }

    /**
     * Relación: el usuario que escribió el comentario.
     * 
     * @return BelongsTo<User, Comment>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: la publicación a la que pertenece el comentario.
     * 
     * @return BelongsTo<Post, Comment>
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Relación polimórfica: reacciones asociadas a este comentario.
     * 
     * @return MorphMany<Reaction, Comment>
     */
    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactionable');
    }

    /**
     * Relación polimórfica: menciones asociadas a este comentario.
     *
     * @return MorphMany<Mention, Comment>
     */
    public function mentions()
    {
        return $this->morphMany(Mention::class, 'mentionable');
    }
}