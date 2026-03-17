import type { EntryAction } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type WithProps = {
    id: number | string;
    is_pinned?: boolean;
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

type InternalItem<T> = T & { _order: number };

/**
 * Hook genérico para gestionar datos paginados por cursor
 * y sincronizar cambios individuales sobre la colección.
 */
export function usePaginatedData<T extends WithProps>({ initialItems, initialCursor, propKey, insertAtStart = false }: UsePaginatedProps<T>) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Contador persistente para mantener el orden de la lista.
    const orderCounter = useRef(0);

    // Asigna "_order" a los nuevos elementos de la lista
    // para conservar el orden original.
    const mapWithOrder = (items: T[]): InternalItem<T>[] => {
        return items.map((item) => ({
            ...item,
            _order: orderCounter.current++,
        }));
    };

    // Ordena la lista de elementos de acuerdo con el orden original.
    // El elemento fijado siempre va de primero.
    const sortItems = (list: InternalItem<T>[]) => {
        return [...list].sort((a, b) => {
            // Elemento fijado.
            if (a.is_pinned && !b.is_pinned) {
                return -1;
            }

            if (!a.is_pinned && b.is_pinned) {
                return 1;
            }

            // Orden original.
            return a._order - b._order;
        });
    };

    // Lista de elementos.
    const [items, setItems] = useState<InternalItem<T>[]>(() => mapWithOrder(initialItems));

    // Cursor de paginación.
    const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);

    // Indica si se está solicitando una nueva página de datos al servidor.
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
                const rawNewItems: T[] = pageData?.data ?? [];

                // Asigna "_order" a los nuevos elementos para conservar
                // su posición original.
                const newItemsWithOrder = mapWithOrder(rawNewItems);

                setItems((prev) => {
                    // Colección de IDs de los nuevos elementos.
                    const newIds = new Set(newItemsWithOrder.map((item) => item.id));

                    // Retira potenciales duplicados de la colección vieja.
                    const filteredPrev = prev.filter((item) => !newIds.has(item.id));

                    // Ordena la lista resultante.
                    return sortItems([...filteredPrev, ...newItemsWithOrder]);
                });

                setNextCursor(pageData?.meta.next_cursor ?? null);
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
                const existingItem = prev.find((i) => i.id === item.id);

                if (!existingItem) {
                    return prev;
                }

                // Agrega el orden original al nuevo elemento.
                const updatedItem: InternalItem<T> = {
                    ...item,
                    _order: existingItem._order,
                };

                // Si el nuevo elemento está fijado, se desfijan los demás.
                let newList = prev.map((i) => {
                    if (i.id === item.id) {
                        return updatedItem;
                    }

                    if (supportsPinnedItems && item.is_pinned && i.is_pinned) {
                        return { ...i, is_pinned: false };
                    }

                    return i;
                });

                // Se ordenan los elementos de acuerdo al orden original.
                return sortItems(newList);
            }

            // Elimina el elemento correspondiente según su ID.
            if (action === 'delete') {
                return prev.filter((i) => i.id !== item.id);
            }

            // Si es un nuevo elemento, se le asigna el orden original.
            const newItem: InternalItem<T> = {
                ...item,
                _order: insertAtStart ? Math.min(...prev.map((i) => i._order), 0) - 1 : orderCounter.current++,
            };

            // Se ordenan los elementos de acuerdo al orden original.
            return sortItems([...prev, newItem]);
        });
    };

    /**
     * Reemplaza manualmente la lista completa de elementos.
     */
    const updateItems = (newItems: T[]) => {
        setItems(() => mapWithOrder(newItems));
    };

    /**
     * Restablece los elementos y el cursor a sus valores iniciales.
     */
    const resetProps = () => {
        setItems(() => mapWithOrder(initialItems));
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
