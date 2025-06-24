<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $auth = $request->user();

        /**
         * Determina si el usuario autenticado tiene permiso para ver información sensible del recurso.
         *
         * Se permite si:
         *    - es el mismo usuario representado por el recurso actual o
         *    - es un moderador.
         */
        $can_view_sensitive_data = $auth && ($auth->id === $this->id || $auth->canModerate());

        return [
            'id'                => $this->id,
            'username'          => $this->username,
            'avatar_url'        => $this->avatar_url,
            'email'             => $can_view_sensitive_data ? $this->getRawOriginal('email') : null,
            'email_verified_at' => $can_view_sensitive_data ? $this->email_verified_at: null,
            'role'              => $this->role,
            'is_active'         => $this->is_active,
            'language'          => $this->language,
            'created_at'        => $this->created_at,
            'updated_at'        => $can_view_sensitive_data ? $this->updated_at : null,

            'type'              => $this->type,
            'follows_count'     => $this->follows_count ?? null,
            'followers_count'   => $this->followers_count ?? null,
            'is_followed'       => $this->is_followed ?? null,

            'is_blocked'        => $auth ? $auth->hasBlocked($this->resource) : null,
            'has_blocked'       => $auth ? $this->resource->hasBlocked($auth) : null,

            'is_admin'          => $this->isAdmin(),
            'can_moderate'      => $this->canModerate(),
        ];
    }
}
