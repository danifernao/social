<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de un comentario para el frontend.
 */
class CommentResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Autor de la publicación, solo si la relación fue cargada.
        $author = $this->whenLoaded('user', function () {
            return (new UserResource($this->user))->resolve();
        });

        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'post_id'    => $this->post_id,
            'content'    => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'type'       => $this->type,
            'user'       => $author,
            'reactions'  => $this->reactions ?? [],
        ];
    }
}