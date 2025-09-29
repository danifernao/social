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
     * Alterna (seguir/dejar de seguir) la relación de seguimiento entre el usuario autenticado y otro usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario al que se va a seguir o dejar de seguir.
     */
    public function toggle(Request $request, User $user)
    {
        $auth_user = $request->user();

        // No se permite que un usuario se siga a sí mismo.
        if ($auth_user->id === $user->id) {
            return back()->withErrors(['message' => 'No puedes seguirte a ti mismo.']);
        }

        // Si hay un bloqueo entre ambos usuarios, no se permite seguir.
        if ($auth_user->hasBlocked($user) || $user->hasBlocked($auth_user)) {
            return back()->withErrors(['message' => 'No puedes seguir a este usuario porque existe un bloqueo entre ustedes.']);
        }

        // Alterna la relación de seguimiento (si ya seguía, se elimina; si no, se agrega).
        $result = $auth_user->follows()->toggle($user->id);

        // Verifica si el usuario estaba siguiendo antes de la operación.
        $was_following = in_array($user->id, $result['detached']);

        // Si comenzó a seguir (no estaba siguiendo antes), notifica al usuario seguido.
        if ($was_following === false) {
            $user->notify(new NewFollower($auth_user));
        }

        return back()->with('status', 'toggled');
    }

    /**
     * Muestra la lista paginada de usuarios que sigue un usuario dado.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuya lista de seguidos se va a mostrar.
     */
    public function showFollowing(Request $request, User $user)
    {
        $auth_user = $request->user();
        $cursor = $request->header('X-Cursor');

        // Se excluyen usuarios con bloqueos.
        $excluded_ids = $auth_user->excludedUserIds();

        // Obtiene los usuarios que el usuario sigue, con conteo.
        $following = $user->follows()
            ->whereNotIn('users.id', $excluded_ids)
            ->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // Obtiene los IDs de usuarios que el usuario autenticado sigue.
        $following_ids = $auth_user->followedUserIds();

        // Marca si cada usuario seguido también es seguido por el autenticado.
        $following->setCollection(
            $auth_user
                ? $auth_user->markFollowStateForCollection($following->getCollection())
                : $following->getCollection()->map(fn($u) => $u->setAttribute('is_followed', null))
        );

        return Inertia::render('follow/index', [
            'user' => (new UserResource($user))->resolve(),
            'following' => UserResource::collection($following),
        ]);
    }

    /**
     * Muestra la lista paginada de seguidores de un usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuya lista de seguidores se va a mostrar.
     */
    public function showFollowers(Request $request, User $user)
    {
        $auth_user = $request->user();
        $cursor = $request->header('X-Cursor');

        // Se excluyen usuarios con bloqueos.
        $excluded_ids = $auth_user->excludedUserIds();

        // Obtiene los seguidores del usuario con conteo de seguidores y seguidos.
        $followers = $user->followers()
            ->whereNotIn('users.id', $excluded_ids)
            ->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // Obtiene los IDs de usuarios que el usuario autenticado sigue.
        $following_ids = $auth_user->followedUserIds();

        // Marca en cada seguidor si el usuario autenticado lo sigue o no.
        $followers->setCollection(
            $auth_user
                ? $auth_user->markFollowStateForCollection($followers->getCollection())
                : $followers->getCollection()->map(fn($u) => $u->setAttribute('is_followed', null))
        );

        return Inertia::render('follow/index', [
            'user' => (new UserResource($user))->resolve(),
            'followers' => UserResource::collection($followers),
        ]);
    }
}