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
        // Publicaciones normales siempre son visibles
        // para usuarios no autenticados.
        if (!$user) {
            return $post->profile_user_id === null;
        }

        // Si hay un bloqueo mutuo entre el usuario autenticado y
        // el autor de la publicación, no puede verla.
        if ($user->hasBlockedOrBeenBlockedBy($post->user)) {
            return false;
        }

        // Si es una publicación en perfil ajeno, solo el autor, el
        // dueño del perfil o el moderador pueden verla.
        if ($post->profile_user_id !== null) {
            return
                $user->hasAnyRole(['admin', 'mod']) ||
                $user->id === $post->user_id ||
                $user->id === $post->profile_user_id;
        }

        return true;
    }

    /**
     * Determina si un usuario puede comentar una publicación.
     *
     * @param User $user Usuario autenticado.
     * @param Post $post Publicación a comentar.
     * @return bool
     */
    public function comment(User $user, Post $post): bool
    {
        // Debe tener permiso para poder comentar.
        if (!$user->can('comment')) {
            return false;
        }

        // Si hay un bloqueo mutuo entre el autor de la publicación y
        // el usuario autenticado, no hay interacción alguna.
        if ($post->user->hasBlockedOrBeenBlockedBy($user)) {
            return false;
        }

        // Si no es publicación en perfil ajeno, puede comentar.
        if ($post->profile_user_id === null) {
            return true;
        }

        // Reglas especiales para publicaciones ajenas. Solo el autor, el
        // dueño del perfil o el moderador pueden verla.
        return
            $user->hasAnyRole(['admin', 'mod']) ||
            $user->id === $post->user_id ||
            $user->id === $post->profile_user_id;
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
        // Los moderadores siempre pueden actualizar publicaciones.
        if ($user->hasAnyRole(['admin', 'mod'])) {
            return true;
        }

        // Si no es el autor de la publicación o no tiene permiso para publicar,
        // no puede actualizar la publicación.
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

    /**
     * Determina si un usuario puede eliminar una publicación.
     *
     * @param User $user Usuario que intenta realizar la acción.
     * @param Post $post Publicación sobre la que se realiza la acción.
     * @return bool
     */
    public function delete(User $user, Post $post): bool
    {
        // Los moderadores siempre pueden actualizar publicaciones.
        if ($user->hasAnyRole(['admin', 'mod'])) {
            return true;
        }

        // Si no es el autor de la publicación o no tiene permiso para publicar,
        // no puede actualizar la publicación.
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