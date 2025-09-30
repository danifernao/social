<?php

use App\Http\Controllers\AdminSiteController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\BlockUserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\SearchController;
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

    Route::get('/user/{user}/following', [FollowController::class, 'showFollowing'])->name('follow.following');
    Route::get('/user/{user}/followers', [FollowController::class, 'showFollowers'])->name('follow.followers');
    Route::post('/user/{user}/follow', [FollowController::class, 'toggle'])->name('follow.toggle');

    Route::post('/user/{user}/block', [BlockUserController::class, 'toggle'])->name('user.block');

    Route::post('/post', [PostController::class, 'store'])->name('post.store');
    Route::patch('/post/{post}', [PostController::class, 'update'])->name('post.update');
    Route::delete('/post/{post}', [PostController::class, 'delete'])->name('post.delete');

    Route::post('/post/{post}/comment', [CommentController::class, 'store'])->name('comment.store');
    Route::patch('/comment/{comment}', [CommentController::class, 'update'])->name('comment.update');
    Route::delete('/comment/{comment}', [CommentController::class, 'delete'])->name('comment.delete');

    Route::put('/reaction', [ReactionController::class, 'toggle'])->name('reaction.toggle');

    Route::get('/search', [SearchController::class, 'index'])->name('search.index');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notification.index');
    Route::patch('/notifications/read', [NotificationController::class, 'markAllAsRead'])->name('notification.markAllAsRead');
    Route::patch('/notifications/read/{id}', [NotificationController::class, 'markOneAsRead'])->name('notification.markOneAsRead');

    Route::redirect('admin', 'admin/site');
    Route::get('admin/site', [AdminSiteController::class, 'edit'])->name('admin.site.edit');
    Route::patch('admin/site', [AdminSiteController::class, 'update'])->name('admin.site.update');
    Route::get('admin/users', [AdminUserController::class, 'index'])->name('admin.user.index');
    Route::get('admin/users/create', [AdminUserController::class, 'create'])->name('admin.user.create');
    Route::post('admin/users/create', [AdminUserController::class, 'store'])->name('admin.user.store');
    Route::get('admin/{user}', [AdminUserController::class, 'edit'])->name('admin.user.edit');
    Route::patch('admin/{user}', [AdminUserController::class, 'update'])->name('admin.user.update');
});

Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';