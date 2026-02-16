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
     * Determina si un usuario puede crear un comentario.
     *
     * @param User $user Usuario que intenta hacer la acción.
     * @return bool
     */
    public function create(User $user): bool
    {
        $user->loadMissing('permission');

        return $user->permission->can_comment;
    }

    /**
     * Determina si un usuario puede actualizar un comentario.
     * Solo el autor del comentario o un moderador pueden actualizarlo.
     *
     * @param User $user Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function update(User $user, Comment $comment): bool
    {
        $user->loadMissing('permission');

        return (
            $user->id === $comment->user_id 
            && $user->permission->can_comment
        ) 
        || $user->canModerate();
    }

    /**
     * Determina si un usuario puede eliminar un comentario.
     * Solo el autor del comentario o un moderador pueden eliminarlo.
     *
     * @param User $user Usuario que intenta hacer la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id || $user->canModerate();
    }
}