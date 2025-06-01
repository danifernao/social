<?php

namespace App\Http\Controllers\Content;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Muestra las notificaciones del usuario autenticado.
     */
    public function show(Request $request)
    {
        $cursor = $request->query('cursor');

        $notifications = $request->user()->notifications()->latest()->cursorPaginate(15, ['*'], 'cursor', $cursor);

        return Inertia::render('notification/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Marca todas las notificaciones no leídas del usuario autenticado como leídas.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Marca una notificación específica como leída.
     *
     * @param string $id Identificador de la notificación
     */
    public function markOneAsRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }
}