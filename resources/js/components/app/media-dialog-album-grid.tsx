import { Button } from '@/components/ui/button';
import type { Media } from '@/types/modules/media';
import { FileX, LoaderCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MediaDialogGridProps {
    items: Media[]; // Lista de archivos multimedia a mostrar en la parrilla.
    onDelete: (elem: HTMLButtonElement, id: number) => void; // Callback para eliminar un archivo del álbum.
    onSelect: (media: Media) => void; // Callback para seleccionar un archivo del álbum.
}

/**
 * Parrilla que muestra los archivos multimedia de un usuario.
 */
export default function MediaDialogAlbumGrid({ items, onDelete, onSelect }: MediaDialogGridProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Si no hay archivos para mostrar, muestra un mensaje indicándolo.
    if (items.length === 0) {
        return <div className="text-muted-foreground py-8 text-center text-sm">{t('no_files_found')}</div>;
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((media) => (
                <div
                    key={media.id}
                    className="group bg-muted relative cursor-pointer overflow-hidden rounded-lg border"
                    title={t('select')}
                    onClick={() => onSelect?.(media)}
                >
                    {/* Vista previa */}
                    {media.type === 'image' ? (
                        <img src={media.url} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                    ) : media.thumbnail_url ? (
                        <img src={media.thumbnail_url} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                            <FileX className="text-muted-foreground h-10 w-10" />
                        </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                    {/* Acciones */}
                    {onDelete && (
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.disabled = true;
                                    onDelete(e.currentTarget, media.id);
                                }}
                                title={t('delete')}
                            >
                                <LoaderCircle className="hidden h-4 w-4 animate-spin group-disabled:block" />
                                <Trash2 className="block h-4 w-4 group-disabled:hidden" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
