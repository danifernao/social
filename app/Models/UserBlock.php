<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo que representa un bloqueo entre usuarios,
 * donde un usuario (blocker) bloquea a otro (blocked).
 */
class UserBlock extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = ['blocker_id', 'blocked_id'];
    
    /**
     * Relación: usuario que realiza el bloqueo.
     * 
     * @return BelongsTo<User, UserBlock>
     */
    public function blocker() {
        return $this->belongsTo(User::class, 'blocker_id');
    }

    /**
     * Relación: usuario que fue bloqueado.
     * 
     * @return BelongsTo<User, UserBlock>
     */
    public function blocked() {
        return $this->belongsTo(User::class, 'blocked_id');
    }
}