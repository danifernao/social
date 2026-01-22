import type { Entry, EntryAction } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePaginatedProps<T> {
    // Lista inicial de elementos.
    initialItems: T[];

    // Cursor inicial utilizado para solicitar la siguiente página.
    initialCursor: string | null;

    // Nombre de la propiedad devuelta por Inertia que contiene
    // los datos paginados (por ejemplo: "posts", "comments", "users").
    propKey: string;
}

/**
 * Hook genérico que gestiona la paginación por cursor
 * para listados como publicaciones, comentarios o usuarios.
 */
export function usePaginatedData<T>({ initialItems, initialCursor, propKey }: UsePaginatedProps<T>) {
    // Estado que contiene la lista actual de elementos renderizados.
    const [items, setItems] = useState<T[]>(initialItems);

    // Cursor que identifica la siguiente página a solicitar.
    // Si es null, no existen más elementos disponibles.
    const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);

    // Estado que indica si actualmente se está solicitando
    // una nueva página de datos al servidor.
    const [processing, setProcessing] = useState<boolean>(false);

    /**
     * Solicita al servidor la siguiente página de elementos.
     */
    const loadMore = () => {
        setProcessing(true);
        router.reload({
            // Indica a Inertia que solo recargue la propiedad paginada,
            // evitando recalcular y reenviar el resto de la página.
            only: [propKey],

            // Envía el cursor de paginación como un header HTTP personalizado
            // para evitar el uso del parámetro "cursor" en la URL.
            headers: {
                'X-Cursor': nextCursor ?? '',
            },

            onSuccess: (page) => {
                // Extrae los nuevos elementos y el cursor de la siguiente página
                // desde las propiedades de Inertia.
                const pageData = (page.props as any)[propKey];
                const newItems = pageData?.data ?? [];
                const next = pageData?.meta.next_cursor ?? null;

                // Combina los elementos previos con los nuevos,
                // evitando duplicados por ID.
                setItems((prev) => {
                    const newIds = new Set(newItems.map((item: any) => item.id));
                    const filteredPrev = prev.filter((item: any) => !newIds.has(item.id));
                    return [...filteredPrev, ...newItems];
                });

                // Actualiza el cursor para la siguiente solicitud.
                setNextCursor(next);
            },
            onError: (errors) => {
                toast('¡Ups! Error inesperado.');
                console.error(errors);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    /**
     * Sincroniza cambios individuales sobre la lista actual,
     * como actualizaciones, eliminaciones o inserciones.
     *
     * Se utiliza tras crear, editar o eliminar
     * una publicación o comentario.
     */
    const handleEntryChanges = (action: EntryAction, entry: T) => {
        setItems((prev) => {
            const e = entry as Entry;

            if (action === 'update') {
                // Reemplaza el elemento existente por su versión actualizada.
                const updated = [...prev];
                const index = prev.findIndex((item: any) => item.id === e.id);

                if (index !== -1) {
                    updated[index] = entry;
                }

                return updated;
            }

            if (action === 'delete') {
                // Elimina el elemento correspondiente según su ID.
                return prev.filter((item: any) => item.id !== e.id);
            }

            // Inserta un nuevo elemento en la lista. Las publicaciones
            // se agregan al inicio, mientras que otros tipos se agregan al final.
            return e.type === 'post' ? [entry, ...prev] : [...prev, entry];
        });
    };

    /**
     * Reemplaza manualmente la lista completa de elementos.
     */
    const updateItems = (newItems: T[]) => {
        setItems(newItems);
    };

    /**
     * Restablece los elementos y el cursor a sus valores iniciales.
     */
    const resetProps = () => {
        setItems(initialItems);
        setNextCursor(initialCursor);
    };

    /**
     * Expone los valores y funciones necesarias para su consumo externo.
     */
    return {
        items,
        nextCursor,
        processing,
        loadMore,
        resetProps,
        updateItems,
        handleEntryChanges,
    };
}
