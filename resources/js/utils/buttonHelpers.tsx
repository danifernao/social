/**
 * Devuelve las clases CSS para un botón animado dependiendo de si un recurso está cargando o no.
 */
export function getAnimatedButtonClasses(isProcessing: boolean) {
    return {
        iconClass: isProcessing ? 'hidden' : 'h-4 w-4 transition-transform duration-200 group-hover:translate-x-1',
        textClass: isProcessing
            ? 'ml-2'
            : 'max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:ml-2 group-hover:max-w-xs',
    };
}
