<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Muestra las notificaciones del usuario autenticado.
     */
    public function show(Request $request)
    {
        $cursor = $request->header('X-Cursor');

        $notifications = $request->user()->notifications()->latest()->cursorPaginate(15, ['*'], 'cursor', $cursor);

        return Inertia::render('notification/index', [
            'notifications' => NotificationResource::collection($notifications),
        ]);
    }

    /**
     * Marca todas las notificaciones no leídas del usuario autenticado como leídas.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('status', 'marked-as-read');
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

        return response()->json([
            'status' => 'ok',
            'message' => 'Notification marked as read.',
        ]);
    }
}