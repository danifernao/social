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

    // Inyecta los servicios HashtagService y MentionService
    // para gestionar las etiquetas y menciones presentes en una publicación.
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
        $auth_user = $request->user();

        // Valida la solicitud y obtiene los datos que
        // cumplen con las reglas definidas.
        $data = $request->validate([
            'content' => 'required|string|max:3000',
            'profile_user_id' => 'nullable|integer|exists:users,id',
        ]);
        
        // ID del perfil en donde se hará la publicación (si aplica).
        // Por defecto, la publicación se asociará al perfil del
        // usuario autenticado (user_id). profile_user_id solo cambia cuando
        // el usuario autenticado publica en el perfil de otra persona.
        $profile_user_id = null;

        // Permite publicar en el perfil de otro usuario solo si:
        // - Se envió un profile_user_id válido.
        // - No es el mismo usuario autenticado.
        // - El usuario autenticado tiene permisos de moderación.
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

        // Si se publicó en un perfil ajeno, notifica al propietario del perfil.
        if ($profile_user_id) {
            $profileUser = User::find($profile_user_id);
            if ($profileUser) {
                $profileUser->notify(
                    new NewPostOnProfile($auth_user, $post->id)
                );
            }
        }

        // Relaciona el usuario autenticado con la publicación
        // (solo en memoria).
        $post->setRelation('user', $auth_user);

        // Registra las etiquetas presentes en la publicación.
        $this->hashtagService->sync($post);

        // Detecta, registra y notifica las menciones presentes
        // en la publicación.
        $this->mentionService
            ->createWithNotifications($post, $auth_user, 'post');

        // Genera el arreglo final de la publicación
        // aplicando la transformación definida en PostResource.
        $post_data = (new PostResource($post))->resolve();

        return back()->with('post', $post_data);
    }

    /**
     * Muestra una publicación específica con sus comentarios.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Post $post Publicación que se va a mostrar.
     * @param Comment|null $comment Comentario específico a mostrar (opcional).
     */
    public function show(Request $request, Post $post, Comment $comment = null)
    {
        $user = $request->user();

        // Si hay usuario autenticado, se verifica que no exista bloqueo mutuo
        // entre él y el autor de la publicación.
        if ($user) {
            $author = $post->user()->first();
            if ($user->hasBlockedOrBeenBlockedBy($author)) {
                abort(403);
            }
        }

        // Si se indicó un comentario, se confirma que
        // pertenezca a la publicación.
        if ($comment && $comment->post_id !== $post->id) {
            abort(404);
        }

        // Carga el autor y la cantidad total de comentarios.
        $post->load('user')->loadCount('comments');

        // Obtiene las reacciones de la publicación.
        $post->reactions = $post->reactionsSummary($user?->id);

        // Captura el cursor de la paginación.
        $cursor = $request->header('X-Cursor');

        // Cantidad de comentarios por página.
        $per_page = 15;

        // Consulta base de comentarios de la publicación.
        $comments_query = $post->comments()->with('user')->oldest();

        // Excluye comentarios de usuarios con bloqueos mutuos.
        if ($user) {
            $excluded_ids = $user->excludedUserIds();
            $comments_query->whereNotIn('user_id', $excluded_ids);
        }

        // Si se solicita un comentario específico,
        // se crea una paginación manual.
        if ($comment) {
            $comment->load('user');
            $comments = new CursorPaginator([$comment], $per_page, null, [
                'path' => $request->url(),
                'cursorName' => 'cursor',
            ]);
        } else {
            // Obtiene los comentarios paginados por cursor.
            $comments = $comments_query
                ->cursorPaginate($per_page, ['*'], 'cursor', $cursor);
        }

        // Agrega las reacciones a cada comentario.
        $comments->setCollection(
            $comments->getCollection()->map(function ($comment) use ($user) {
                $comment->reactions = $comment->reactionsSummary($user?->id);
                return $comment;
            })
        );

        // Genera el arreglo final de la publicación
        // aplicando la transformación definida en PostResource.
        $post_data = (new PostResource($post))->resolve();

        return Inertia::render('post/show', [
            'post' => $post_data,
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
        // Deniega acceso si el usuario no está autorizado
        // para actualizar la publicación.
        $this->authorize('update', $post);

        // Valida que los datos de la solicitud
        // cumplan con los requisitos esperados.
        $request->validate([
            'content' => 'required|string|max:3000',
        ]);

        // Actualiza el contenido de la publicación.
        $post->content = $request->content;
        $post->save();

        // Carga la relación con el usuario autor.
        $post->load('user');

        // Actualiza las etiquetas presentes en la publicación.
        $this->hashtagService->sync($post);

        // Actualiza las menciones presentes en la publicación.
        $this->mentionService->sync($post, $request->user());

        // Genera el arreglo final de la publicación
        // aplicando la transformación definida en PostResource.
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
        // Deniega acceso si el usuario no está autorizado
        // para eliminar la publicación.
        $this->authorize('delete', $post);

        // Elimina la publicación.
        $post->delete();

        // Elimina la relación de etiquetas asociadas a la publicación
        // y aquellas que ya no estén en uso.
        $this->hashtagService->detachAndClean($post);

        $referer = $request->header('referer');

        // Si el usuario estaba en la página de la publicación eliminada,
        // redirige al perfil del autor.
        if ($referer && str_contains($referer, "/post/{$post->id}")) {
            return redirect()->route('profile.show', $post->user->username);
        }

        return back()->with('status', 'post_deleted');
    }
}