import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/** 
 * Función utilitaria para combinar clases de Tailwind de forma segura.
 * Usa clsx para manejar clases condicionales y twMerge para evitar duplicados.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Determina si el usuario autenticado puede realizar acciones de moderación
 * sobre el usuario especificado.
 */
export function canActOnUser(user: User) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Si no hay usuario autenticado, no puede realizar acciones de moderación.
    if (!auth.user) {
        return false;
    }

    // Bloquea la acción si el usuario no tiene permisos de moderación.
    if (!auth.user.can_moderate) {
        return false;
    }

    // Evita que el usuario pueda actuar sobre sí mismo.
    if (auth.user.id === user.id) {
        return false;
    }

    // Impide que un moderador actúe sobre un administrador.
    if (!auth.user.is_admin && user.is_admin) {
        return false;
    }

    // Permite la acción en cualquier otro caso válido.
    return true;
};

/**
 * Determina si el usuario consultado es el mismo que el usuario autenticado.
 */
export function isAuthUser(user: User) {
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
 * Convierte una fecha ISO en formato corto y legible.
 */
export function formatDate (date: string, dateFormat: string = 'dd/MM/yyyy h:mm a') {
    return format(parseISO(date), dateFormat);
};