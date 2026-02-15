<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Observers\CommentObserver;
use App\Observers\DatabaseNotificationObserver;
use App\Observers\PostObserver;
use App\Observers\UserObserver;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

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
        // Garantiza que solo los usuarios con rol de administrador
        // puedan acceder a la zona administrativa.
        Gate::define('access-admin-area', function (User $user) {
            return $user->canManageSystem();
        });

        // Garantiza que solo los usuarios con permisos de moderación
        // puedan ejecutar acciones de moderación dentro del sistema.
        Gate::define('moderate', function (User $user) {
            return $user->canModerate();
        });

        // Permite que las rutas como /user/{user} acepten tanto IDs numéricos
        // como nombres de usuario.
        Route::bind('user', function ($value) {
            // Si el valor es numérico, se asume que es un ID
            // y se busca al usuario por ID.
            if (is_numeric($value)) {
                return User::findOrFail($value);
            }
            // Si no es numérico, se asume que es un nombre de usuario
            // y se busca por ese campo.
            return User::where('username', $value)->firstOrFail();
        });

        // Registra los observadores.
        Comment::observe(CommentObserver::class);
        DatabaseNotification::observe(DatabaseNotificationObserver::class);
        Post::observe(PostObserver::class);
        User::observe(UserObserver::class);
    }
}