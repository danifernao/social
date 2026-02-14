<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo que representa una invitación de registro.
 */
class Invitation extends Model
{
    /**
     * Atributos asignables masivamente.
     */
    protected $fillable = [
        'token',
        'creator_id',
        'used_by_id',
        'used_at',
    ];

    /**
     * Conversión automática de fechas.
     */
    protected $casts = [
        'used_at' => 'datetime',
    ];

    /**
     * Relación: usuario que creó la invitación.
     *
     * @return BelongsTo<User, Invitation>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Relación: usuario que utilizó la invitación.
     *
     * @return BelongsTo<User, Invitation>
     */
    public function usedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_id');
    }

    /**
     * Determina si la invitación ya fue utilizada.
     *
     * @return bool
     */
    public function isUsed(): bool
    {
        return !is_null($this->used_by_id);
    }
}

