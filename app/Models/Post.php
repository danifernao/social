<?php

namespace App\Models;

use App\Traits\HasReactions;
use Illuminate\Database\Eloquent\Builder;
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
        'visibility',
        'profile_user_id',
        'is_closed',
    ];

    /**
     * Define los casts automáticos de atributos.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'is_closed' => 'boolean',
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
     * Relación: dueño del perfil.
     * 
     * @return BelongsTo<User, User>
     */
    public function profileOwner()
    {
        return $this->belongsTo(User::class, 'profile_user_id');
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

    /**
     * Filtra las publicaciones visibles para un usuario dado.
     *
     * @param Builder   $query  Instancia del query builder sobre el modelo Post.
     * @param User|null $user   Usuario autenticado que intenta visualizar
     *                          las publicaciones. Puede ser nulo para invitados.
     * @return Builder          Instancia del query builder con los filtros de
     *                          visibilidad aplicados.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        // Los administradores y moderadores pueden ver todas las publicaciones.
        if ($user && $user->hasAnyRole(['admin', 'mod'])) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            // Publicaciones en perfiles ajenos.
            $q->whereNotNull('profile_user_id')
              ->where(function ($sub) use ($user) {
                  // Los invitados nunca deben ver publicaciones
                  // en perfiles ajenos.
                  if (!$user) {
                      $sub->whereRaw('1 = 0');
                      return;
                  }

                  // Las publicaciones en perfiles ajenos solo son visibles
                  // para el autor y el dueño del perfil.
                  $sub->where('user_id', $user->id)
                      ->orWhere('profile_user_id', $user->id);
              });

            // Publicaciones en perfiles propios.
            $q->orWhere(function ($sub) use ($user) {
                $sub->whereNull('profile_user_id');

                // Los invitados solo pueden ver publicaciones públicas.
                if (!$user) {
                    $sub->where('visibility', 'public');
                    return;
                }

                // Los usuarios autenticados pueden ver lo siguiente:
                // - Las publicaciones públicas.
                // - Sus propias publicaciones.
                // - Las publicaciones que otros comparten con sus seguidos.
                $sub->where(function ($v) use ($user) {
                    $v->where('visibility', 'public')
                      ->orWhere('user_id', $user->id)
                      ->orWhere(function ($f) use ($user) {
                          $f->where('visibility', 'following')
                            ->whereExists(function ($exists) use ($user) {
                                $exists->selectRaw(1)
                                    ->from('follows')
                                    ->whereColumn('follows.follower_id', 'posts.user_id')
                                    ->where('follows.followed_id', $user->id);
                            });
                      });
                });
            });
        });
    }
}