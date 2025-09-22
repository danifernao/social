import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import type { Entry } from '@/types';
import { router } from '@inertiajs/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EntryForm from './entry-form';

interface EntryItemOptionsProps {
    entry: Entry; // Entrada (publicación o comentario) que será modificada o eliminada mediante las opciones.
}

/**
 * Muestra un menú de opciones para editar o eliminar una entrada.
 */
export default function EntryItemOptions({ entry }: EntryItemOptionsProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Estado que controla la visibilidad del formulario de edición.
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

    // Estado que controla la visibilidad del diálogo de confirmación para eliminar.
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // Permite que otros componentes reflejen la creación, edición o eliminación de una entrada en su lista.
    const updateEntryList = useContext(EntryListUpdateContext);

    // Cierra el formulario tras editar la entrada.
    const closeFormDialog = () => {
        setIsFormDialogOpen(false);
    };

    // Determina el nombre de la ruta y la clave del parámetro según el tipo de entrada.
    const routeName = entry.type === 'post' ? 'post.delete' : 'comment.delete';
    const routeParamKey = entry.type === 'post' ? 'post' : 'comment';

    // Mensaje que se mostrará al usuario tras eliminar la entrada según su tipo.
    const deletedMessage = entry.type === 'post' ? t('postDeleted') : t('commentDeleted');

    // Ejecuta la eliminación de la entrada tras confirmar.
    const onConfirm = () => {
        setIsConfirmDialogOpen(false);
        router.delete(route(routeName, { [routeParamKey]: entry.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // Notifica al contexto que la entrada fue eliminada.
                updateEntryList?.('delete', entry);

                toast(deletedMessage);
            },
            onError: (errors) => {
                toast(t('error'));
                console.error(errors);
            },
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-label={t('options')} title={t('options')} variant="outline">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Button variant="link" className="hover:no-underline" onClick={() => setIsFormDialogOpen(true)}>
                                {t('edit')}
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button variant="link" className="hover:no-underline" onClick={() => setIsConfirmDialogOpen(true)}>
                                {t('delete')}
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogTitle>{entry.type === 'post' ? t('editPost') : t('editComment')}</DialogTitle>
                    <DialogDescription>{entry.type === 'post' ? t('editPostDescription') : t('editCommentDescription')}</DialogDescription>
                    <EntryForm entry={entry} onSubmit={closeFormDialog} />
                </DialogContent>
            </Dialog>

            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{entry.type === 'post' ? t('deletePost') : t('deleteComment')}</DialogTitle>
                        <DialogDescription>{entry.type === 'post' ? t('deletePostConfirmation') : t('deleteCommentConfirmation')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button>{t('cancel')}</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={onConfirm}>
                            {t('accept')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
