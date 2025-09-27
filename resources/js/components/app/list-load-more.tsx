import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ListLoadMoreProps {
    type: 'post' | 'comment' | 'user' | 'notification'; // Tipo de lista.
    cursor: string | null; // Cursor para la siguiente página de elementos.
    isProcessing: boolean; // Indica si están cargando nuevos elementos.
    autoClick?: boolean; // Indica si el botón debe hacer clic automáticamente.
    onClick: () => void; // Función que se llama al hacer clic en el botón para cargar más elementos.
}

/**
 * Muestra un botón para cargar más elementos de una lista.
 */
export default function ListLoadMore({ type, cursor, isProcessing, autoClick = true, onClick }: ListLoadMoreProps) {
    // No se carga el botón si no hay cursor disponible, dado que no hay más elementos que cargar.
    if (!cursor) return null;

    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Referencia del botón para observar su visibilidad.
    const ref = useRef<HTMLButtonElement | null>(null);

    // Objeto que asigna a cada tipo de lista su descripción en plural para mostrar en el texto del botón.
    const listType = {
        post: t('posts').toLowerCase(),
        comment: t('comments').toLowerCase(),
        user: t('users').toLowerCase(),
        notification: t('notifications').toLowerCase(),
    };

    // Hace clic en el botón apenas aparezca en la ventana de visualización del navegador.
    useEffect(() => {
        if (!autoClick || !ref.current || isProcessing) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onClick();
                }
            },
            {
                threshold: 0.1,
            },
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [isProcessing]);

    return (
        <Button ref={ref} variant="outline" disabled={isProcessing} onClick={onClick}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isProcessing ? t('loading') : t('loadMore')} {listType[type]}
        </Button>
    );
}
