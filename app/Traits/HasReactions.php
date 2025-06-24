<?php

namespace App\Traits;

use Illuminate\Support\Collection;

/**
 * Trait que añade funcionalidad para gestionar y resumir reacciones (emojis)
 * asociadas a un modelo, como Post o Comment.
 */
trait HasReactions
{
    /**
     * Obtiene un resumen agrupado de las reacciones por emoji.
     * Para cada emoji, devuelve el conteo total y si un usuario específico ha reaccionado con ese emoji.
     *
     * @param int|null $userId ID del usuario para verificar si reaccionó con cada emoji (puede ser null).
     * @return Collection Colección con objetos que contienen:
     *                    - emoji: el emoji en cuestión,
     *                    - count: número total de reacciones con ese emoji,
     *                    - reactedByUser: booleano indicando si el usuario dado reaccionó con ese emoji.
     */
    public function reactionsSummary($userId): Collection
    {
        return $this->reactions() // Obtiene todas las reacciones asociadas al modelo actual.
            ->get() // Recupera las reacciones como colección.
            ->groupBy('emoji') // Agrupa las reacciones por el campo "emoji".
            ->map(function ($group) use ($userId) { // Por cada grupo de reacciones con el mismo emoji:
                return [
                    'emoji' => $group->first()->emoji, // El emoji de ese grupo.
                    'count' => $group->count(), // Cantidad total de reacciones con ese emoji.
                    'reactedByUser' => $userId ? $group->contains('user_id', $userId) : false, //Si el usuario reaccionó con ese emoji.
                ];
            })
            ->values(); // Re-indexa la colección para que tenga índices numéricos consecutivos.
    }
}