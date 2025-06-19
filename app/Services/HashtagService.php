<?php

namespace App\Services;

use App\Models\Hashtag;
use App\Models\Post;

class HashtagService
{
    // Extrae las etiquetas del contenido de una publicación.
    public function extractFrom(string $content): array
    {
        preg_match_all('/#([\p{L}0-9_]+)/u', $content, $matches);
        return array_unique(array_map('mb_strtolower', $matches[1]));
    }

    // Obtiene o registra las etiquetas de una publicación.
    public function sync(Post $post): void
    {
        $tags = $this->extractFrom($post->content);

        // Obtiene o registra las etiquetas en la base de datos.
        $hashtags = collect($tags)->map(function ($tag) {
            return Hashtag::firstOrCreate(['name' => $tag])->id;
        });

        // Sincroniza la relación many-to-many.
        $post->hashtags()->sync($hashtags);
    }

    // Elimina relaciones y limpia etiquetas huérfanas.
    public function detachAndClean(Post $post): void
    {
        $hashtags = $post->hashtags;
        $post->hashtags()->detach();

        foreach ($hashtags as $hashtag) {
            if ($hashtag->posts()->exists()) {
                $hashtag->delete();
            }
        }
    }
}