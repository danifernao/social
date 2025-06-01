<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Muestra el feed principal con las publicaciones del usuario autenticado y sus seguidos.
     *
     * - Para usuarios administradores muestra todas las publicaciones.
     * - Para usuarios normales muestra solo publicaciones propias y de los usuarios que sigue.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $cursor = $request->query('cursor');

        // Consulta para obtener las publicaciones con el autor y contador de comentarios.
        $query = Post::with('user')->withCount('comments');

        // Si el autenticado no es administrador, filtra solo las publicaciones de sí mismo y de quienes sigue.
        if (!$user->isAdmin()) {
            $followingIds = $user->followedUserIds();
            $followingIds[] = $user->id; // Esto incluye sus propias publicaciones.

            $query->whereIn('user_id', $followingIds);
        }

        // Obtiene las publicaciones.
        $posts = $query->latest()
            ->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Agrega las reacciones a cada publicación.
        $posts->setCollection(
            $posts->getCollection()->map(function ($post) use ($user) {
                $post->reactions = $post->reactionsSummary($user->id);
                return $post;
            })
        );

        return Inertia::render('home/index', [
            'posts' => $posts,
        ]);
    }
}
