<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewPostOnProfile;
use App\Services\HashtagService;
use App\Services\MentionService;
use App\Utils\MentionParser;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Pagination\CursorPaginator;
use Inertia\Inertia;

class PostController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected HashtagService $hashtagService,
        protected MentionService $mentionService
    ) {}

    /**
     * Crea una nueva publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Usuario autenticado.
        $auth_user = $request->user();

        // Valida los datos de la solicitud.
        $data = $request->validate([
            'content' => 'required|string|max:3000',
            'profile_user_id' => 'nullable|integer|exists:users,id',
        ]);
        
        // ID del usuario cuyo perfil se está visitando.
        $profile_user_id = null;

        // Si se envía un profile_user_id válido, que no sea el mismo usuario,
        // y el usuario autenticado tiene permisos de moderación,
        // entonces se guarda ese profile_user_id en la publicación.
        if (!empty($data['profile_user_id']) &&
            $data['profile_user_id'] !== $auth_user->id &&
            $auth_user->canModerate()) {
                $profile_user_id = $data['profile_user_id'];
        }

        // Crea la publicación.
        $post = Post::create([
            'user_id' => $auth_user->id,
            'content' => $data['content'],
            'profile_user_id' => $profile_user_id,
        ]);

        // Si es una publicación en perfil ajeno, notifica al dueño del perfil.
        if ($profile_user_id) {
            $profileUser = User::find($profile_user_id);
            if ($profileUser) {
                $profileUser->notify(new NewPostOnProfile($auth_user, $post->id));
            }
        }

        // Agrega el usuario autenticado a la publicación.
        $post->setRelation('user', $auth_user);

        // Registra las etiquetas usadas en la publicación.
        $this->hashtagService->sync($post);

        // Guarda menciones y envía notificaciones.
        $this->mentionService->createWithNotifications($post, $auth_user, 'post');

        // Prepara el recurso y lo convierte en un arreglo.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Muestra una publicación específica con sus comentarios.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a mostrar.
     * @param Comment|null $comment Comentario individual que se va a mostrar.
     */
    public function show(Request $request, Post $post, Comment $comment = null)
    {
        $user = $request->user();

        // Si existe un usuario autenticado, se verifica que no
        // haya bloqueos mutuos con el autor de la publicación.
        if ($user) {
            $author = $post->user()->first();
            if ($user->hasBlockedOrBeenBlockedBy($author)) {
                abort(403); // No puede ver la publicación.
            }
        }

        // Si se recibió un comentario, se valida que pertenezca a la publicación.
        if ($comment && $comment->post_id !== $post->id) {
            abort(404);
        }

        // Carga relaciones y reacciones.
        $post->load('user')->loadCount('comments');
        $post->reactions = $post->reactionsSummary($user?->id);

        // Se captura el cursor de la paginación.
        $cursor = $request->header('X-Cursor');

        // Número de elementos por página en la paginación de comentarios.
        $per_page = 15;

        // Consulta base de comentarios de la publicación.
        $comments_query = $post->comments()->with('user')->oldest();

        // Excluye comentarios de usuarios con bloqueos mutuos.
        if ($user) {
            $excluded_ids = $user->excludedUserIds();
            $comments_query->whereNotIn('user_id', $excluded_ids);
        }

        // Si hay comentario específico, se crea paginador manual.
        if ($comment) {
            $comment->load('user');
            $comments = new CursorPaginator([$comment], $per_page, null, [
                'path' => $request->url(),
                'cursorName' => 'cursor',
            ]);
        } else {
            $comments = $comments_query->cursorPaginate($per_page, ['*'], 'cursor', $cursor);
        }

        // Agrega las reacciones a cada comentario.
        $comments->setCollection(
            $comments->getCollection()->map(function ($comment) use ($user) {
                $comment->reactions = $comment->reactionsSummary($user?->id);
                return $comment;
            })
        );

        return Inertia::render('post/show', [
            'post' => (new PostResource($post))->resolve(),
            'comments' => CommentResource::collection($comments),
        ]);
    }

    /**
     * Actualiza una publicación existente.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a actualizar.
     */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        $post->content = $request->content;
        $post->save();

        $post->load('user');

        // Actualiza las etiquetas usadas en la publicación.
        $this->hashtagService->sync($post);

        // Actualiza las menciones hechas en la publicación.
        $this->mentionService->sync($post, $request->user());

        // Prepara el recurso y lo convierte en un arreglo.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Elimina una publicación.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a eliminar.
     */
    public function delete(Request $request, Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        // Elimina las etiquetas usadas en la publicación.
        $this->hashtagService->detachAndClean($post);

        $referer = $request->header('referer');

        // Si el usuario estaba viendo la publicación eliminada, redirige al perfil.
        if ($referer && str_contains($referer, "/post/{$post->id}")) {
            return redirect()->route('profile.show', $post->user->username);
        }

        return back()->with('status', 'post_deleted');
    }
}