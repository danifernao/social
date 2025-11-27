<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Muestra el listado de notificaciones del usuario autenticado.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        $cursor = $request->header('X-Cursor');

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->cursorPaginate(15, ['*'], 'cursor', $cursor);

        return Inertia::render('notifications/index', [
            'notifications' => NotificationResource::collection($notifications),
        ]);
    }

    /**
     * Marca todas las notificaciones no leídas del usuario autenticado
     * como leídas.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('status', 'marked_as_read');
    }

    /**
     * Marca una notificación específica como leída.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param string $id ID de la notificación a marcar como leída.
     */
    public function markOneAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
            
        $notification->markAsRead();

        return response()->json([
            'status' => 'ok',
            'message' => __('Notification marked as read.'),
        ]);
    }
}