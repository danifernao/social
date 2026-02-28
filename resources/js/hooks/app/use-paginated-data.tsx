import type { EntryAction } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type WithProps = {
    id: number | string;
    is_pinned: boolean;
};

interface UsePaginatedProps<T extends WithProps> {
    initialItems: T[]; // Lista inicial de elementos.

    // Cursor inicial utilizado para solicitar la siguiente página.
    initialCursor: string | null;

    // Nombre de la propiedad devuelta por Inertia que contiene
    // los datos paginados (por ejemplo: "posts", "comments", "users").
    propKey: string;

    // Controla si los nuevos elementos se insertan al inicio o al final.
    insertAtStart?: boolean;
}

/**
 * Hook genérico para gestionar datos paginados por cursor
 * y sincronizar cambios individuales sobre la colección.
 */
export function usePaginatedData<T extends WithProps>({ initialItems, initialCursor, propKey, insertAtStart = false }: UsePaginatedProps<T>) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Estados que contienen la lista de elementos renderizados, el cursor
    // de paginación y un indicador que especifica si se está solicitando
    // una nueva página de datos al servidor.
    const [items, setItems] = useState<T[]>(initialItems);
    const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
    const [processing, setProcessing] = useState(false);

    // Nombre de la ruta actual proporcionada por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    // Determina si es un perfil de usuario o la página de una publicación.
    const supportsPinnedItems = ['profile.show', 'post.show'].includes(routeName);

    /**
     * Solicita la siguiente página de resultados al servidor.
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

            // Combina los elementos previos con los nuevos,
            // evitando duplicados por ID.
            onSuccess: (page) => {
                const pageData = (page.props as any)[propKey];
                const newItems: T[] = pageData?.data ?? [];
                const next = pageData?.meta.next_cursor ?? null;

                setItems((prev) => {
                    const newIds = new Set(newItems.map((item) => item.id));
                    const filteredPrev = prev.filter((item) => !newIds.has(item.id));
                    return [...filteredPrev, ...newItems];
                });

                setNextCursor(next);
            },
            onError: (errors) => {
                toast.error(t('unexpected_error'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    /**
     * Aplica un cambio puntual sobre la colección actual:
     * creación, actualización o eliminación.
     */
    const applyItemChange = (action: EntryAction, item: T) => {
        setItems((prev) => {
            // Reemplaza el elemento existente por su versión actualizada.
            if (action === 'update') {
                const index = prev.findIndex((i) => i.id === item.id);

                if (index === -1) {
                    return prev;
                }

                let updated = [...prev];

                if (supportsPinnedItems) {
                    updated = prev.map((i) => {
                        // Actualiza el elemento.
                        if (i.id === item.id) {
                            return item;
                        }

                        // Si el elemento está fijado, desfija cualquier otro.
                        if (item.is_pinned && i.is_pinned) {
                            return { ...i, is_pinned: false };
                        }

                        return i;
                    });

                    // El elemento fijado va primero en la lista.
                    return updated.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
                }

                updated[index] = item;

                return updated;
            }

            // Elimina el elemento correspondiente según su ID.
            if (action === 'delete') {
                return prev.filter((i) => i.id !== item.id);
            }

            if (insertAtStart) {
                // Si el primer elemento de la lista actual está fijado,
                // inserta el nuevo después de este.
                if (supportsPinnedItems && prev.length > 0 && prev[0].is_pinned) {
                    const [pinned, ...rest] = prev;
                    return [pinned, item, ...rest];
                }

                return [item, ...prev];
            }

            return [...prev, item];
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
        applyItemChange,
    };
}
