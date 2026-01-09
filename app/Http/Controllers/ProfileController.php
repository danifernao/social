<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\Paginator;
use Inertia\Inertia;

/**
 * Controlador responsable de la visualización de perfiles de usuario.
 *
 * Permite mostrar la información de un usuario, su lista de publicaciones,
 * y la relación con el usuario autenticado (seguimiento y bloqueos).
 */
class ProfileController extends Controller
{
    /**
     * Muestra el perfil de un usuario junto con sus publicaciones.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuyo perfil se va a mostrar.
     */
    public function show(Request $request, User $user)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Deniega acceso si hay un bloqueo mutuo entre el perfil
        // y el usuario autenticado.
        if ($auth_user && $user->hasBlocked($auth_user)) {
          abort(403);
        }

        // Carga el conteo de seguidores y seguidos del usuario del perfil.
        $user->loadCount(['followers', 'follows']);

        // Determina si el usuario autenticado sigue al perfil visitado.
        if ($auth_user && $auth_user->id !== $user->id) {
            $user->is_followed = $auth_user->follows()
                ->where('followed_id', $user->id)
                ->exists();
        } else {
            // No aplica para uno mismo o usuarios no autenticados.
            $user->is_followed = null;
        }

        $is_blocked = false;

        // Verifica si el perfil visitado aparece entre los usuarios
        // bloqueados por el usuario autenticado.
        if ($auth_user && $auth_user->id !== $user->id) {
            $is_blocked = in_array($user->id, $auth_user->excludedUserIds());
        }

        // Captura el cursor de paginación.
        $cursor = $request->header('X-Cursor');

        if ($is_blocked) {
            // Si existe un bloqueo, no se deben mostrar publicaciones.
            // Se genera un paginador vacío para mantener
            // la estructura esperada.
            $posts = collect([])->forPage(1, 7);
            $posts = new CursorPaginator(
                $posts,
                null,
                null,
                [
                    'path' => Paginator::resolveCurrentPath(),
                    'cursorName' => 'cursor',
                ]
            );
        } else {
            // Obtiene las publicaciones asociadas al perfil del usuario.
            // Incluye las publicaciones hechas en el perfil y las propias.
            $posts = Post::with('user')
                ->withCount('comments')
                ->where(function ($query) use ($user) {
                    $query->where('profile_user_id', $user->id)
                          ->orWhere(function ($q2) use ($user) {
                              $q2->whereNull('profile_user_id')
                                ->where('user_id', $user->id);
                          });
                })
                ->latest()
                ->cursorPaginate(7, ['*'], 'cursor', $cursor);

            // Agrega las reacciones a cada publicación.
            $posts->setCollection(
                $posts->getCollection()->map(function ($post) use ($auth_user) {
                    $post->reactions = $post->reactionsSummary($auth_user?->id);
                    return $post;
                })
            );
        }

        // Transforma el usuario utilizando UserResource para el frontend.
        $user_data = (new UserResource($user))->resolve();

        return Inertia::render('profile/show', [
            'user' => $user_data,
            'posts' => PostResource::collection($posts),
        ]);
    }
}