<?php

namespace App\Observers;

use App\Models\ContentHistory;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;
use App\Models\Comment;
use App\Notifications\NewCommentOnPost;
use App\Notifications\NewMention;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Observa eventos del modelo Post para manejar efectos secundarios
 * relacionados con su ciclo de vida.
 */
class PostObserver
{
    /**
     * Método que se ejecuta antes de actualizar una publicación.
     */
    public function updating(Post $post)
    {
        // Si el contenido no fue modificado,
        // no se registra historial.
        if (!$post->isDirty('content')) {
            return;
        }

        ContentHistory::create([
            'historable_id' => $post->id,
            'historable_type' => Post::class,
            'user_id' => Auth::id(),
            'content' => $post->getOriginal('content'),
        ]);
    }

    /**
     * Método que se ejecuta antes de que una publicación sea eliminada.
     */
    public function deleting(Post $post)
    {
        // Elimina el historial asociado a la publicación.
        ContentHistory::where('historable_type', Post::class)
            ->where('historable_id', $post->id)
            ->delete();

        // Elimina las menciones hechas en la publicación.
        $post->mentions()->delete();

        // Recorre los comentarios de la publicación.
        $post->comments()->get()->each(function (Comment $comment) {
            // Elimina las menciones hechas en el comentario.
            $comment->mentions()->delete();

            // Elimina las notificaciones de menciones hechas en el comentario.
            DatabaseNotification::where('type', NewMention::class)
                ->where('data->data->context->type', 'comment')
                ->where('data->data->context->id', $comment->id)
                ->delete();
        });
        
        // Elimina las notificaciones de comentarios en la publicación.
        DatabaseNotification::where('type', NewCommentOnPost::class)
            ->where('data->data->context->type', 'post')
            ->where('data->data->context->id', $post->id)
            ->delete();

        // Elimina las notificaciones de menciones hechas en la publicación.
        DatabaseNotification::where('type', NewMention::class)
            ->where('data->data->context->type', 'post')
            ->where('data->data->context->id', $post->id)
            ->delete();
    }
}