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
        // Contendrá el recurso del contenido reportado.
        $reportableResource = null;

        // Si el contenido reportado existe físicamente en la base de datos,
        // se determina qué resource utilizar según su tipo.
        if ($this->reportable) {
            if ($this->reportable instanceof Post) {
                $reportableResource = (new PostResource($this->reportable))->resolve();
            } elseif ($this->reportable instanceof Comment) {
                $reportableResource = (new CommentResource($this->reportable))->resolve();
            } elseif ($this->reportable instanceof User) {
                $reportableResource = (new UserResource($this->reportable))->resolve();
            }
        }

        return [
            'id' => $this->id,

            'reporter' => $this->reporter
                ? (new UserResource($this->reporter))->resolve()
                : null,

            'resolver' => $this->resolver
                ? (new UserResource($this->resolver))->resolve()
                : null,

            'reportable_type' => $this->reportable_type,
            'reportable_id' => $this->reportable_id,

            'reportable' => $reportableResource,

            'reportable_snapshot' => $this->reportable_snapshot,

            'reporter_note' => $this->reporter_note,
            'resolver_note' => $this->resolver_note,

            'closed_at' => $this->closed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}