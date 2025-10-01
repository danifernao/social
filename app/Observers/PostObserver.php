<?php

namespace App\Observers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Notifications\DatabaseNotification;
use App\Notifications\NewCommentOnPost;
use App\Notifications\NewMention;

class PostObserver
{
    /**
     * Método que se ejecuta automáticamente antes de que un modelo Post sea eliminado.
     */
    public function deleting(Post $post)
    {
        // Elimina las menciones hechas en la publicación.
        $post->mentions()->delete();
        
        $post->comments->each(function (Comment $comment) {
            // Elimina las menciones hechas en los comentarios.
            $comment->mentions()->delete();

            // Elimina las notificaciones de menciones hechas en el comentario.
            DatabaseNotification::where('type', NewMention::class)
                ->whereJsonContains('data->context->type', 'comment')
                ->whereJsonContains('data->context->id', $comment->id)
                ->delete();
        });

        // Elimina las notificaciones de comentarios en la publicación.
        DatabaseNotification::whereJsonContains('data->context->type', 'post')
            ->whereJsonContains('data->context->id', $post->id)
            ->delete();

        // Elimina las notificaciones de menciones hechas en la publicación.
        DatabaseNotification::where('type', NewMention::class)
            ->whereJsonContains('data->context->type', 'post')
            ->whereJsonContains('data->context->id', $post->id)
            ->delete();
    }
}