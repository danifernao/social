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
 * Convierte una fecha ISO en formato corto y legible.
 */
export function formatDate (date: string, dateFormat: string = 'dd/MM/yyyy h:mm a') {
    return format(parseISO(date), dateFormat);
};