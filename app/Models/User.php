<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

/**
 * Modelo que representa a un usuario registrado.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'avatar_path',
        'role',
        'language',
    ];

    /**
     * Atributos ocultos al serializar.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Atributos que se agregan automáticamente al serializar.
     *
     * @var list<string>
     */
    protected $appends = ['type', 'avatar_url'];

    /**
     * Define los atributos con casting automático.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Atributo computado: tipo del modelo, útil para el frontend.
     *
     * @return string
     */
    public function getTypeAttribute()
    {
        return 'user';
    }

    /**
     * Atributo computado: URL del avatar del usuario.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? asset('storage/' . $this->avatar_path) : null;
    }

    /**
     * Relación: usuarios a los que este usuario sigue.
     * 
     * @return BelongsToMany<User, User>
     */
    public function follows()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id')->withTimestamps();
    }
    
    /**
     * Relación: usuarios que siguen a este usuario.
     * 
     * @return BelongsToMany<User, User>
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id')->withTimestamps();
    }

    /**
     * Relación: publicaciones creadas por el usuario.
     * 
     * @return HasMany<Post, User>
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Relación: comentarios creados por el usuario.
     * 
     * @return HasMany<Comment, User>
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relación: reacciones hechas por el usuario.
     * 
     * @return HasMany<Reaction, User>
     */
    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    /**
     * Relación: usuarios bloqueados por este usuario.
     * 
     * @return BelongsToMany<User, User>
     */
    public function blockedUsers()
    {
        return $this->belongsToMany(User::class, 'user_blocks', 'blocker_id', 'blocked_id');
    }

    /**
     * Relación: usuarios que han bloqueado a este usuario.
     * 
     * @return BelongsToMany<User, User>
     */
    public function blockedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_blocks', 'blocked_id', 'blocker_id');
    }

    /**
     * Determina si el usuario tiene rol de administrador.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Determina si el usuario tiene rol de moderador.
     *
     * @return bool
     */
    public function isMod(): bool
    {
        return $this->role === 'mod';
    }

    /**
     * Determina si el usuario puede moderar.
     *
     * @return bool
     */
    public function canModerate(): bool
    {
        return $this->role === 'admin' || $this->role === 'mod';
    }

    /**
     * Determina si el usuario puede gestionar a otro usuario.
     *
     * @param User $user Usuario objetivo.
     * @return bool
     */
    public function canActOn(User $user): bool
    {
        // No puede actuar sobre sí mismo.
        if ($this->id === $user->id) {
            return false;
        }

        // Un administrador puede actuar sobre cualquiera.
        if ($this->isAdmin()) {
            return true;
        }

        // Un moderador puede actuar sobre otros, excepto administradores.
        if ($this->isMod() && !$user->isAdmin()) {
            return true;
        }

        return false;
    }

    /**
     * Devuelve los IDs de usuarios seguidos por este usuario.
     *
     * @return array<int>
     */
    public function followedUserIds(): array
    {
        return $this->follows()->pluck('followed_id')->toArray();
    }

    /**
     * Marca cada usuario de una colección con la propiedad "is_followed".
     * Si el usuario es el mismo que el autenticado, se marca como "null".
     *
     * @param Collection<int, User> $users
     * @return Collection<int, User>
     */
    public function markFollowStateForCollection(Collection $users): Collection
    {
        $followed_ids = $this->followedUserIds();

        return $users->map(function ($user) use ($followed_ids) {
            $user->is_followed = $user->id === $this->id
                ? null
                : in_array($user->id, $followed_ids);

            return $user;
        });
    }

    /**
     * Verifica si el usuario ha bloqueado a otro usuario.
     *
     * @param User $user
     * @return bool
     */
    public function hasBlocked(User $user): bool
    {
        return $this->blockedUsers()->where('blocked_id', $user->id)->exists();
    }

    /**
     * Verifica si hay bloqueo mutuo entre este usuario y otro.
     *
     * @param User $user Usuario a comprobar.
     * @return bool
     */
    public function hasBlockedOrBeenBlockedBy(User $user): bool
    {
        return $this->hasBlocked($user) || $user->hasBlocked($this);
    }

    /**
     * Alterna el bloqueo de un usuario: bloquea si no lo está, desbloquea si ya lo está.
     * Al bloquear, también se elimina el seguimiento mutuo.
     *
     * @param User $user Usuario objetivo del bloqueo.
     * @return bool TRUE si la acción se ejecutó correctamente.
     */
    public function toggleBlock(User $user): bool
    {
        if ($this->hasBlocked($user)) {
            $this->blockedUsers()->detach($user->id);
            return true; // Desbloqueado.
        } else {
            $this->blockedUsers()->attach($user->id);
            // Quitar seguimiento mutuo.
            $this->follows()->detach($user->id);
            $user->follows()->detach($this->id);
            return true; // Bloqueado.
        }
    }

    /**
     * Devuelve un arreglo de IDs de usuarios bloqueados por este usuario o que lo bloquearon.
     *
     * @return array<int>
     */
    public function excludedUserIds(): array
    {
        return $this->blockedUsers->pluck('id')
            ->merge($this->blockedByUsers->pluck('id'))
            ->unique()
            ->toArray();
    }

    /**
     * Filtra una colección de usuarios, dejando solo los que pueden ser mencionados.
     *
     * @param Collection<int, User> $mentionedUsers
     * @return Collection<int, User>
     */
    public function filterMentionables($mentionedUsers)
    {
        $excluded = $this->excludedUserIds();

        return $mentionedUsers->reject(function ($user) use ($excluded) {
            // Se excluye a uno mismo y a los usuarios bloqueados.
            return $user->id === $this->id || in_array($user->id, $excluded);
        });
    }
}