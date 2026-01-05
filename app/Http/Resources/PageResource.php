<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación de una página informativa para el frontend.
 */
class PageResource extends JsonResource
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
            'language'        => $this->language,
            'type'            => $this->type,
            'title'           => $this->title,
            'slug'            => $this->slug,
            'content'         => $this->content,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
        ];
    }
}