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
     * Método que se ejecuta antes de que una publicación sea eliminada.
     */
    public function deleting(Post $post)
    {
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