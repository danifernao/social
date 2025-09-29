<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserBlock;
use App\Rules\UserRules;
use App\Traits\HandlesPasswordConfirmation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    use HandlesPasswordConfirmation;

    /**
     * Muestra una lista paginada de usuarios para el panel de administración.
     * Aplica búsqueda, ordenamiento y paginación basada en cursor.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es moderador.
        if (!$request->user()->canModerate()) {
            abort(403);
        }

        // Columnas permitidas para ordenamiento.
        $allowed_order_by = ['id', 'username', 'email_verified_at', 'is_active', 'role', 'created_at'];

        // Obtiene y valida el campo para ordenar, por defecto "username".
        $order_by = $request->get('orderBy', 'username');
        $order_by = in_array($order_by, $allowed_order_by) ? $order_by : 'username';

        // Define la dirección del ordenamiento (ascendente o descendente).
        $order_direction = strtolower($request->get('orderDirection', 'asc'));
        $order_direction = in_array($order_direction, ['asc', 'desc']) ? $order_direction : 'asc';

        // Obtiene el término de búsqueda y el cursor para paginación.
        $query = trim($request->get('query', ''));
        $cursor = $request->header('X-Cursor');

        // Consulta base del modelo User.
        $users_query = User::query();

        // Aplica búsqueda por nombre de usuario parcial o por ID exacta.
        if ($query !== '') {
            $users_query->where(function($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                  ->orWhere('id', $query); // Búsqueda por ID exacta.
            });
        }

        // Ordena los resultados de la consulta de usuarios según la columna y la dirección del ordenamiento.
        $users_query->orderBy($order_by, $order_direction);

        // Obtiene los usuarios paginados mediante cursor, 50 por página, a partir del cursor dado.
        $users = $users_query->cursorPaginate(50, ['*'], 'cursor', $cursor);

        return Inertia::render('admin/users/index', [
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Muestra el formulario de creación de usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function create(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('admin/users/create');
    }

    /**
     * Crea un nuevo usuario desde el panel de administración.
     * Requiere que el administrador confirme su contraseña.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'privileged_password' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el administrador sea la correcta.
        $this->confirmPassword($request->input('privileged_password'));

        // Genera un nombre de usuario aleatorio.
        do {
            $username = 'user_' . Str::lower(Str::random(8));
        } while (User::where('username', $username)->exists());

        // Genera una contraseña aleatoria.
        $password = Str::random(12);

        // Crea el usuario forzando la asignación y marcando el correo como verificado.
        $user = User::forceCreate([
            'username' => $username,
            'email' => $request->email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        // Envía un enlace de restablecimiento de contraseña.
        Password::sendResetLink(['email' => $user->email]);

        return redirect()
            ->route('admin.user.index')
            ->with('message', 'Usuario creado');
    }
    
    /**
     * Muestra el formulario de edición de un usuario para el moderador.
     * Los administradores solo pueden ser editados por otros administradores.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuyos datos se van a editar.
     */
    public function edit(Request $request, User $user)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Deniega el acceso si el usuario autenticado no tiene permiso para
        // actuar sobre el usuario indicado.
        if (!$auth_user->canActOn($user)) {
            abort(403);
        }

        // Convierte el usuario en un arreglo usando UserResource.
        $user_data = (new UserResource($user))->resolve();

        return Inertia::render('admin/users/edit', [
            'user' => $user_data
        ]);
    }

    /**
     * Procesa las acciones de administración sobre un usuario.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario cuyos datos se van a actualizar.
     */
    public function update(Request $request, User $user)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Deniega el acceso si el usuario autenticado no tiene permiso para
        // actuar sobre el usuario indicado.
        if (!$auth_user->canActOn($user)) {
            abort(403);
        }
        
        $request->validate([
            'action' => ['required', Rule::in(['change_role', 'delete_avatar', 'change_username', 'change_email', 'reset_password', 'toggle_account_status', 'delete_account'])],
            'privileged_password' => ['required', 'string'],
        ]);

        // Verifica que la contraseña ingresada por el moderador sea la correcta.
        $this->confirmPassword($request->input('privileged_password'));

        // Ejecuta la acción correspondiente delegando a métodos específicos.
        switch ($request->action) {
            case 'change_role':
                return $this->changeRole($request, $user);
            case 'delete_avatar':
                return $this->deleteAvatar($user);
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
                return back()->with('status', 'no_action_performed');
        }
    }

    /**
     * Cambia el rol del usuario (user <-> admin).
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario al que se le va a cambiar el rol.
     */
    private function changeRole(Request $request, User $user)
    {
        // Deniega acceso si el usuario autenticado no es administrador.
        if (!$request->user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'new_role' => 'required|in:admin,mod,user',
        ]);

        // Cambia el rol solo si es diferente al actual.
        if ($request->new_role !== $user->role) {
            $user->role = $request->new_role;
            $user->save();

            // Si el rol es administrador o moderador, elimina bloqueos asociados al usuario.
            if ($request->new_role !== 'user') {
                // Elimina bloqueos hechos POR el administrador o moderador.
                UserBlock::where('blocker_id', $user->id)->delete();

                // Elimina bloqueos HECHOS AL administrador o moderador.
                UserBlock::where('blocked_id', $user->id)->delete();
            }
        }

        return back()->with('status', 'role_updated');
    }

    /**
     * Elimina el avatar del usuario.
     * 
     * @param User $user Usuario al que se le va a eliminar el avatar.
     */
    private function deleteAvatar(User $user)
    {
        // Elimina el avatar del disco si existe.
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Limpia la ruta del avatar en la base de datos.
        $user->avatar_path = null;
        $user->save();

        return back()->with('status', 'avatar_deleted');
    }

    /**
     * Cambia el nombre de usuario del usuario.
     * - Si se recibe un nuevo nombre de usuario en la solicitud, lo valida y lo asigna.
     * - Si no se recibe, genera automáticamente un nombre de usuario único y lo asigna.
     * 
     * @param Request $request Datos de la petición HTTP.
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
            // Genera un nombre de usuario único.
            do {
                $new_username = 'user_' . Str::lower(Str::random(8));
            } while (User::where('username', $new_username)->exists());
        }

        $user->username = $new_username;

        // Guarda el cambio si el nombre de usuario fue modificado.
        if ($user->isDirty('username')) {
            $user->save();
        }

        return back()->with('status', 'username_updated');
    }

    /**
     * Cambia el correo del usuario y, si se solicita, envía el enlace de verificación.
     * 
     * @param Request $request Datos de la petición HTTP.
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

        // Envía enlace de verificación si se solicitó y el correo no está verificado.
        if (filter_var($request->email_verification_link, FILTER_VALIDATE_BOOLEAN) && !$user->email_verified_at) {
            $user->sendEmailVerificationNotification();
        }

        return back()->with('status', 'email_updated');
    }

    /**
     * Envía un enlace al correo electrónico del usuario para el restablecimiento de la contraseña.
     * Opcionalmente, puede generar una nueva contraseña aleatoria y actualizarla antes de enviar el enlace.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario que recibirá el correo electrónico.
     */
    private function resetPassword(Request $request, User $user)
    {
        // Genera y guarda una nueva contraseña aleatoria si se solicitó.
        if (filter_var($request->random_password, FILTER_VALIDATE_BOOLEAN)) {
            $new_password = Str::random(12);
            $user->password = Hash::make($new_password);
            $user->remember_token = null;
            $user->save();
        }

        // Envía el enlace de restablecimiento de contraseña al usuario.
        Password::sendResetLink(['email' => $user->email]);
        
        return back()->with('status', 'password_reset_email_sent');
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
     * @param Request $request Datos de la petición HTTP.
     * @param User $user Usuario que se va a eliminar.
     */
    public function deleteAccount(Request $request, User $user)
    {
        // Deniega acceso si el usuario autenticado no es administrador
        // o si se intenta eliminar a otro administrador.
        if (!$request->user()->isAdmin() || $user->isAdmin()) {
            abort(403);
        }
        
        // Elimina todas las sesiones activas del usuario.
        DB::table('sessions')->where('user_id', $user->id)->delete();

        // Elimina al ususario.
        $user->delete();

        return redirect()->route('admin.user.index')->with('message', 'Usuario eliminado.');
    }
}