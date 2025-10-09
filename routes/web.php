<?php

use App\Http\Controllers\AdminSiteController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\BlockUserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\SearchController;
use App\Models\Comment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('home.index');
    }
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/home', [HomeController::class, 'index'])->name('home.index');

    Route::prefix('user')->group(function () {
        Route::get('{user}/following', [FollowController::class, 'showFollowing'])->name('follow.following');
        Route::get('{user}/followers', [FollowController::class, 'showFollowers'])->name('follow.followers');
        Route::post('{user}/follow', [FollowController::class, 'toggle'])->name('follow.toggle');
        Route::post('{user}/block', [BlockUserController::class, 'toggle'])->name('user.block');
    });

    Route::prefix('post')->name('post.')->group(function () {
        Route::post('/', [PostController::class, 'store'])->name('store');
        Route::patch('{post}', [PostController::class, 'update'])->name('update');
        Route::delete('{post}', [PostController::class, 'delete'])->name('delete');
    });

    Route::post('/post/{post}/comment', [CommentController::class, 'store'])->name('comment.store');
    Route::patch('/comment/{comment}', [CommentController::class, 'update'])->name('comment.update');
    Route::delete('/comment/{comment}', [CommentController::class, 'delete'])->name('comment.delete');

    Route::put('/reaction', [ReactionController::class, 'toggle'])->name('reaction.toggle');

    Route::get('/search', [SearchController::class, 'index'])->name('search.index');

    Route::prefix('notifications')->name('notification.')->group(function () {
      Route::get('/', [NotificationController::class, 'index'])->name('index');
      Route::patch('read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
      Route::patch('read/{id}', [NotificationController::class, 'markOneAsRead'])->name('markOneAsRead');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
            $user = auth()->user();

            if ($user->isAdmin()) {
                return redirect()->route('admin.site.edit');
            }

            if ($user->isMod()) {
                return redirect()->route('admin.user.index');
            }

            abort(403);
        })->name('index');

        Route::prefix('site')->name('site.')->group(function () {
          Route::get('/', [AdminSiteController::class, 'edit'])->name('edit');
          Route::patch('/', [AdminSiteController::class, 'update'])->name('update');
        });

        Route::prefix('pages')->name('page.')->group(function () {
          Route::get('/', [PageController::class, 'index'])->name('index');
        });

        Route::prefix('users')->name('user.')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('index');
            Route::get('create', [AdminUserController::class, 'create'])->name('create');
            Route::post('create', [AdminUserController::class, 'store'])->name('store');
            Route::get('{user}', [AdminUserController::class, 'edit'])->name('edit');
            Route::patch('{user}', [AdminUserController::class, 'update'])->name('update');
        });
    });
});

Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');
Route::get('/post/{post}/comment/{comment}', [PostController::class, 'show'])->name('post.comment.show');

Route::get('/comment/{comment}', function (Request $request, Comment $comment) {
    return redirect()->route('post.comment.show', [
        'post' => $comment->post_id,
        'comment' => $comment->id,
    ]);
})->name('comment.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';