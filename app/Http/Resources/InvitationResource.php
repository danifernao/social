<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de la invitación para el frontend.
 */
class InvitationResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $creator = $this->whenLoaded('creator', function () {
            return (new UserResource($this->creator))->resolve();
        });

        $used_by = $this->whenLoaded('usedBy', function () {
            return (new UserResource($this->usedBy))->resolve();
        });

        return [
            'id'                  => $this->id,
            'token'               => $this->token,
            'creator_id'          => $this->creator_id,
            'used_by_id'          => $this->used_by_id,
            'creator'             => $creator,
            'used_by'             => $used_by,
            'used_at'             => $this->used_at,
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}