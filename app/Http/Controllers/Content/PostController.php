<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewMention;
use App\Utils\MentionParser;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Crea una nueva publicación.
     */
    public function create(Request $request)
    {
        $data = $request->validate([
            'content' => 'required|string|max:140'
        ]);

        $auth_user = $request->user();

        // Crea la publicación.
        $post = Post::create([
            'user_id' => $auth_user->id,
            'content' => $data['content'],
        ]);

        // Agrega el usuario autenticado a la publicación.
        $post->user = $auth_user;

        // Extrae los usuarios mencionados en la publicación.
        $mentionedUsers = MentionParser::extractMentionedUsers($data['content']);

        // Filtra menciones si el usuario autenticado no es administrador.
        if (!$auth_user->isAdmin()) {
            $mentionedUsers = $auth_user->filterMentionables($mentionedUsers);
        } else {
            // Si es administrador, puede mencionar a quien desee, menos a sí mismo.
            $mentionedUsers = $mentionedUsers->reject(fn ($user) => $user->id === $auth_user->id);
        }

        // Envía notificación a los usuarios mencionados.
        foreach ($mentionedUsers as $user) {
            $user->notify(new NewMention($auth_user, 'post', $post->id));
        }

        return back()->with('post', $post);
    }

    /**
     * Muestra una publicación específica con sus comentarios.
     */
    public function show(Request $request, Post $post)
    {
        $user = $request->user();

        // Si está autenticado y no es administrador, verifica bloqueos mutuos.
        if ($user && !$user->isAdmin()) {
            $author = $post->user()->first();

            if ($user->hasBlockedOrBeenBlockedBy($author)) {
                abort(404); // No puede ver la publicación.
            }
        }

        // Carga relaciones y reacciones.
        $post->load('user');
        $post->loadCount('comments');
        $post->reactions = $post->reactionsSummary($user?->id);

        $cursor = $request->query('cursor');

        // Consulta de comentarios.
        $commentsQuery = $post->comments()->with('user')->oldest();

        // Aplica exclusiones si el usuario autenticado no es administrador.
        if ($user && !$user->isAdmin()) {
            $excludedIds = $user->excludedUserIds();
            $commentsQuery->whereNotIn('user_id', $excludedIds);
        }

        $comments = $commentsQuery->cursorPaginate(15, ['*'], 'cursor', $cursor);

        // Agrega las reacciones a cada comentario.
        $comments->setCollection(
            $comments->getCollection()->map(function ($comment) use ($user) {
                $comment->reactions = $comment->reactionsSummary($user?->id);
                return $comment;
            })
        );

        return Inertia::render('post/index', [
            'post' => $post,
            'comments' => $comments,
        ]);
    }

    /**
     * Actualiza una publicación existente.
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        $request->validate([
            'content' => 'required|string|max:140',
        ]);

        $post->content = $request->content;
        $post->save();

        $post->load('user');

        return back()->with('post', $post);
    }

    /**
     * Elimina una publicación.
     */
    public function delete(Request $request, Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        $referer = $request->header('referer');

        // Si el usuario estaba viendo la publicación eliminada, redirige al perfil.
        if ($referer && str_contains($referer, "/post/{$post->id}")) {
            return redirect()->route('profile.show', $post->user->username);
        }

        return back()->with('status', 'deleted');
    }
}