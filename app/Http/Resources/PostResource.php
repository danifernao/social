<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'content'         => $this->content,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,

            'type'            => $this->type,
            'user'            => (new UserResource($this->whenLoaded('user')))->resolve(),
            'reactions'       => $this->reactions ?? [],
            'comments_count'  => $this->comments_count ?? 0,
        ];
    }
}
