import { Auth, User } from "@/types";
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
    if (!auth.user.permissions.can_moderate) {
        return false;
    }

    // Evita que el usuario pueda actuar sobre sí mismo.
    if (auth.user.id === user.id) {
        return false;
    }

    // Impide que un moderador actúe sobre un administrador.
    if (!auth.user.permissions.can_manage_system && user.permissions.can_manage_system) {
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