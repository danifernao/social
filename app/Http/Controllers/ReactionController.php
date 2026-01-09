<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;

/**
 * Controlador responsable de gestionar las reacciones de los usuarios.
 *
 * Permite crear, reemplazar o eliminar reacciones (emojis) asociadas
 * a publicaciones o comentarios, garantizando que cada usuario tenga
 * una única reacción por elemento.
 */
class ReactionController extends Controller
{
    /**
     * Crea, reemplaza o elimina una reacción de un usuario
     * sobre una publicación o un comentario.
     *
     * El comportamiento es el siguiente:
     * - Si el usuario no ha reaccionado antes, se crea una nueva reacción.
     * - Si ya reaccionó con el mismo emoji, la reacción se elimina.
     * - Si ya reaccionó con un emoji distinto, la reacción se reemplaza.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function toggle(Request $request)
    {
        // Valida los datos de la solicitud:
        // - type:   Indica si la reacción es para una publicación o comentario.
        // - id:     ID del recurso al que se aplica la reacción.
        // - emoji:  Emoji que representa la reacción.
        $request->validate([
            'type' => 'required|in:post,comment',
            'id' => 'required|integer',
            'emoji' => 'required|string|max:20',
        ]);

        $user = $request->user();
        $type = $request->type;
        $id = $request->id;
        $emoji = $request->emoji;

        // Obtiene el modelo correspondiente (Post o Comment)
        // o lanza una excepción 404 si no existe.
         $model = $type === 'post' 
            ? Post::findOrFail($id) 
            : Comment::findOrFail($id);

        // Busca si el usuario ya tiene una reacción registrada
        // sobre el recurso.
        $existing = $model->reactions()->where('user_id', $user->id)->first();

        if ($existing) {
            // Si el emoji es el mismo, se elimina la reacción.
            if ($existing->emoji === $emoji) {
                $existing->delete();
                return back()->with('status', 'reaction_deleted');
            }

            // Si el emoji es distinto, se reemplaza la reacción anterior.
            $existing->update(['emoji' => $emoji]);
            
            return back()->with('status', 'reaction_replaced');
        }

        // Si no existe una reacción previa, se crea una nueva.
        $model->reactions()->create([
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);

        return back()->with('status', 'reaction_created');
    }
}