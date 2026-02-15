<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
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
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120',
            ],
        ]);

        // Obtiene el archivo.
        $file = $data['file'];

        // Nombre único y aleatorio.
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        // Guarda el archivo en el almacenamiento local.
        $path = $file->storeAs('media', $filename, 'public');

        // Guarda los datos del archivo en la base de datos.
        $media = Media::create([
            'user_id'   => $request->user()->id,
            'disk'      => 'public',
            'path'      => $path,
            'mime_type' => $file->getMimeType(),
            'size'      => $file->getSize(),
        ]);

        return back()->with([
            'media_url' => '/storage/' . $media->path,
        ]);
    }
}