<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Muestra los resultados de búsqueda de usuarios o publicaciones.
     * También permite buscar por hashtag.
     * 
     * @param string|null $hashtag Etiqueta para filtrar las publicaciones (sin el símbolo "#").
     */
    public function show(Request $request, $hashtag = null)
    {
        $type = $hashtag ? 'post' : $request->get('type', 'post'); // Si hay hashtag, fuerza búsqueda de publicaciones.
        $query = trim($request->get('query', ''));
        $cursor = $request->get('cursor');
        $auth_user = $request->user();

        // Si el usuario no es administrador, se excluyen usuarios bloqueados o bloqueantes.
        $excludedIds = $auth_user->isAdmin() ? [] : $auth_user->excludedUserIds();

        /**
         * BÚSQUEDA DE USUARIOS
         */
        if ($type === 'user') {
            $users = User::query()
                ->when($query, fn ($q) =>
                    $q->where('username', 'like', "%{$query}%")) // Filtro por nombre de usuario.
                ->when(!$auth_user->isAdmin(), fn ($q) =>
                    $q->whereNotIn('id', $excludedIds) // Excluye bloqueados.
                )
                ->orderBy('username')
                ->cursorPaginate(15, ['*'], 'cursor', $cursor);

            // IDs de usuarios devueltos por la búsqueda.
            $userIds = $users->pluck('id');

            // Verifica cuáles de esos usuarios son seguidos por el usuario autenticado.
            $followedIds = $auth_user->follows()
                ->whereIn('followed_id', $userIds)
                ->pluck('followed_id')
                ->toArray();

            // Añade propiedad isFollowing al usuario para saber si el autenticado ya lo sigue.
            $users->setCollection(
                $users->getCollection()->map(function ($user) use ($auth_user, $followedIds) {
                    $user->isFollowing = $auth_user->id !== $user->id
                        ? in_array($user->id, $followedIds)
                        : null; // NULL para sí mismo.

                    return $user;
                })
            );

            return Inertia::render('search/index', [
                'type' => 'user',
                'query' => $query,
                'results' => $users,
            ]);
        }

        /**
         * BÚSQUEDA DE PUBLICACIONES
         */
        $postsQuery = Post::with('user')
            ->withCount('comments')
            ->latest();

        if ($hashtag) {
            $escaped = preg_quote($hashtag, '/');
            // Busca el hashtag como palabra independiente (no parte de otra palabra).
            $postsQuery->whereRaw(
                "content REGEXP ?",
                ["#[[:alnum:]_]*{$escaped}(?![[:alnum:]_])"]
            );
        } elseif ($query) {
            $postsQuery->where('content', 'like', "%{$query}%");
        }

        // Excluye publicaciones de usuarios bloqueados.
        if (!$auth_user->isAdmin()) {
            $postsQuery->whereNotIn('user_id', $excludedIds);
        }

        $posts = $postsQuery->cursorPaginate(7, ['*'], 'cursor', $cursor);

        // Añade las reacciones de cada publicación.
        $posts->setCollection(
            $posts->getCollection()->map(function ($post) use ($auth_user) {
                $post->reactions = $post->reactionsSummary($auth_user->id);
                return $post;
            })
        );

        return Inertia::render('search/index', [
            'type' => 'post',
            'query' => $hashtag ?? $query,
            'results' => $posts,
            'isHashtag' => (bool) $hashtag, // Flag para el frontend.
        ]);
    }
}