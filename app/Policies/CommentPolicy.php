<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CommentPolicy
{
    /**
     * Determina si un usuario puede actualizar un comentario.
     * Solo el autor del comentario o un administrador pueden actualizarlo.
     *
     * @param User $user Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function update(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id || $user->isAdmin();
    }

    /**
     * Determina si un usuario puede eliminar un comentario.
     * Solo el autor del comentario o un administrador pueden eliminarlo.
     *
     * @param User $user Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id || $user->isAdmin();
    }
}