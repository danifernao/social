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
        'closed_by_id',
        'reportable_type',
        'reportable_id',
        'reportable_snapshot',
        'reporter_note',
        'resolver_note',
        'closed_at',
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
        return $this->belongsTo(User::class, 'closed_by_id');
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
}