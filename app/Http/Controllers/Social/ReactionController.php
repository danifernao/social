<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    /**
     * Crea, reemplaza o elimina una reacción de un usuario sobre una publicación o comentario.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'type' => 'required|in:post,comment', // El tipo debe ser "post" o "comment".
            'id' => 'required|integer',           // ID de la publicación o comentario al que se reacciona.
            'emoji' => 'required|string|max:20',  // Emoji de la reacción.
        ]);

        $user = $request->user();
        $type = $request->type;
        $id = $request->id;
        $emoji = $request->emoji;

        // Obtiene el modelo correspondiente (Post o Comment) o lanza 404 si no existe.
         $model = $type === 'post' 
            ? Post::findOrFail($id) 
            : Comment::findOrFail($id);

        // Verifica si ya existe una reacción del usuario a ese modelo.
        $existing = $model->reactions()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete(); // Elimina la reacción existente.

            if ($existing->emoji === $emoji) {
                // Si el emoji es el mismo, solo se borra la reacción (toggle off).
                return back()->with('status', 'deleted');
            }
            
            // Si el emoji es diferente, se reemplaza con la nueva reacción.
            $model->reactions()->create([
                'user_id' => $user->id,
                'emoji' => $emoji,
            ]);
                  
            return back()->with('status', 'replaced');
        }

        // Si no había reacción previa, se crea una nueva.
        $model->reactions()->create([
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);

        return back()->with('status', 'created');
    }
}