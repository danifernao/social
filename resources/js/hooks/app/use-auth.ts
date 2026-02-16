import { Auth, User, UserPermission } from "@/types";
import { usePage } from "@inertiajs/react";

/**
 * Determina si el usuario autenticado puede realizar acciones de moderación
 * sobre el usuario especificado.
 */
export function useCanActOnUser(user: User) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Si no hay usuario autenticado, no puede realizar acciones de moderación.
    if (!auth.user) {
        return false;
    }

    // Bloquea la acción si el usuario no tiene permisos de moderación.
    if (!['admin', 'mod'].includes(auth.user.role)) {
        return false;
    }

    // Evita que el usuario pueda actuar sobre sí mismo.
    if (auth.user.id === user.id) {
        return false;
    }

    // Impide que un moderador actúe sobre un administrador.
    if (auth.user.role !== 'admin' && user.role === 'admin') {
        return false;
    }

    // Permite la acción en cualquier otro caso válido.
    return true;
};

/**
 * Determina si el usuario consultado es el mismo que el usuario autenticado.
 */
export function useIsAuthUser(user: User) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Si no hay usuario autenticado, no puede ser el mismo.
    if (!auth.user) {
        return false;
    }

    // Verifica si ambos IDs coinciden.
    return auth.user.id === user.id;
}

/**
 * Determina si el usuario autenticado tiene permiso.
 */
export function useCheckPermission(permission: string) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Si no hay usuario autenticado, no tiene permiso.
    if (!auth.user) {
        return false;
    }

    // Determina si tiene el permiso.
    const can = auth.user.permissions.includes(permission as UserPermission);

    return can;
}