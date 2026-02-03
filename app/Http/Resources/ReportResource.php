<?php

namespace App\Http\Resources;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la representación del reporte para el frontend.
 */
class ReportResource extends JsonResource
{
    /**
     * Convierte el recurso en un arreglo para ser enviado al frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reporter = $this->whenLoaded('reporter', function () {
            return new UserResource($this->reporter);
        });

        $resolver = $this->whenLoaded('resolver', function () {
            return new UserResource($this->resolver);
        });

        return [
            'id'                  => $this->id,
            'reporter'            => $reporter,
            'resolver'            => $resolver,
            'reportable_type'     => $this->reportable_type,
            'reportable_id'       => $this->reportable_id,
            'reportable_exists'   => (bool) $this->reportable,
            'reportable_snapshot' => $this->reportable_snapshot,
            'reporter_note'       => $this->reporter_note,
            'resolver_note'       => $this->resolver_note,
            'closed_at'           => $this->closed_at,
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}