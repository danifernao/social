<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Gestiona la subida y eliminación de archivos multimedia.
 */
class MediaService
{
    /**
     * Guarda un archivo y crea su registro.
     * 
     * @param UploadedFile        $file      Archivo que se desea guardar.
     * @param int                 $user_id   ID del usuario que sube el archivo.
     * @param string              $folder    Nombre de la carpeta en la que
     *                                       se guardará el archivo.
     * @param UploadedFile|null   $file      Archivo de la miniatura que
     *                                       se desea guardar.
     * @return Media                         Registro del archivo guardado.
     */
    public function store(
        UploadedFile $file,
        int $user_id,
        string $folder = 'attachments',
        ?UploadedFile $thumbnail = null
    ): Media
    {
        // Disco de almacenamiento.
        $disk = 'local';

        // Nombre único y aleatorio.
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        
        // Guarda el archivo en el almacenamiento local.
        $path = $file->storeAs($folder, $filename, $disk);
        
        $thumbnail_path = null;

        // Guarda la miniatura.
        if ($thumbnail) {
            $thumbnail_path = $thumbnail->store($folder . '/thumbs', $disk);
        }

         // Guarda los datos del archivo en la base de datos.
        return Media::create([
            'user_id'        => $user_id,
            'disk'           => $disk,
            'path'           => $path,
            'thumbnail_path' => $thumbnail_path,
            'mime_type'      => $file->getMimeType(),
            'size'           => $file->getSize(),
        ]);
    }

    /**
     * Elimina un archivo y su registro de la base de datos.
     * 
     * @param Media $media Registro multimedia a eliminar.
     * @return bool
     */
    public function delete(Media $media): bool
    {
        // Carga los reportes asociados al archivo.
        $media->load('reports');

        // Verifica si el archivo está asociado a algún reporte.
        $has_reports = $media->reports()->exists();

        // Si tiene un reporte ascociado, hace un soft-delete.
        if ($has_reports) {
            return $media->delete();
        }

        // Instancia del motor de almacenamiento.
        $storage = Storage::disk($media->disk);

        // Si existe imagen miniatura, la elimina del almacenamiento.
        if ($media->thumbnail_path && $storage->exists($media->thumbnail_path)) {
            $storage->delete($media->thumbnail_path);
        }

        // Elimina el archivo principal del almacenamiento.
        if ($storage->exists($media->path)) {
            $storage->delete($media->path);
        }

        // Borrar registro de la base de datos.
        return $media->forceDelete();
    }

    /**
     * Elimina todos los archivos subidos por un usuario y sus registros.
     * 
     * @param int $user_id ID del usuario.
     */
    public function deleteAllFromUser(int $user_id): void
    {
        // Obtiene todos los archivos multimedia del usuario.
        $all_media = Media::withTrashed()
            ->where('user_id', $user_id)
            ->get();

        if ($all_media->isEmpty()) {
            return;
        }

        foreach ($all_media as $media) {
            // Verifica si el archivo está reportado.
            $has_reports = $media->reports()->exists();

            // Si está reportado, se hace soft-delete sobre él.
            if ($has_reports) {
                if (!$media->trashed()) {
                    $media->delete();
                }
                continue;
            }

            // Si no está reportado, elimina físicamente.
            $storage = Storage::disk($media->disk);

            if ($media->thumbnail_path && $storage->exists($media->thumbnail_path)) {
                $storage->delete($media->thumbnail_path);
            }

            if ($storage->exists($media->path)) {
                $storage->delete($media->path);
            }

            // Eliminación definitiva del registro.
            $media->forceDelete();
        }
    }
}