<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\Mention;
use App\Notifications\NewMention;
use Illuminate\Notifications\DatabaseNotification;

class CommentObserver
{
    /**
     * Método que se ejecuta automáticamente antes de que un modelo Comment sea eliminado.
     */
    public function deleting(Comment $comment): void
    {
        // Elimina las menciones hechas en este comentario.
        $comment->mentions()->delete();

        // Elimina las notificaciones de menciones hechas en este comentario.
        DatabaseNotification::where('type', NewMention::class)
            ->where('data->data->context->type', 'comment')
            ->where('data->data->context->id', $comment->id)
            ->delete();
    }
}