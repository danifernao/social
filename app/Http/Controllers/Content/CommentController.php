<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewCommentOnPost;
use App\Notifications\NewMention;
use App\Utils\MentionParser;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CommentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Crea un nuevo comentario asociado a una publicación.
     * 
     * @param Post $post Publicación en la que se va a comentar.
     */
    public function create(Request $request, Post $post)
    {
        $auth_user = $request->user();

        // Si el usuario autenticado está bloqueado por el autor de la publicación (y no es administrador), se le deniega el comentario.
        if (!$auth_user->isAdmin() && $post->user->hasBlocked($auth_user)) {
            abort(403, 'No puedes comentar en esta publicación.');
        }

        $data = $request->validate([
            'content' => 'required|string|max:140',
        ]);

        // Crea el comentario.
        $comment = Comment::create([
            'user_id' => $auth_user->id,
            'post_id' => $post->id,
            'content' => $data['content'],
        ]);

        // Agrega el usuario autenticado al comentario.
        $comment->user = $auth_user;

        // Extrae los usuarios mencionados en los comentarios.
        $mentionedUsers = MentionParser::extractMentionedUsers($data['content']);

        // Filtra menciones si el usuario autenticado no es administrador.
        if (!$auth_user->isAdmin()) {
            $mentionedUsers = $auth_user->filterMentionables($mentionedUsers);
        } else {
            // Si es administrador, puede mencionar a quien desee, menos a sí mismo.
            $mentionedUsers = $mentionedUsers->reject(fn ($user) => $user->id === $auth_user->id);
        }

        // Notifica a los usuarios mencionados.
        foreach ($mentionedUsers as $user) {
            $user->notify(new NewMention($comment->user, 'comment', $post->id));
        }

        // Si el autor del comentario no es el mismo que el autor de la publicación, se le notifica al autor de la publicación.
        if ($post->user_id !== $auth_user->id) {
            $post->user->notify(new NewCommentOnPost($auth_user, $post->id));
        }

        // Prepara una lista de usuarios que ya han sido notificados para evitar redundancia.
        $notifiedUserIds = $mentionedUsers->pluck('id')->toArray();
        $notifiedUserIds[] = $auth_user->id; // Se agrega a esa lista al autor del comentario.
        $notifiedUserIds[] = $post->user_id; // Se agrega a esa lista al autor de la publicación.

        // Se buscan otros comentaristas de la publicación que aún no han sido notificados.
        $otherCommenters = $post->comments()
            ->whereNotIn('user_id', $notifiedUserIds)
            ->select('user_id')
            ->distinct()
            ->pluck('user_id');

        // Se cargan los usuarios a notificar.
        $usersToNotify = User::whereIn('id', $otherCommenters)->get();

        // Si el autenticado no es administrador, se filtran los bloqueados.
        if (!$auth_user->isAdmin()) {
            $usersToNotify = $usersToNotify->reject(function ($user) use ($auth_user) {
                return $auth_user->hasBlocked($user) || $user->hasBlocked($auth_user);
            });
        }

        // Se notifica a los otros comentaristas.
        $usersToNotify->each(function ($user) use ($auth_user, $post) {
            $user->notify(new NewCommentOnPost($auth_user, $post->id));
        });

        return back()->with('comment', $comment);
    }

    /**
     * Actualiza un comentario existente.
     */
    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $data = $request->validate([
            'content' => 'required|string|max:140',
        ]);

        $comment->content = $data['content'];
        $comment->save();

        $comment->load('user');

        return back()->with('comment', $comment);
    }

    /**
     * Elimina un comentario.
     */
    public function delete(Comment $comment)
    {
        $this->authorize('delete', $comment);
        
        $comment->delete();

        return back()->with('status', 'deleted');
    }
}
