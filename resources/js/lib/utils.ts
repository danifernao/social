import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Determina si el usuario autenticado puede administrar al usuario especificado.
// No permite la acción en los siguientes casos:
//    - Es el mismo usuario.
//    - El usuario especificado es administrador, pero el autenticado no.
export function canActOnUser (user: User) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAllowed = auth.user.id !== user.id && (auth.user.is_admin || !user.is_admin);
    return isAllowed;
};