<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use App\Observers\DatabaseNotificationObserver;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registra cualquier servicio de la aplicación.
     */
    public function register(): void
    {
        //
    }

    /**
     * Inicializa cualquier servicio de la aplicación.
     */
    public function boot(): void
    {

        // Define un enlace personalizado para el parámetro de ruta "user".
        // Esto permite que las rutas como /user/{user} acepten tanto IDs numéricos como nombres de usuario.
        Route::bind('user', function ($value) {
            // Si el valor es numérico, se asume que es un ID y se busca al usuario por ID.
            if (is_numeric($value)) {
                return User::findOrFail($value);
            }

            // Si no es numérico, se asume que es un nombre de usuario y se busca por ese campo.
            return User::where('username', $value)->firstOrFail();
        });

        // Registra el observador de usuarios.
        User::observe(UserObserver::class);

        // Registra el observador de notificaciones.
        DatabaseNotification::observe(DatabaseNotificationObserver::class);
    }
}
