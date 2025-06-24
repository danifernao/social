<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class UserObserver
{
    /**
     * Método que se ejecuta automáticamente antes de que un modelo User sea eliminado.
     */
    public function deleting(User $user): void
    {
        // Verifica si el usuario tiene una ruta de avatar registrada
        // y si el archivo correspondiente realmente existe en el disco "public".
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            // Si el archivo existe, lo elimina del sistema de archivos.
            // Esto evita dejar archivos huérfanos ocupando espacio después de borrar al usuario.
            Storage::disk('public')->delete($user->avatar_path);
        }
    }
}
