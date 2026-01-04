<?php

namespace App\Services;

use App\Models\Hashtag;
use App\Models\Post;

/**
 * Gestiona la extracción, asociación y limpieza de etiquetas en publicaciones.
 */
class HashtagService
{
    // Extrae las etiquetas del contenido de una publicación.
    public function extractFrom(string $content): array
    {
        preg_match_all('/#([a-z0-9]+)/i', $content, $matches);
        return array_unique(array_map('mb_strtolower', $matches[1]));
    }

    // Asocia a la publicación las etiquetas encontradas en su contenido.
    public function sync(Post $post): void
    {
        $tags = $this->extractFrom($post->content);

        // Obtiene o crea las etiquetas en la base de datos.
        $hashtags = collect($tags)->map(function ($tag) {
            return Hashtag::firstOrCreate(['name' => $tag])->id;
        });

        // Actualiza la relación many-to-many con la publicación.
        $post->hashtags()->sync($hashtags);
    }

    // Elimina relaciones y limpia etiquetas sin asociaciones activas.
    public function detachAndClean(Post $post): void
    {
        $hashtags = $post->hashtags;

        // Elimina la relación entre la publicación y sus etiquetas.
        $post->hashtags()->detach();

        // Elimina etiquetas que ya no están asociadas a ninguna publicación.
        foreach ($hashtags as $hashtag) {
            if (!$hashtag->posts()->exists()) {
                $hashtag->delete();
            }
        }
    }
}