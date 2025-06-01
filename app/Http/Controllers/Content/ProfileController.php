<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\Paginator;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Muestra el perfil de un usuario junto con sus publicaciones.
     * 
     * @param User $user Usuario cuyo perfil se va a mostrar.
     */
    public function show(Request $request, User $user)
    {
        $auth_user = $request->user();

        // Carga el conteo de seguidores y seguidos del usuario cuyo perfil se está viendo.
        $user->loadCount(['followers', 'follows']);

        // Determina si el usuario autenticado sigue al perfil visitado.
        if ($auth_user && $auth_user->id !== $user->id) {
            $user->isFollowing = $auth_user->follows()
                ->where('followed_id', $user->id)
                ->exists();
        } else {
            $user->isFollowing = null; // No aplica para uno mismo o usuarios no autenticados.
        }

        $isBlocked = false;

        // Determina si el perfil está bloqueado desde la perspectiva del usuario autenticado.
        if ($auth_user && $auth_user->id !== $user->id && !$auth_user->isAdmin()) {
            $isBlocked = in_array($user->id, $auth_user->excludedUserIds());
        }

        $cursor = $request->query('cursor');

        if ($isBlocked) {
            // Si hay bloqueo mutuo, no se deben mostrar publicaciones.
            $posts = collect([])->forPage(1, 7); // Crea una colección vacía paginada.
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
            // Obtiene las publicaciones del perfil.
            $posts = Post::with('user')
                ->withCount('comments')
                ->where('user_id', $user->id)
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

        // Se pasa esta marca al frontend para ocultar interacciones si es necesario.
        $user->isBlocked = !$auth_user || $auth_user->id === $user->id ? null : $isBlocked;

        return Inertia::render('profile/index', [
            'user' => $user,
            'posts' => $posts,
        ]);
    }
}