<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserBlock;
use App\Rules\UserRules;
use App\Traits\HandlesPasswordConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    use HandlesPasswordConfirmation;

    /**
     * Muestra una lista paginada de usuarios para el panel de administración.
     * Aplica búsqueda, ordenamiento y paginación basada en cursor.
     */
    public function show(Request $request)
    {
        $auth_user = $request->user();

        // Si no es moderador, deniega el acceso.
        if (!$auth_user->canModerate()) {
            abort(403);
        }

        // Define los campos permitidos para ordenamiento.
        $allowed_order_by = ['id', 'username', 'email_verified_at', 'is_active', 'role', 'created_at'];
        $order_by = $request->get('orderBy', 'username');
        $order_by = in_array($order_by, $allowed_order_by) ? $order_by : 'username';

        // Define la dirección del ordenamiento (ascendente o descendente).
        $order_direction = strtolower($request->get('orderDirection', 'asc'));
        $order_direction = in_array($order_direction, ['asc', 'desc']) ? $order_direction : 'asc';

        // Obtiene el término de búsqueda y el cursor para paginación.
        $query = trim($request->get('query', ''));
        $cursor = $request->header('X-Cursor');

        $users_query = User::query();

        // Aplica búsqueda por nombre de usuario parcial o por ID exacta.
        if ($query !== '') {
            $users_query->where(function($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                  ->orWhere('id', $query); // Búsqueda por ID exacta.
            });
        }

        $users_query->orderBy($order_by, $order_direction);

        $users = $users_query->cursorPaginate(50, ['*'], 'cursor', $cursor);

        return Inertia::render('admin/users/index', [
            'users' => UserResource::collection($users),
        ]);
    }

    
    /**
     * Muestra el formulario de edición de un usuario para el moderador.
     * Los administradores solo pueden ser editados por otros administradores.
     * 
     * @param User $user Usuario cuyos datos se van a editar.
     */
    public function edit(Request $request, User $user)
    {
        $auth_user = $request->user();

        if (!$auth_user->canActOn($user)) {
            abort(403);
        }

        // Prepara el recurso y lo convierte en un arreglo.
        $user_data = (new UserResource($user))->resolve();

        return Inertia::render('admin/users/edit', [
            'user' => $user_data
        ]);
    }

    /**
     * Procesa las acciones de administración sobre un usuario:
     * Cambio de rol, reinicio de info, cambio de correo o restablecimiento de contraseña.
     * 
     * @param User $user Usuario cuyos datos se van a actualizar.
     */
    public function update(Request $request, User $user)
    {
        $auth_user = $request->user();

        // Verifica los permisos del usuario autenticado.
        if (!$auth_user->canActOn($user)) {
            abort(403);
        }
        
        $request->validate([
            'action' => ['required', Rule::in(['change_role', 'reset_info', 'change_username', 'change_email', 'reset_password', 'toggle_account_status', 'delete_account'])],
            'pass_confirmation' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el moderador sea la correcta.
        $this->confirmPassword($request->input('pass_confirmation'));

        // Ejecuta la acción correspondiente.
        switch ($request->action) {
            case 'change_role':
                return $this->changeRole($request, $user);
            case 'reset_info':
                return $this->resetInfo($user);
            case 'change_username':
                return $this->changeUsername($request, $user);
            case 'change_email':
                return $this->changeEmail($request, $user);
            case 'reset_password':
                return $this->resetPassword($request, $user);
            case 'toggle_account_status':
                return $this->toggleAccountStatus($user);
            case 'delete_account':
                return $this->deleteAccount($request, $user);
            default:
                return back()->with('status', 'no-action-performed');
        }
    }

    /**
     * Cambia el rol del usuario (user <-> admin).
     * 
     * @param User $user Usuario al que se le va a cambiar el rol.
     */
    private function changeRole(Request $request, User $user)
    {
        // Si quien realiza la acción no es administrador, deniega el acceso.
        if (!$request->user()->isAdmin()) {
            return back()->withErrors([
                'message' => 'No tienes los permisos suficientes para cambiar el rol.',
            ]);
        }

        $request->validate([
            'new_role' => 'required|in:admin,mod,user',
        ]);

        // Solo guarda el rol si realmente cambió.
        if ($request->new_role !== $user->role) {
            $user->role = $request->new_role;
            $user->save();

            // Si el rol es administrador o moderador, elimina bloqueos relacionados.
            if ($request->new_role !== 'user') {
                // Eliminar bloqueos hechos POR el administrador o moderador.
                UserBlock::where('blocker_id', $user->id)->delete();

                // Eliminar bloqueos HECHOS AL administrador o moderador.
                UserBlock::where('blocked_id', $user->id)->delete();
            }
        }

        return back()->with('status', 'role-updated');
    }

    /**
     * Restaura el nombre de usuario y elimina el avatar del usuario.
     * 
     * @param User $user Usuario al que se le va a restablecer el avatar y el nombre de usuario.
     */
    private function resetInfo(User $user)
    {
        // Elimina el avatar actual si existe en disco.
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = null;

        // Genera un nuevo nombre de usuario único.
        do {
            $new_username = 'user_' . Str::lower(Str::random(8));
        } while (User::where('username', $new_username)->exists());

        $user->username = $new_username;
        $user->save();

        return back()->with('status', 'info-updated');
    }

    /**
     * Cambia el nombre de usuario del usuario.
     * - Si se recibe un nuevo nombre de usuario en la solicitud, lo valida y lo asigna.
     * - Si no se recibe, genera automáticamente un nombre de usuario único y lo asigna.
     * 
     * @param User $user Usuario al que se le va a cambiar el nombre de usuario.
     */
    private function changeUsername(Request $request, User $user)
    {
        if ($request->filled('new_username')) {
            $request->validate([
                'new_username' => UserRules::username($user->id),
            ]);

            $new_username = $request->new_username;
        } else {
            // Dado que no se proporcionó un nombre de usuario, genera uno aleatoriamente.
            do {
                $new_username = 'user_' . Str::lower(Str::random(8));
            } while (User::where('username', $new_username)->exists());
        }

        $user->username = $new_username;

        // Si cambió el nombre de usuario, guarda el cambio.
        if ($user->isDirty('username')) {
            $user->save();
        }

        return back()->with('status', 'username-updated');
    }

    /**
     * Cambia el correo del usuario y, si se solicita, envía el enlace de verificación.
     * 
     * @param User $user Usuario al que se le va a cambiar el correo.
     */
    private function changeEmail(Request $request, User $user)
    {
        $request->validate([
            'new_email' => UserRules::email($user->id),
        ]);

        $user->email = $request->new_email;

        // Si cambió el correo, anula la verificación anterior y guarda los cambios.
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
            $user->save();
        }

        // Si se solicitó, envía el enlace de verificación al correo.
        if (filter_var($request->email_verification_link, FILTER_VALIDATE_BOOLEAN) && !$user->email_verified_at) {
            $user->sendEmailVerificationNotification();
        }

        return back()->with('status', 'email-updated');
    }

    /**
     * Envía un enlace al correo electrónico del usuario para el restablecimiento de la contraseña.
     * 
     * @param User $user Usuario que recibirá el correo electrónico.
     */
    private function resetPassword(Request $request, User $user)
    {
        Password::sendResetLink(['email' => $user->email]);
        
        return back()->with('status', 'password-reset-email-sent');
    }

    /**
     * Inhabilita / habilita a un usuario.
     * 
     * @param User $user Usuario que se va a inhabilitar / habilitar.
     */
    private function toggleAccountStatus(User $user)
    {
        // Inhabilita o habilita a un usuario.
        $user->is_active = !$user->is_active;
        $user->save();

        // Si se inhabilitó al usuario, elimina todas las sesiones activas del usuario.
        if (!$user->is_active) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        return back()->with('status', $user->is_active ? 'activated' : 'deactivated');
    }

    /**
     * Elimina una cuenta de usuario.
     * 
     * @param User $user Usuario que se va a eliminar.
     */
    public function deleteAccount(Request $request, User $user)
    {
        // Si quien realiza la acción no es administrador, deniega el acceso.
        if (!$request->user()->isAdmin()) {
            return back()->withErrors([
                'message' => 'No tienes los permisos suficientes para eliminar la cuenta.',
            ]);
        }

        // Si se está tratando de eliminar a otro administrador, deniega el acceso.
        if ($user->isAdmin()) {
            return back()->withErrors([
                'message' => 'No puedes eliminar a otro administrador.',
            ]);
        }
        
        // Elimina todas las sesiones activas del usuario.
        DB::table('sessions')->where('user_id', $user->id)->delete();

        // Elimina al ususario.
        $user->delete();

        return redirect()->route('admin.user.show')->with('message', 'Usuario eliminado.');
    }
}