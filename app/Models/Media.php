<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Modelo que representa un archivo multimedia.
 */
class Media extends Model
{
    /**
     * Atributos asignables masivamente.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'disk',
        'path',
        'thumbnail_path',
        'mime_type',
        'size',
    ];

    /**
     * Atributo computado: URL del archivo multimedia.
     *
     * @return string
     */
    public function getUrlAttribute(): string
    {
        
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Atributo computado: URL de la miniatura del archivo multimedia.
     *
     * @return string|null
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail_path) {
            return Storage::disk($this->disk)->url($this->thumbnail_path);
        }
        return null;
    }

    /**
     * Atributo computado: tipo del archivo multimedia (image, video, etc.).
     *
     * @return string|null
     */
    public function getTypeAttribute(): ?string
    {
        if ($this->mime_type) {
            return explode('/', $this->mime_type)[0];
        }
        return null;
    }
}