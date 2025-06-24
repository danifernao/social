<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Social\BlockUserController;
use App\Http\Controllers\Social\CommentController;
use App\Http\Controllers\Social\FollowController;
use App\Http\Controllers\Social\HomeController;
use App\Http\Controllers\Social\NotificationController;
use App\Http\Controllers\Social\PostController;
use App\Http\Controllers\Social\ProfileController;
use App\Http\Controllers\Social\ReactionController;
use App\Http\Controllers\Social\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('home.show');
    }
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/home', [HomeController::class, 'show'])->name('home.show');

    Route::get('/user/{user}/following', [FollowController::class, 'showFollowing'])->name('follow.following');
    Route::get('/user/{user}/followers', [FollowController::class, 'showFollowers'])->name('follow.followers');
    Route::post('/user/{user}/follow', [FollowController::class, 'toggle'])->name('follow.toggle');

    Route::post('/user/{user}/block', [BlockUserController::class, 'toggle'])->name('user.block');

    Route::post('/post', [PostController::class, 'create'])->name('post.create');
    Route::patch('/post/{post}', [PostController::class, 'update'])->name('post.update');
    Route::delete('/post/{post}', [PostController::class, 'delete'])->name('post.delete');

    Route::post('/post/{post}/comment', [CommentController::class, 'create'])->name('comment.create');
    Route::patch('/comment/{comment}', [CommentController::class, 'update'])->name('comment.update');
    Route::delete('/comment/{comment}', [CommentController::class, 'delete'])->name('comment.delete');

    Route::put('/reaction', [ReactionController::class, 'toggle'])->name('reaction.toggle');

    Route::get('/search', [SearchController::class, 'show'])->name('search.show');
    Route::get('/hashtag/{hashtag}', [SearchController::class, 'show'])->where('hashtag', '[\pL\pN_]+')->name('search.hashtag');

    Route::get('/notifications', [NotificationController::class, 'show'])->name('notification.show');
    Route::patch('/notifications/read', [NotificationController::class, 'markAllAsRead'])->name('notification.markAllAsRead');
    Route::patch('/notifications/read/{id}', [NotificationController::class, 'markOneAsRead'])->name('notification.markOneAsRead');

    Route::redirect('admin', 'admin/users');
    Route::get('admin/users', [UserController::class, 'show'])->name('admin.user.show');
    Route::get('admin/{user}', [UserController::class, 'edit'])->name('admin.user.edit');
    Route::patch('admin/{user}', [UserController::class, 'update'])->name('admin.user.update');
});

Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';