import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface ListLoadMoreProps {
    type: 'post' | 'comment' | 'user' | 'notification'; // Tipo de lista.
    isProcessing: boolean; // Indica si están cargando nuevos elementos.
    onClick: () => void; // Función que se llama al hacer clic en el botón para cargar más elementos.
}

/**
 * Muestra un botón para cargar más elementos de una lista.
 */
export default function ListLoadMore({ type, isProcessing, onClick }: ListLoadMoreProps) {
    // Objeto que asigna a cada tipo de lista su descripción en plural para mostrar en el texto del botón.
    const listType = {
        post: 'publicaciones',
        comment: 'comentarios',
        user: 'usuarios',
        notification: 'notificaciones',
    };
    return (
        <Button variant="outline" disabled={isProcessing} onClick={onClick}>
            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isProcessing ? 'Cargando' : 'Cargar más'} {listType[type]}
        </Button>
    );
}
