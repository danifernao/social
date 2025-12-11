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
        'profile_user_id',
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
    public function getTypeAttribute(): string
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
     * @return HasMany<Comment, Post>
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relación polimórfica: reacciones hechas en esta publicación.
     *
     * @return MorphMany<Reaction, Post>
     */
    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactionable');
    }

    /**
     * Relación: etiquetas agregadas en esta publicación.
     *
     * @return BelongsToMany<Hashtag, Post>
     */
    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class);
    }

    /**
     * Relación polimórfica: menciones hechas en esta publicación.
     *
     * @return MorphMany<Mention, Post>
     */
    public function mentions()
    {
        return $this->morphMany(Mention::class, 'mentionable');
    }
}