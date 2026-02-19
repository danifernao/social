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
        return $this->canModify($user, $comment);
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
        return $this->canModify($user, $comment);
    }

    /**
     * Verifica si un usuario puede modificar (actualizar o eliminar)
     * un comentario.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Comment $comment Comentario sobre el que se realiza la acción.
     * @return bool
     */
    protected function canModify(User $user, Comment $comment): bool
    {
        // Los moderadores siempre pueden modificar comentarios.
        if ($user->hasAnyRole(['admin', 'mod'])) {
            return true;
        }
        
        // Si no puede ver la publicación, no puede modificar el comentario.
        if (!$user->can('view', $comment->post)) {
            return false;
        }

        // Solo el autor con permiso puede modificarlo.
        return $user->id === $comment->user_id && $user->can('comment');
    }
}