<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Modelo que representa un reporte realizado por un usuario.
 */
class Report extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reporter_id',
        'resolver_id',
        'reportable_type',
        'reportable_id',
        'reportable_snapshot',
        'reporter_note',
        'resolver_note',
        'closed_at',
    ];

    /**
     * Conversiones automáticas de tipos para los atributos.
     *
     * @var list<string>
     */
    protected $casts = [
        'reportable_snapshot' => 'array',
    ];

    /**
     * Relación: usuario que creó el reporte.
     * 
     * @return BelongsTo<User, Report>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Relación: usuario que cerró el reporte.
     * 
     * @return BelongsTo<User, Report>
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolver_id');
    }

    /**
     * Relación polimórfica: entidad reportada, puede ser una publicación,
     * un comentario y un usuario.
     *
     * @return MorphTo<Model, Mention>
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope que filtra los reportes que aún no han sido cerrados.
     *
     * Un reporte se considera "pendiente" cuando el campo "closed_at"
     * es nulo, lo que indica que todavía no ha sido atendido por
     * un moderador.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->whereNull('closed_at');
    }
}