import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePostActionOptions {
    // Callback opcional que se ejecuta cuando la petición se completa con éxito.
    onSuccess?: () => void;

    // Callback opcional que se ejecuta cuando la petición falla con errores.
    onError?: (errors: any) => void;
}

/**
 * Hook utilitario para ejecutar acciones POST simples mediante Inertia.
 */
export function usePostAction() {
    // Estado que indica si actualmente se está ejecutando una petición POST.
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Ejecuta una petición POST hacia una ruta específica.
     *
     * Permite:
     * - Construir dinámicamente la URL a partir del nombre de la ruta
     * - Ejecutar callbacks personalizados en caso de éxito o error.
     *
     * @param routeName Nombre de la ruta definida en Laravel.
     * @param routeParams Parámetros utilizados para generar la URL.
     * @param options Callbacks opcionales para manejar el resultado de la petición.
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

    /**
     * Expone el estado de procesamiento y la función
     * para ejecutar acciones POST.
     */
    return { isProcessing, execute };
}
