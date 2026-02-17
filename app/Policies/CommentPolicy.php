<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Define las reglas de autorización para las acciones que pueden
 * realizarse sobre los comentarios.
 */
class CommentPolicy
{
    /**
     * Determina si un usuario puede actualizar un comentario.
     *
     * @param User    $user    Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function update(User $user, Comment $comment): bool
    {
        // Si el usuario autenticado no es el autor o moderador, no
        // puede actualizar el comentario.
        if (
            !($user->id === $comment->user_id && $user->can('comment'))
            && !$user->hasAnyRole(['admin', 'mod'])
        ) {
            return false;
        }

        // Si hay un bloqueo mutuo entre el usuario autenticado y el autor
        // de la publicación, no puede interactuar con el comentario.
        if ($user->hasBlockedOrBeenBlockedBy($comment->post->user)) {
            return false;
        }

        return true;
    }

    /**
     * Determina si un usuario puede eliminar un comentario.
     *
     * @param User    $user    Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Si el usuario autenticado no es el autor o moderador, no
        // puede eliminar el comentario.
        if (
            !($user->id === $comment->user_id && $user->can('comment'))
            && !$user->hasAnyRole(['admin', 'mod'])
        ) {
            return false;
        }

        // Si hay un bloqueo mutuo entre el usuario autenticado y el autor
        // de la publicación, no puede interactuar con el comentario.
        if ($user->hasBlockedOrBeenBlockedBy($comment->post->user)) {
            return false;
        }

        return true;
    }
}