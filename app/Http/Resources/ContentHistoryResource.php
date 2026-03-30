<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación del historia de cambios de una publicación
 * o comentario para el frontend.
 */
class ContentHistoryResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $author = $this->whenLoaded('user', function () {
            return (new UserResource($this->user))->resolve();
        });

        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'user'            => $author,
            'historable_id'   => $this->historable_id,
            'historable_type' => $this->get_historable_kind(),
            'content'         => $this->content,
            'created_at'      => $this->created_at,
        ];
    }

    /**
     * Normaliza el tipo de contenido.
     */
    protected function get_historable_kind(): string
    {
        return match($this->historable_type) {
            Post::class    => 'post',
            Comment::class => 'comment',
            default        => 'unknown',
        };
    }
}