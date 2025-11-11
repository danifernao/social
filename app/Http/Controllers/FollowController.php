<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\NewFollower;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FollowController extends Controller
{
    /**
     * Alterna la relación de seguimiento entre el usuario autenticado y otro usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario al que se va a seguir o dejar de seguir.
     */
    public function toggle(Request $request, User $user)
    {
        $auth_user = $request->user();

        // Evita que el usuario autenticado se siga a sí mismo.
        if ($auth_user->id === $user->id) {
            return back()->withErrors([
                'message' => __('Following yourself is not allowed.'),
            ]);
        }

        // Impide seguir a un usuario si existe un bloqueo en cualquier dirección.
        if ($auth_user->hasBlocked($user) || $user->hasBlocked($auth_user)) {
            return back()->withErrors([
                'message' => 'Following this user is not allowed because there is a block between you.',
            ]);
        }

        // Alterna la relación de seguimiento:
        // - Si ya seguía al usuario, la elimina.
        // - Si no lo seguía, la crea.
        $result = $auth_user->follows()->toggle($user->id);

        // Determina si el usuario autenticado dejó de seguir al otro usuario.
        $was_following = in_array($user->id, $result['detached']);

        // Si lo comenzó a seguir, envía una notificación al usuario seguido.
        if (!$was_following) {
            $user->notify(new NewFollower($auth_user));
        }

        return back()->with('status', 'follow_toggled');
    }

    /**
     * Muestra la lista paginada de usuarios que sigue un usuario dado.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuya lista de seguidos se desea mostrar.
     */
    public function showFollowing(Request $request, User $user)
    {
        $auth_user = $request->user();
        $cursor = $request->header('X-Cursor');

        // IDs de usuarios bloqueados por el usuario autenticado o que lo han bloqueado.
        $excluded_ids = $auth_user->excludedUserIds();

        // Obtiene los usuarios que el usuario dado sigue.
        $following = $user->follows()
            ->whereNotIn('users.id', $excluded_ids)
            ->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // IDs de usuarios seguidos por el usuario autenticado.
        $following_ids = $auth_user->followedUserIds();

        // Agrega a cada usuario la propiedad "is_followed" indicando si el usuario autenticado lo sigue.
        // Si no hay usuario autenticado, todos los elementos de la colección tendrán "is_followed" con valor "null".
        $following->setCollection(
            $auth_user
                ? $auth_user->withFollowStatus($following->getCollection())
                : $following->getCollection()->map(fn($u) => $u->setAttribute('is_followed', null))
        );

        // Genera el arreglo final del usuario aplicando la transformación definida en UserResource.
        $user_data = (new UserResource($user))->resolve();

        return Inertia::render('follow/index', [
            'user' => $user_data,
            'following' => UserResource::collection($following),
        ]);
    }

    /**
     * Muestra la lista paginada de seguidores de un usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuya lista de seguidores se desea mostrar.
     */
    public function showFollowers(Request $request, User $user)
    {
        $auth_user = $request->user();
        $cursor = $request->header('X-Cursor');

        // IDs de usuarios bloqueados por el usuario autenticado o que lo han bloqueado.
        $excluded_ids = $auth_user->excludedUserIds();

        // Obtiene los usuarios que siguen al usuario dado.
        $followers = $user->followers()
            ->whereNotIn('users.id', $excluded_ids)
            ->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // IDs de usuarios seguidos por el usuario autenticado.
        $following_ids = $auth_user->followedUserIds();

        // Agrega a cada usuario la propiedad "is_followed" indicando si el usuario autenticado lo sigue.
        // Si no hay usuario autenticado, todos los elementos de la colección tendrán "is_followed" con valor "null".
        $followers->setCollection(
            $auth_user
                ? $auth_user->withFollowStatus($followers->getCollection())
                : $followers->getCollection()->map(fn($u) => $u->setAttribute('is_followed', null))
        );

        // Genera el arreglo final del usuario aplicando la transformación definida en UserResource.
        $user_data = (new UserResource($user))->resolve();

        return Inertia::render('follow/index', [
            'user' => $user_data,
            'followers' => UserResource::collection($followers),
        ]);
    }
}