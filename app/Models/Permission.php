<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa los permisos de un usuario.
 */
class Permission extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'can_manage_system',
        'can_moderate',
    ];

    /**
     * Define los casts automáticos de atributos.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'can_manage_system'   => 'boolean',
        'can_moderate'        => 'boolean',
        'can_post'            => 'boolean',
        'can_comment'         => 'boolean',
        'can_update_username' => 'boolean',
        'can_update_avatar'   => 'boolean',
    ];

     /**
     * Relación: usuario que tiene los permisos.
     *
     * @return BelongsTo<User, Post>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
