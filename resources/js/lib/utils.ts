import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { Auth, User, UserPermission } from '@/types';

/** 
 * Función utilitaria para combinar clases de Tailwind de forma segura.
 * Usa clsx para manejar clases condicionales y twMerge para evitar duplicados.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Convierte una fecha ISO en formato corto y legible.
 */
export function formatDate (date: string, dateFormat: string = 'dd/MM/yyyy h:mm a') {
    return format(parseISO(date), dateFormat);
};

/**
 * Genera una miniatura para un archivo de video usando video y canvas.
 * Devuelve un Blob JPEG o null si falla.
 */
export function generateThumbnail(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            const captureTime = Math.min(1, video.duration || 1);
            video.currentTime = captureTime;
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                URL.revokeObjectURL(url);
                resolve(null);
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    resolve(blob);
                },
                'image/jpeg',
                0.85,
            );
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
    });
}

/**
 * Determina si el usuario autenticado puede realizar acciones de moderación
 * sobre el usuario especificado.
 */
export function canActOnUser(auth: Auth, user: User) {
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
export function isAuthUser(auth: Auth, user: User) {
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
export function hasPermission(auth: Auth, permission: string) {
    // Si no hay usuario autenticado, no tiene permiso.
    if (!auth.user) {
        return false;
    }

    // Determina si tiene el permiso.
    const can = auth.user.permissions.includes(permission as UserPermission);

    return can;
}