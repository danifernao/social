<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\ContentHistory;
use App\Models\Mention;
use App\Notifications\NewMention;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;

/**
 * Observa eventos del modelo Comment para manejar efectos secundarios
 * relacionados con su ciclo de vida.
 */
class CommentObserver
{
    /**
     * Método que se ejecuta antes de actualizar un comentario.
     */
    public function updating(Comment $comment): void
    {
        // Si el contenido no fue modificado,
        // no se registra historial.
        if (!$comment->isDirty('content')) {
            return;
        }

        ContentHistory::create([
            'historable_id' => $comment->id,
            'historable_type' => Comment::class,
            'user_id' => Auth::id(),
            'content' => $comment->getOriginal('content'),
        ]);
    }

    /**
     * Método que se ejecuta antes de que un comentario sea eliminado.
     */
    public function deleting(Comment $comment): void
    {
        // Elimina el historial asociado al comentario.
        ContentHistory::where('historable_type', Comment::class)
            ->where('historable_id', $comment->id)
            ->delete();

        // Elimina las menciones hechas en el comentario.
        $comment->mentions()->delete();

        // Elimina las notificaciones de menciones hechas en el comentario.
        DatabaseNotification::where('type', NewMention::class)
            ->where('data->data->context->type', 'comment')
            ->where('data->data->context->id', $comment->id)
            ->delete();
    }
}