<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador responsable de gestionar las notificaciones
 * del usuario autenticado.
 *
 * Proporciona funcionalidades para:
 *   - Listar las notificaciones.
 *   - Marcar todas las notificaciones como leídas.
 *   - Marcar notificaciones individuales como leídas.
 *
 * Todas las acciones se aplican exclusivamente al usuario autenticado.
 */
class NotificationController extends Controller
{
    /**
     * Muestra el listado de notificaciones del usuario autenticado.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Obtiene el cursor para la paginación.
        $cursor = $request->header('X-Cursor');

        // Obtiene las notificaciones ordenadas por fecha de creación
        // y paginadas mediante cursor.
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
        // Marca todas las notificaciones pendientes como leídas.
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('status', 'marked_as_read');
    }

    /**
     * Marca una notificación específica como leída.
     *
     * @param Request $request Datos de la petición HTTP.
     * @param string  $id      ID de la notificación a marcar como leída.
     */
    public function markOneAsRead(Request $request, string $id)
    {
        // Busca la notificación del usuario autenticado, fallando si no existe.
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
            
        // Marca la notificación como leída.
        $notification->markAsRead();

        return response()->json([
            'status' => 'ok',
            'message' => __('Notification marked as read.'),
        ]);
    }
}