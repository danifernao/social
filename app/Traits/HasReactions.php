<?php

namespace App\Traits;

use Illuminate\Support\Collection;

/**
 * Proporciona lógica reutilizable para resumir reacciones (emojis)
 * asociadas a una publicación o comentario.
 */
trait HasReactions
{
    /**
     * Obtiene un resumen de las reacciones agrupadas por emoji.
     * 
     * Para cada emoji se devuelve:
     *   - el emoji,
     *   - el número total de reacciones,
     *   - si un usuario específico ha reaccionado con ese emoji.
     *
     * @param int|null $userId ID del usuario para comprobar si reaccionó
     *                         con cada emoji.
     *                         Si es null, no se evalúa la reacción del usuario.
     * @return Collection Colección de arreglos con la información resumida
     *                    de las reacciones por emoji.
     */
    public function reactionsSummary($userId): Collection
    {
        return $this->reactions()
            ->get()
            ->groupBy('emoji')
            // Genera el resumen para cada grupo de reacciones.
            ->map(function ($group) use ($userId) {
                return [
                    'emoji' => $group->first()->emoji,
                    'count' => $group->count(),
                    'reactedByUser' => $userId
                        ? $group->contains('user_id', $userId)
                        : false,
                ];
            })
            // Reindexa la colección para usar índices numéricos consecutivos.
            ->values();
    }
}