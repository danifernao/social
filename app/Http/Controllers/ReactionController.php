<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    /**
     * Crea, reemplaza o elimina una reacción de un usuario
     * sobre una publicación o comentario.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function toggle(Request $request)
    {
        // "type":  indica si la reacción pertenece a una publicación
        //          o a un comentario.
        // "id":    ID de la publicación o comentario al que se reacciona.
        // "emoji": Emoji que representa la reacción.
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
        // o lanza 404 si no existe.
         $model = $type === 'post' 
            ? Post::findOrFail($id) 
            : Comment::findOrFail($id);

        // Busca si ya existe una reacción previa del usuario.
        $existing = $model->reactions()->where('user_id', $user->id)->first();

        if ($existing) {
            // Si el emoji es el mismo, se elimina la reacción.
            if ($existing->emoji === $emoji) {
                $existing->delete();
                return back()->with('status', 'reaction_deleted');
            }

            // Si el emoji es distinto, se reemplaza la reacción anterior
            // por la nueva.
            $existing->update(['emoji' => $emoji]);
            
            return back()->with('status', 'reaction_replaced');
        }

        // Si no existe una reacción previa, se registra una nueva.
        $model->reactions()->create([
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);

        return back()->with('status', 'reaction_created');
    }
}