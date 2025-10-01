import type { Entry, EntryAction } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePaginatedProps<T> {
    initialItems: T[]; // Lista inicial de elementos.
    initialCursor: string | null; // Cursor inicial de paginación.
    fetchUrl: string; // URL que se usará para obtener más datos.
    propKey: string; // Clave con la que se recibe la nueva página desde los props.
    isEntry?: boolean; // Habilita el método "handleChanges" para actualizar la lista de publicaciones o comentarios.
}

// Hook genérico que gestiona la paginación de las publicaciones, comentarios y usuarios.
export function usePaginatedData<T>({ initialItems, initialCursor, fetchUrl, propKey, isEntry = false }: UsePaginatedProps<T>) {
    // Estado que contiene los elementos actuales.
    const [items, setItems] = useState<T[]>(initialItems);

    // Estado para los cursores de paginación.
    const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);

    // Estado que indica si la carga de elementos está en curso.
    const [processing, setProcessing] = useState<boolean>(false);

    // Obtiene más elementos usando el cursor actual.
    const loadMore = (direction: 'next' | 'prev' = 'next') => {
        setProcessing(true);

        router.reload({
            only: [propKey], // Solicita solo la propiedad relevante para este hook.
            headers: {
                // Manda el cursor dependiendo de la dirección.
                'X-Cursor': direction === 'next' ? (nextCursor ?? '') : (prevCursor ?? ''),
            },
            onSuccess: (page) => {
                // Captura las propiedades devueltas por Inertia.
                const pageData = (page.props as any)[propKey];

                // Guarda los nuevos elementos de la lista.
                const newItems = pageData?.data ?? [];

                // Actualiza los cursores de la paginación.
                setNextCursor(pageData?.meta.next_cursor ?? null);
                setPrevCursor(pageData?.meta.prev_cursor ?? null);

                // Combina los nuevos elementos con los previos, evitando duplicados por ID.
                setItems((prev) => {
                    const newIds = new Set(newItems.map((item: any) => item.id));
                    const filteredPrev = prev.filter((item: any) => !newIds.has(item.id));

                    if (direction === 'next') {
                        // Si es "siguiente", se agregan al final.
                        return [...filteredPrev, ...newItems];
                    } else {
                        // Si es "anterior", se agregan al inicio.
                        return [...newItems, ...filteredPrev];
                    }
                });
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

    // Permite actualizar, eliminar o agregar entradas individuales (como publicaciones o comentarios) a la lista.
    const handleEntryChanges = (action: EntryAction, entry: T) => {
        setItems((prev) => {
            const e = entry as Entry;

            if (action === 'update') {
                // Reemplaza un elemento existente por su versión actualizada.
                const updated = [...prev];
                const index = prev.findIndex((item: any) => item.id === e.id);
                if (index !== -1) updated[index] = entry;
                return updated;
            }

            if (action === 'delete') {
                // Elimina el elemento por su ID.
                return prev.filter((item: any) => item.id !== e.id);
            }

            // Agrega el nuevo elemento al principio si es una publicación; al final si no lo es.
            return e.type === 'post' ? [entry, ...prev] : [...prev, entry];
        });
    };

    // Permite actualizar toda la lista de elementos manualmente.
    const updateItems = (newItems: T[]) => {
        setItems(newItems);
    };

    // Restablece los elementos y el cursor a sus valores iniciales.
    const resetProps = () => {
        setItems(initialItems);
        setNextCursor(initialCursor);
        setPrevCursor(null);
    };

    return {
        items,
        nextCursor,
        prevCursor,
        processing,
        loadMore,
        resetProps,
        updateItems,
        handleEntryChanges,
    };
}
