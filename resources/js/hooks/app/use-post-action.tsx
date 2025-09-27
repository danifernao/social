import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePostActionOptions {
    onSuccess?: () => void; // Función que se ejecuta si la petición POST es exitosa.
    onError?: (errors: any) => void; // Función que se ejecuta si la petición POST falla con errores.
}

export function usePostAction() {
    // Estado que indica si la acción está en proceso.
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Función para ejecutar una petición POST a una ruta específica con parámetros y opciones personalizadas:
     * - routeName: Nombre de la ruta.
     * - routeParams: Parámetros que se pasan a la ruta para construir la URL.
     * - options: callbacks onSuccess y onError para gestionar resultados.
     */
    const execute = (routeName: string, routeParams: Record<string, any> = {}, options: UsePostActionOptions = {}) => {
        setIsProcessing(true);

        router.post(
            route(routeName, routeParams),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    toast('¡Ups! Error inesperado.');
                    console.error(errors);
                    options.onError?.(errors);
                },
                onSuccess: () => {
                    options.onSuccess?.();
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return { isProcessing, execute };
}
