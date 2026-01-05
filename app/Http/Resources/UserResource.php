<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de usuario para el frontend.
 */
class UserResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $auth = $request->user();

        /**
         * Determina si el usuario autenticado tiene permiso para
         * ver información sensible del recurso.
         *
         * Se permite si:
         *    - es el mismo usuario representado por el recurso actual o
         *    - es un moderador.
         */
        $can_view_sensitive_data =
            $auth && (
                $auth->id === $this->id || $auth->canModerate()
            );

        // Datos sensibles.
        $email = $can_view_sensitive_data
            ? $this->getRawOriginal('email')
            : null;

        $email_verified_at = $can_view_sensitive_data
            ? $this->email_verified_at
            : null;

        $updated_at = $can_view_sensitive_data
            ? $this->updated_at
            : null;
        
        // Datos que requieren autenticación.
        $is_blocked = $auth
            ? $auth->hasBlocked($this->resource)
            : null;

        $has_blocked = $auth
            ? $this->resource->hasBlocked($auth)
            : null;

        return [
            'id'                => $this->id,
            'username'          => $this->username,
            'avatar_url'        => $this->avatar_url,
            'email'             => $email,
            'email_verified_at' => $email_verified_at,
            'role'              => $this->role,
            'is_active'         => $this->is_active,
            'language'          => $this->language,
            'created_at'        => $this->created_at,
            'updated_at'        => $updated_at,
            'type'              => $this->type,
            'follows_count'     => $this->follows_count ?? null,
            'followers_count'   => $this->followers_count ?? null,
            'is_followed'       => $this->is_followed ?? null,
            'is_blocked'        => $is_blocked,
            'has_blocked'       => $has_blocked,
            'is_admin'          => $this->isAdmin(),
            'can_moderate'      => $this->canModerate(),
        ];
    }
}