<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Muestra las notificaciones del usuario autenticado.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        $cursor = $request->header('X-Cursor');

        $notifications = $request->user()->notifications()->latest()->cursorPaginate(15, ['*'], 'cursor', $cursor);

        return Inertia::render('notification/index', [
            'notifications' => NotificationResource::collection($notifications),
        ]);
    }

    /**
     * Marca todas las notificaciones no leídas del usuario autenticado como leídas.
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
     * @param string $id Identificador de la notificación.
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