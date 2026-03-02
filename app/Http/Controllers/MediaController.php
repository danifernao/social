<?php

namespace App\Http\Controllers;

use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Muestra el álbum de un usuario con sus archivos multimedia.
     * Solo el propietario del álbum o moderadores pueden acceder.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User    $user    Usuario propietario del álbum.
     */
    public function index(Request $request, User $user)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Deniega acceso si el usuario autenticado no es el propietario
        // del archivo y no tiene permisos de moderación
        if ($auth_user->id !== $user->id && !$auth_user->hasAnyRole(['admin', 'mod'])) {
            abort(403);
        }

        // Valida los datos de la solicitud.
        $request->validate([
            'type' => ['required', 'string', 'in:image,video'],
        ]);

        // Cursor utilizado para la paginación.
        $cursor = $request->header('X-Cursor');

        // Tipo de archivo a filtrar.
        $type = $request->query('type');

        // Consulta de archivos multimedia del usuario.
        $media = Media::query()
            ->where('user_id', $user->id)
            ->when($type, function ($query, $type) {
                return $query->where('mime_type', 'LIKE', $type . '/%');
            })
            ->latest()
            ->cursorPaginate(12, ['*'], 'cursor', $cursor);


        return back()->with([
            'media' => MediaResource::collection($media),
        ]);
    }

    /**
     * Muestra un archivo multimedia.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Media   $media   Archivo multimedia que se desea ver.
     */
    public function show(Request $request, Media $media)
    {
        // Obtiene la ruta compartida en la solicitud HTTP.
        $requested_path = $request->route()->originalParameter('media');

        // Determina cuál de las dos rutas del registro multimedia se debe usar.
        $path_to_file = ($requested_path === $media->thumbnail_path) 
            ? $media->thumbnail_path 
            : $media->path;

        // Verifica que el archivo exista.
        if (!$path_to_file || !Storage::disk($media->disk)->exists($path_to_file)) {
            abort(404);
        }

        // Obtiene la ruta absoluta del archivo consultado.
        $absolute_path = Storage::disk($media->disk)->path($path_to_file);

        return response()->file($absolute_path);
    }

    /**
     * Guarda un archivo multimedia.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Valida los datos del archivo enviado.
        $data = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp,gif,mp4,webm',
                'max:5120',
            ],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ]);

        // Obtiene el archivo.
        $file = $data['file'];

        // Disco de almacenamiento.
        $disk = 'local';

        // Nombre único y aleatorio.
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        // Guarda el archivo en el almacenamiento local.
        $path = $file->storeAs('attachments', $filename, $disk);

        if ($request->hasFile('thumbnail')) {
            $thumb_path = $request->file('thumbnail')->store('attachments/thumbs', $disk);
        }

        // Guarda los datos del archivo en la base de datos.
        $media = Media::create([
            'user_id'        => $request->user()->id,
            'disk'           => $disk,
            'path'           => $path,
            'thumbnail_path' => $thumb_path ?? null,
            'mime_type'      => $file->getMimeType(),
            'size'           => $file->getSize(),
        ]);

        // URL del archivo.
        $url = route('media.show', ['media' => $media->path]);

        return back()->with([
            'media_url' => $url,
        ]);
    }

    /**
     * Elimina un archivo multimedia.
     * Solo el propietario del archivo o moderadores pueden eliminarlo.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Media   $media   Archivo multimedia a eliminar.
     */
    public function destroy(Request $request, Media $media)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Deniega acceso si el usuario autenticado no es el propietario
        // del archivo y no tiene permisos de moderación.
        if ($media->user_id !== $auth_user->id &&
            !$auth_user->hasAnyRole(['admin', 'mod'])
        ) {
            abort(403);
        }

        // Si existe imagen miniatura, la elimina del almacenamiento.
        if ($media->thumbnail_path) {
            Storage::disk($media->disk)->delete($media->thumbnail_path);
        }

        // Elimina el archivo del almacenamiento y de la base de datos.
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return back()->with('status', 'media_deleted');
    }
}