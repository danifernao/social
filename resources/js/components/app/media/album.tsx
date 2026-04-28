import type { User } from '@/types';
import { Media, MediaCollection } from '@/types/modules/media';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ListLoadMore from '../shared/list-load-more';
import MediaAlbumGrid from './album-grid';

interface MediaAlbumProps {
    user: User; // Usuario propietario del álbum.
    type: 'image' | 'video'; // Tipo de archivos a mostrar en el álbum.
    onSelect: (media: Media) => void; // Callback para seleccionar un archivo del álbum.
}

/**
 * Colección de archivos multimedia subidos por un usuario.
 * Permite paginar a través de los archivos y eliminar aquellos que ya no
 * se deseen tener en el álbum.
 */
export default function MediaAlbum({ user, type, onSelect }: MediaAlbumProps) {
    const { t } = useTranslation();

    // Estados que contiene la lista de metadatos de los archivos multimedia.
    // y el cursor para paginación.
    const [items, setItems] = useState<Media[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    // Estados para controlar la carga inicial y la carga de más elementos.
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Referencia para evitar llamadas concurrentes a la función fetchItems.
    const processingRef = useRef(false);

    // Obtiene la lista de metadatos de los archivos multimedia del usuario.
    const fetchItems = useCallback(
        (cursor: string | null = null) => {
            if (processingRef.current) {
                return;
            }

            setProcessing(true);

            router.get(
                route('media.index', user.id),
                { type },
                {
                    only: ['media'],
                    preserveState: true,
                    preserveScroll: true,
                    headers: cursor ? { 'X-Cursor': cursor } : {},
                    onSuccess: (page) => {
                        const collection = page.props.media as MediaCollection;
                        setItems((prev) => (cursor ? [...prev, ...collection.data] : collection.data));
                        setNextCursor(collection.meta.next_cursor);
                    },
                    onFinish: () => {
                        setProcessing(false);
                        setLoading(false);
                    },
                },
            );
        },
        [user.id, type],
    );

    // Cargar más elementos de la lista.
    const loadMore = () => {
        if (!nextCursor || processing) return;
        fetchItems(nextCursor);
    };

    // Elimina un archivo multimedia del álbum.
    const handleDelete = (elem: HTMLButtonElement, id: number) => {
        router.delete(route('media.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                setItems((prev) => prev.filter((item) => item.id !== id));
            },
            onError: (errors) => {
                toast.error(t('unexpected_error'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
            },
            onFinish: () => {
                elem.disabled = false;
            },
        });
    };

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        processingRef.current = processing;
    }, [processing]);

    return (
        <div className="flex flex-col gap-4">
            {items.length ? (
                <>
                    {/* Parrilla de archivos */}
                    <MediaAlbumGrid items={items} onDelete={handleDelete} onSelect={onSelect} />

                    {/* Cargar más */}
                    <ListLoadMore type="media" cursor={nextCursor} isProcessing={processing} onClick={loadMore} autoClick={false} />
                </>
            ) : (
                <div className="flex h-64 items-center justify-center">
                    {loading ? (
                        <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" aria-label={t('loading')} />
                    ) : (
                        t('no_files_found')
                    )}
                </div>
            )}
        </div>
    );
}
