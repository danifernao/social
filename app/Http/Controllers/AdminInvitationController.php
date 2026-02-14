<?php

namespace App\Http\Controllers;

use App\Http\Controllers;
use App\Http\Resources\InvitationResource;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Controlador responsable de la gestión administrativa
 * de invitaciones de registro.
 */
class AdminInvitationController extends Controller
{
    /**
     * Muestra el listado paginado de invitaciones.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Determina si se desean mostrar las invitaciones aceptadas
        // o pendientes por aceptar.
        $status = strtolower($request->query('status', 'pending'));

        // Consulta base de invitaciones.
        $query = Invitation::query()
            ->with([ 'creator', 'usedBy' ])
            ->orderByDesc('created_at');

        if ($status === 'accepted') {
            $query->whereNotNull('used_by_id');
        } else {
            $query->whereNull('used_by_id');
        }

        $invitations = $query->cursorPaginate(20)->withQueryString();

        // Redirige si el cursor es inválido.
        if ($invitations->isEmpty() && $request->has('cursor')) {
            return redirect()->route('admin.invitations.index');
        }

        return Inertia::render('admin/invitations/index', [
            'invitations' => InvitationResource::collection($invitations),
        ]);
    }

    /**
     * Crea una nueva invitación.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Genera un token seguro y único.
        $token = Str::random(32);

        // Crea la invitación.
        $invitation = Invitation::create([
            'token' => $token,
            'creator_id' => $request->user()->id,
        ]);

        return back()->with([
            'status' => 'invitation_created',
            'invitation' => $invitation,
            'message' => __('Invitation successfully created.'),
        ]);
    }

    /**
     * Elimina una invitación si no ha sido utilizada.
     * 
     * @param Invitation $invitation Instancia de la invitación
     *                               que se va a eliminar.
     */
    public function destroy(Invitation $invitation)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de administrador.
        $this->authorize('access-admin-area');

        // Impide eliminar invitaciones ya utilizadas.
        if ($invitation->isUsed()) {
            return back()->withErrors([
                'invitation' => __('This invitation has already been used.'),
            ]);
        }

        // Elimina la invitación.
        $invitation->delete();

        return back()->with([
            'status' => 'invitation_deleted',
            'message' => __('Invitation successfully deleted.'),
        ]);
    }
}