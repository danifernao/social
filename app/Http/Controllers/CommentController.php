<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
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
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación en la que se va a comentar.
     */
    public function store(Request $request, Post $post)
    {
        $auth_user = $request->user();

        // Si el usuario autenticado está bloqueado por el autor de la publicación (y no es moderador), se le deniega el comentario.
        if (!$auth_user->canModerate() && $post->user->hasBlocked($auth_user)) {
            abort(403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Crea el comentario.
        $comment = Comment::create([
            'user_id' => $auth_user->id,
            'post_id' => $post->id,
            'content' => $data['content'],
        ]);

        // Agrega el usuario autenticado al comentario.
        $comment->setRelation('user', $auth_user);

        // Extrae los usuarios mencionados en los comentarios.
        $mentioned_users = MentionParser::extractMentionedUsers($data['content']);

        // Filtra menciones de usuarios con bloqueos.
        $mentioned_users = $auth_user->filterMentionables($mentioned_users);

        // Notifica a los usuarios mencionados.
        foreach ($mentioned_users as $user) {
            $user->notify(new NewMention($comment->user, 'comment', $post->id));
        }

        // Si el autor del comentario no es el mismo que el autor de la publicación, se le notifica al autor de la publicación.
        if ($post->user_id !== $auth_user->id) {
            $post->user->notify(new NewCommentOnPost($auth_user, $post->id));
        }

        // Prepara una lista de usuarios que ya han sido notificados para evitar redundancia.
        $notified_user_ids = $mentioned_users->pluck('id')->toArray();
        $notified_user_ids[] = $auth_user->id; // Se agrega a esa lista al autor del comentario.
        $notified_user_ids[] = $post->user_id; // Se agrega a esa lista al autor de la publicación.

        // Se buscan otros comentaristas de la publicación que aún no han sido notificados.
        $other_commenters = $post->comments()
            ->whereNotIn('user_id', $notified_user_ids)
            ->select('user_id')
            ->distinct()
            ->pluck('user_id');

        // Se cargan los usuarios a notificar.
        $users_to_notify = User::whereIn('id', $other_commenters)->get();

        // Se filtran los bloqueados.
        $users_to_notify = $users_to_notify->reject(function ($user) use ($auth_user) {
            return $auth_user->hasBlocked($user) || $user->hasBlocked($auth_user);
        });

        // Se notifica a los otros comentaristas.
        $users_to_notify->each(function ($user) use ($auth_user, $post) {
            $user->notify(new NewCommentOnPost($auth_user, $post->id));
        });

        // Prepara el recurso y lo convierte en un arreglo.
        $comment_data = (new CommentResource($comment))->resolve();

        return back()->with('comment', $comment_data);
    }

    /**
     * Actualiza un comentario existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Comment $comment Comentario que se va a actualizar.
     */
    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $data = $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        $comment->content = $data['content'];
        $comment->save();

        $comment->load('user');

        // Prepara el recurso y lo convierte en un arreglo.
        $comment_data = (new CommentResource($comment))->resolve();
        
        return back()->with('comment',  $comment_data);
    }

    /**
     * Elimina un comentario.
     * 
     * @param Comment $comment Comentario que se va a eliminar.
     */
    public function delete(Comment $comment)
    {
        $this->authorize('delete', $comment);
        
        $comment->delete();

        return back()->with('status', 'comment_deleted');
    }
}
