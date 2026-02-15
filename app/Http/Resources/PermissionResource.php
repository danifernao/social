<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de permisos para el frontend.
 */
class PermissionResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'can_manage_system'   => $this->can_manage_system,
            'can_moderate'        => $this->can_moderate,
            'can_post'            => $this->can_post,
            'can_comment'         => $this->can_comment,
            'can_update_username' => $this->can_update_username,
            'can_update_avatar'   => $this->can_update_avatar,
        ];
    }
}