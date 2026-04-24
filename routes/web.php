<?php
/*
|--------------------------------------------------------------------------
| Controladores sociales
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\BlockUserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContentHistoryController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostNotificationMuteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\SearchController;


/*
|--------------------------------------------------------------------------
| Controladores de configuración
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\SettingsLanguageController;
use App\Http\Controllers\SettingsPasswordController;
use App\Http\Controllers\SettingsProfileController;


/*
|--------------------------------------------------------------------------
| Controladores de administración
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Admin\InvitationController;
use App\Http\Controllers\Admin\StaticPageController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SiteController;
use App\Http\Controllers\Admin\UserController;


/*
|--------------------------------------------------------------------------
| Controladores de autenticación
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Auth\PasswordConfirmController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Auth\VerifyEmailController;

use App\Models\Comment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Página de inicio
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('home.index');
    }

    return Inertia::render('welcome');
})->name('home');


/*
|--------------------------------------------------------------------------
| Rutas para invitados
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('register/{token?}', [RegisterController::class, 'create'])
        ->middleware('registration.access')
        ->name('register');

    Route::post('register', [RegisterController::class, 'store']);

    Route::get('login', [SessionController::class, 'create'])
        ->name('login');

    Route::post('login', [SessionController::class, 'store']);

    Route::get('forgot-password', [ForgotPasswordController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [ForgotPasswordController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [PasswordResetController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [PasswordResetController::class, 'store'])
        ->name('password.store');
});


/*
|--------------------------------------------------------------------------
| Rutas autenticadas
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::post('logout', [SessionController::class, 'destroy'])
        ->name('logout');
});


/*
|--------------------------------------------------------------------------
| Rutas autenticadas (sin verificación)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'unverified'])->group(function () {
    Route::get('verify-email', [VerifyEmailController::class, 'prompt'])
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', [VerifyEmailController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [VerifyEmailController::class, 'notify'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('change-email', [VerifyEmailController::class, 'edit'])
        ->name('verification.email.edit');

    Route::post('change-email', [VerifyEmailController::class, 'update'])
        ->name('verification.email.update');
});


/*
|--------------------------------------------------------------------------
| Rutas autenticadas y verificadas
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // Feed principal
    Route::get('/home', [HomeController::class, 'index'])
        ->name('home.index');

    // Usuarios y relaciones
    Route::prefix('user')
        ->group(function () {
            Route::get('{user}/following', [FollowController::class, 'showFollowing'])
                ->name('follow.following');
            Route::get('{user}/followers', [FollowController::class, 'showFollowers'])
                ->name('follow.followers');
            Route::post('{user}/follow', [FollowController::class, 'toggle'])
                ->name('follow.toggle');
            Route::post('{user}/block', [BlockUserController::class, 'toggle'])
                ->name('user.block');
        });

    // Publicaciones
    Route::prefix('post')
        ->name('post.')
        ->group(function () {
            Route::post('/', [PostController::class, 'store'])
                ->name('store');
            Route::patch('{post}', [PostController::class, 'update'])
                ->name('update');
            Route::get('{post}/history', [ContentHistoryController::class, 'index'])
                ->name('history');
            Route::post('{post}/mute', [PostNotificationMuteController::class, 'toggle'])
                ->name('mute.toggle');
            Route::delete('{post}', [PostController::class, 'delete'])
                ->name('delete');
        });

    // Comentarios
    Route::post('/post/{post}/comment', [CommentController::class, 'store'])
        ->name('comment.store');
    Route::get('/post/{post}/comment/{comment}/history', [ContentHistoryController::class, 'index'])
        ->name('comment.history');
    Route::patch('/comment/{comment}', [CommentController::class, 'update'])
        ->name('comment.update');
    Route::delete('/comment/{comment}', [CommentController::class, 'delete'])
        ->name('comment.delete');
    
    // Reacciones
    Route::post('/reaction', [ReactionController::class, 'toggle'])
        ->name('reaction.toggle');
    Route::get('/reactions', [ReactionController::class, 'index'])
        ->name('reaction.index');

    // Multimedia
    Route::get('/user/{user}/media', [MediaController::class, 'index'])
        ->name('media.index');
    Route::post('/media', [MediaController::class, 'store'])
        ->name('media.store');
    Route::delete('/media/{media}', [MediaController::class, 'destroy'])
        ->name('media.destroy');

    // Búsqueda
    Route::get('/search', [SearchController::class, 'index'])
        ->name('search.index');

    // Notificaciones
    Route::prefix('notifications')
        ->name('notification.')
        ->group(function () {
            Route::get('/', [NotificationController::class, 'index'])
                ->name('index');
            Route::patch('read', [NotificationController::class, 'markAllAsRead'])
                ->name('markAllAsRead');
            Route::patch('read/{id}', [NotificationController::class, 'markOneAsRead'])
                ->name('markOneAsRead');
        });

    // Configuración de cuenta
    Route::prefix('settings')
        ->group(function () {
            Route::redirect('settings', 'settings/profile');

            Route::get('profile', [SettingsProfileController::class, 'edit'])
                ->name('profile.edit');
            Route::patch('profile', [SettingsProfileController::class, 'update'])
                ->name('profile.update');
            Route::delete('profile', [SettingsProfileController::class, 'destroy'])
                ->name('profile.destroy');

            Route::get('password', [SettingsPasswordController::class, 'edit'])
                ->name('password.edit');
            Route::put('password', [SettingsPasswordController::class, 'update'])
                ->name('password.update');

            Route::get('language', [SettingsLanguageController::class, 'edit'])
                ->name('language.edit');
            Route::patch('language', [SettingsLanguageController::class, 'update'])
                ->name('language.update');

            Route::get('appearance', function () {
                return Inertia::render('settings/appearance');
            })->name('appearance');
        });

    // Administración
    Route::prefix('admin')
        ->middleware('password.confirm')
        ->name('admin.')
        ->group(function () {
            // Página de administración por defecto.
            Route::get('/', function () {
                $user = auth()->user();

                if ($user->hasRole('admin')) {
                    return redirect()->route('admin.site.edit');
                }

                if ($user->hasAnyRole(['admin', 'mod'])) {
                    return redirect()->route('admin.user.index');
                }

                abort(403);
            })
            ->name('index');

            // Administración del sitio
            Route::prefix('site')
                ->name('site.')
                ->group(function () {
                    Route::get('/', [SiteController::class, 'edit'])
                        ->name('edit');
                    Route::patch('/', [SiteController::class, 'update'])
                        ->name('update');
                });

            // Administración de invitaciones
            Route::prefix('site/invitations')
                ->middleware('invitation.access')
                ->name('invitation.')
                ->group(function () {
                    Route::get('/', [InvitationController::class, 'index'])
                        ->name('index');
                    Route::post('/', [InvitationController::class, 'store'])
                        ->name('store');
                    Route::delete('{invitation}', [InvitationController::class, 'destroy'])
                        ->name('destroy');
                });

            // Administración de páginas informativas
            Route::prefix('pages')
                ->name('page.')
                ->group(function () {
                    Route::get('/', [StaticPageController::class, 'index'])
                        ->name('index');
                    Route::get('/create', [StaticPageController::class, 'create'])
                        ->name('create');
                    Route::post('/create', [StaticPageController::class, 'store'])
                        ->name('store');
                    Route::get('/{page}/edit', [StaticPageController::class, 'edit'])
                        ->name('edit');
                    Route::patch('/{page}/edit', [StaticPageController::class, 'update'])
                        ->name('update');
                    Route::delete('{page}', [StaticPageController::class, 'destroy'])
                        ->name('destroy');
                });

            // Administración de usuarios        
            Route::prefix('users')
                ->name('user.')
                ->group(function () {
                    Route::get('/', [UserController::class, 'index'])                        
                        ->name('index');
                    Route::get('{user}', [UserController::class, 'edit'])
                        ->name('edit');
                    Route::patch('{user}', [UserController::class, 'update'])
                        ->name('update');
                });

            // Administración de reportes
            Route::prefix('reports')
                ->name('report.')
                ->group(function () {
                    Route::get('/', [ReportController::class, 'index'])
                        ->name('index');
                    Route::get('/{report}', [ReportController::class, 'show'])
                        ->name('show');
                    Route::patch('/{report}', [ReportController::class, 'update'])
                        ->name('update');
                });
        });

    // Confirmación de contraseña
    Route::get('confirm-password', [PasswordConfirmController::class, 'show'])
        ->name('password.confirm');
    Route::post('confirm-password', [PasswordConfirmController::class, 'store']);

    // Creación de reportes
    Route::post('report', [ReportController::class, 'store'])
        ->name('report.store');
});

/*
|--------------------------------------------------------------------------
| Rutas públicas de visualización
|--------------------------------------------------------------------------
*/
Route::get('/user/{user}', [ProfileController::class, 'show'])
    ->name('profile.show');
Route::get('/post/{post}', [PostController::class, 'show'])
    ->name('post.show');
Route::get('/post/{post}/comment/{comment}', [PostController::class, 'show'])
    ->name('post.comment.show');
Route::get('/page/{lang}/{slug}', [StaticPageController::class, 'show'])
    ->name('page.show');
Route::get('/media/{media}', [MediaController::class, 'show'])
    ->where('media', '.*')
    ->name('media.show');

Route::get('/comment/{comment}', function (Request $request, Comment $comment) {
    return redirect()->route('post.comment.show', [
        'post' => $comment->post_id,
        'comment' => $comment->id,
    ]);
})->name('comment.show');