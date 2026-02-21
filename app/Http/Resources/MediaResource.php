<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Define la representación de un archivo multimedia para el frontend.
 */
class MediaResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'type'            => $this->type,
            'url'             => $this->url,
            'thumbnail_url'   => $this->thumbnail_url,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}