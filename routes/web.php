<?php

use App\Http\Controllers\Content\CommentController;
use App\Http\Controllers\Content\BlockUserController;
use App\Http\Controllers\Content\FollowController;
use App\Http\Controllers\Content\HomeController;
use App\Http\Controllers\Content\NotificationController;
use App\Http\Controllers\Content\PostController;
use App\Http\Controllers\Content\ProfileController;
use App\Http\Controllers\Content\ReactionController;
use App\Http\Controllers\Content\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('home.show');
    }
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/home', [HomeController::class, 'show'])->name('home.show');

    Route::get('/user/{user}/following', [FollowController::class, 'following'])->name('follow.following');
    Route::get('/user/{user}/followers', [FollowController::class, 'followers'])->name('follow.followers');
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
});

Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';