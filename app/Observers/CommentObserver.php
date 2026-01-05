<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\Mention;
use App\Notifications\NewMention;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Observa eventos del modelo Comment para manejar efectos secundarios
 * relacionados con su ciclo de vida.
 */
class CommentObserver
{
    /**
     * Método que se ejecuta antes de que un comentario sea eliminado.
     */
    public function deleting(Comment $comment): void
    {
        // Elimina las menciones hechas en el comentario.
        $comment->mentions()->delete();

        // Elimina las notificaciones de menciones hechas en el comentario.
        DatabaseNotification::where('type', NewMention::class)
            ->where('data->data->context->type', 'comment')
            ->where('data->data->context->id', $comment->id)
            ->delete();
    }
}