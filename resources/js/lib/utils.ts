import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Determina si el usuario autenticado puede realizar acciones de moderación
 * sobre el usuario especificado.
 */
export function canActOnUser (user: User) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Bloquea la acción si el usuario no tiene permisos de moderación.
    if (!auth.user.can_moderate) return false;

    // Evita que el usuario pueda actuar sobre sí mismo.
    if (auth.user.id === user.id) return false;

    // Impide que un moderador actúe sobre un administrador.
    if (!auth.user.is_admin && user.is_admin) return false;

    // Permite la acción en cualquier otro caso válido.
    return true;
};