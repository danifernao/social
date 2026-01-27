import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ListLoadMoreProps {
    type: 'post' | 'comment' | 'user' | 'notification'; // Tipo de lista a paginar.
    cursor: string | null; // Cursor que indica si existen más elementos por cargar.
    isProcessing: boolean; // Indica si se está ejecutando una carga en curso.
    autoClick?: boolean; // Define si la carga debe activarse automáticamente al ser visible.
    onClick: () => void; // Función ejecutada para solicitar más elementos.
}

/**
 * Botón para cargar más elementos dentro de una lista paginada.
 * Puede funcionar de forma manual o automática al entrar en el viewport del navegador.
 */
export default function ListLoadMore({ type, cursor, isProcessing, autoClick = true, onClick }: ListLoadMoreProps) {
    //  Si no existe un cursor disponible, significa que no hay más elementos
    // que cargar, por lo que el botón no se renderiza.
    if (!cursor) return null;

    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Referencia al botón para poder observar cuándo entra
    // en el área visible del navegador.
    const ref = useRef<HTMLButtonElement | null>(null);

    // Mapa que asocia cada tipo de lista con su traducción correspondiente en plural.
    const listType = {
        post: t('posts').toLowerCase(),
        comment: t('comments').toLowerCase(),
        user: t('users').toLowerCase(),
        notification: t('notifications').toLowerCase(),
    };

    // Observa la visibilidad del botón dentro del viewport.
    // Cuando el botón es visible y no hay una carga en curso,
    // se dispara automáticamente la acción para cargar más elementos.
    useEffect(() => {
        // Evita la ejecución automática si está deshabilitada,
        // no existe referencia al botón o ya hay una carga activa.
        if (!autoClick || !ref.current || isProcessing) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onClick();
                }
            },
            {
                threshold: 0.1, // Se activa cuando al menos el 10% del botón es visible.
            },
        );

        observer.observe(ref.current);

        // Limpia el observador al desmontar el componente.
        return () => {
            observer.disconnect();
        };
    }, [isProcessing]);

    return (
        // Botón para cargar más elementos.
        <Button ref={ref} variant="outline" disabled={isProcessing} onClick={onClick}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isProcessing ? t('loading') : t('load_more')} {listType[type]}
        </Button>
    );
}
