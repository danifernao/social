<?php

namespace App\Observers;

use App\Models\Post;
use App\Models\Comment;
use App\Notifications\NewCommentOnPost;
use App\Notifications\NewMention;
use Illuminate\Notifications\DatabaseNotification;

class PostObserver
{
    /**
     * Método que se ejecuta automáticamente antes de que un modelo Post sea eliminado.
     */
    public function deleting(Post $post)
    {
        // Elimina las menciones hechas en esta publicación.
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
        
        // Elimina las notificaciones de comentarios en esta publicación.
        DatabaseNotification::where('type', NewCommentOnPost::class)
            ->where('data->data->context->type', 'post')
            ->where('data->data->context->id', $post->id)
            ->delete();

        // Elimina las notificaciones de menciones hechas en esta publicación.
        DatabaseNotification::where('type', NewMention::class)
            ->where('data->data->context->type', 'post')
            ->where('data->data->context->id', $post->id)
            ->delete();
    }
}