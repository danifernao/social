<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Define las reglas de autorización para las acciones que pueden
 * realizarse sobre las publicaciones.
 */
class PostPolicy
{
    /**
     * Determina si un usuario puede actualizar una publicación.
     * Solo el autor de la publicación o un moderador pueden actualizarla.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->canModerate();
    }

    /**
     * Determina si un usuario puede eliminar una publicación.
     * Solo el autor de la publicación o un moderador pueden eliminarla.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->canModerate();
    }
}