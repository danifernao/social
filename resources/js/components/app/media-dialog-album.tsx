import { usePaginatedData } from '@/hooks/app/use-paginated-data';
import type { User } from '@/types';
import { Media, MediaCollection } from '@/types/modules/media';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ListLoadMore from './list-load-more';
import MediaDialogGrid from './media-dialog-album-grid';

interface MediaDialogAlbumProps {
    user: User; // Usuario propietario del álbum.
    type: 'image' | 'video'; // Tipo de archivos a mostrar en el álbum.
    onSelect: (media: Media) => void; // Callback para seleccionar un archivo del álbum.
}

/**
 * Álbum de archivos multimedia de un usuario.
 */
export default function MediaDialogAlbum({ user, type, onSelect }: MediaDialogAlbumProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Estado para almacenar la colección inicial de archivos.
    const [media, setMedia] = useState<MediaCollection | null>(null);

    // Estado para controlar la carga inicial.
    const [loading, setLoading] = useState(true);

    // Carga inicial del álbum del usuario.
    useEffect(() => {
        router.get(
            route('media.index', user.id),
            { type },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['media'],

                onStart: () => {
                    setLoading(true);
                },

                onSuccess: (page) => {
                    const collection = page.props.media as MediaCollection | null;

                    if (!collection) return;

                    setMedia(collection);
                    updateItems(collection.data);
                    updateCursor(collection.meta.next_cursor);
                },

                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    }, [user.id]);

    // Usa el hook de paginación para gestionar la lista de archivos.
    const { items, nextCursor, processing, loadMore, updateItems, updateCursor } = usePaginatedData<Media>({
        initialItems: media?.data ?? [],
        initialCursor: media?.meta?.next_cursor ?? null,
        propKey: 'media',
    });

    // Elimina un archivo del álbum.
    const handleDelete = (elem: HTMLButtonElement, id: number) => {
        router.delete(route('media.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                updateItems(items.filter((item) => item.id !== id));
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

    // Si aún se está cargando la colección inicial, muestra un indicador de carga.
    if (loading || !media) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Parrilla de archivos */}
            <MediaDialogGrid items={items} onDelete={handleDelete} onSelect={onSelect} />

            {/* Cargar más */}
            <ListLoadMore type="media" cursor={nextCursor} isProcessing={processing} onClick={loadMore} />
        </div>
    );
}
