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
     * Determina si un usuario puede ver una publicación.
     *
     * @param User|null $user Usuario autenticado (opcional).
     * @param Post      $post Publicación a visualizar.
     * @return bool
     */
    public function view(?User $user, Post $post): bool
    {
        // Los moderadores siempre pueden ver las publicaciones.
        if ($user && $user->hasAnyRole(['admin', 'mod'])) {
            return true;
        }

        // Si hay un bloqueo mutuo entre el usuario autenticado y
        // el autor de la publicación, no puede verla.
        if ($user && $user->hasBlockedOrBeenBlockedBy($post->user)) {
            return false;
        }

        // Si es una publicación en perfil ajeno, solo el autor y el
        // dueño del perfil pueden verla.
        if ($post->profile_user_id !== null) {
            return $user &&
                (
                    $user->id === $post->user_id ||
                    $user->id === $post->profile_user_id
                );
        }

        // En las demás publicaciones las reglas dependen de su visibilidad.
        return match ($post->visibility) {
            'public' => true,
            'private' => $user && $user->id === $post->user_id,
            'following' => $user && $post->user->followsUser($user),
            default => false,
        };
    }

    /**
     * Determina si un usuario puede crear una publicación.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('post');
    }

    /**
     * Determina si un usuario puede actualizar una publicación.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    public function update(User $user, Post $post): bool
    {
        return $this->canModify($user, $post);
    }

    /**
     * Determina si un usuario puede eliminar una publicación.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Post $post): bool
    {
        return $this->canModify($user, $post);
    }


    /**
     * Verifica si un usuario puede modificar (actualizar o eliminar)
     * una publicación.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    protected function canModify(User $user, Post $post): bool
    {
        // Los moderadores siempre pueden modificar publicaciones.
        if ($user->hasAnyRole(['admin', 'mod'])) {
            return true;
        }

        // Si no es el autor de la publicación o no tiene permiso para publicar,
        // no puede modificar la publicación.
        if ($user->id !== $post->user_id || !$user->can('post')) {
            return false;
        }

        // Si está publicado en perfil ajeno, verifica que no haya un bloqueo
        // mutuo con el dueño del perfil.
        if ($post->profile_user_id !== null) {
            $profile_owner = $post->profileOwner;

            if ($profile_owner && $profile_owner->hasBlockedOrBeenBlockedBy($user)) {
                return false;
            }
        }

        return true;
    }
}