<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de una publicación para el frontend.
 */
class PostResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Determina si la publicación está silenciada o no.
        $is_muted = $auth_user ? $this->isMutedBy($auth_user) : false;

        // Autor de la publicación, solo si la relación fue cargada.
        $author = $this->whenLoaded('user', function () {
            return (new UserResource($this->user))->resolve();
        });

        // Propietario del perfil donde se publicó.
        $profile_owner = $this->whenLoaded('profileOwner', function () {
            return (new UserResource($this->profileOwner))->resolve();
        });

        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'content'         => $this->content,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
            'last_edited_at'  => $this->last_edited_at,
            'type'            => $this->type,
            'visibility'      => $this->visibility,
            'user'            => $author,
            'profile_user_id' => $this->profile_user_id,
            'profile_owner'   => $profile_owner,
            'is_closed'       => $this->is_closed,
            'is_pinned'       => $this->is_pinned,
            'is_muted'        => $is_muted,
            'reactions'       => $this->reactions ?? [],
            'comments_count'  => $this->comments_count ?? 0,
        ];
    }
}