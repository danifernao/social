import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { canActOnUser } from '@/lib/utils';
import type { Entry } from '@/types';
import { Link, router } from '@inertiajs/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EntryForm from './entry-form';

interface EntryItemOptionsProps {
    entry: Entry; // Entrada (publicación o comentario) sobre la que se ejecutarán las acciones.
}

/**
 * Menú de opciones para editar o eliminar una entrada.
 */
export default function EntryItemOptions({ entry }: EntryItemOptionsProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Controla la visibilidad del formulario de edición.
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

    // Controla la visibilidad del diálogo de confirmación de eliminación.
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // Contexto para notificar cambios en la lista de entradas.
    const updateEntryList = useContext(EntryListUpdateContext);

    // Cierra el formulario tras una edición exitosa.
    const closeFormDialog = () => {
        setIsFormDialogOpen(false);
    };

    // Define la ruta de eliminación según el tipo de entrada.
    const routeName = entry.type === 'post' ? 'post.delete' : 'comment.delete';

    // Define el nombre del parámetro requerido por la ruta.
    const routeParamKey = entry.type === 'post' ? 'post' : 'comment';

    // Mensaje mostrado tras eliminar la entrada.
    const deletedMessage = entry.type === 'post' ? t('post.delete.success') : t('comment.delete.success');

    // Ejecuta la eliminación de la entrada tras la confirmación del usuario.
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
                toast(t('common.error'));
                console.error(errors);
            },
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-label={t('common.options')} title={t('common.options')} variant="outline">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    {/* Opción para editar la entrada */}
                    <DropdownMenuItem asChild>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsFormDialogOpen(true)}>
                            {t('common.edit')}
                        </Button>
                    </DropdownMenuItem>

                    {/* Opción para eliminar la entrada */}
                    <DropdownMenuItem asChild>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsConfirmDialogOpen(true)}>
                            {t('common.delete')}
                        </Button>
                    </DropdownMenuItem>

                    {/* Opción administrativa para gestionar al autor de la entrada */}
                    {canActOnUser(entry.user) && (
                        <DropdownMenuItem asChild>
                            <Button asChild variant="link" className="w-full justify-start hover:no-underline">
                                <Link href={route('admin.user.edit', entry.user.id)}>{t('common.manageUser')}</Link>
                            </Button>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Diálogo de edición */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    {/* Título y descripción del diálogo */}
                    <DialogTitle>{entry.type === 'post' ? t('post.edit.title') : t('comment.edit.title')}</DialogTitle>
                    <DialogDescription>{entry.type === 'post' ? t('post.edit.description') : t('comment.edit.description')}</DialogDescription>

                    {/* Formulario de edición de la entrada */}
                    <EntryForm entry={entry} onSubmit={closeFormDialog} />
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        {/* Título y descripción del diálogo */}
                        <DialogTitle>{entry.type === 'post' ? t('post.delete.title') : t('comment.delete.title')}</DialogTitle>
                        <DialogDescription>
                            {entry.type === 'post' ? t('post.delete.description') : t('comment.delete.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        {/* Botón cancelar */}
                        <DialogClose asChild>
                            <Button>{t('common.cancel')}</Button>
                        </DialogClose>

                        {/* Botón aceptar */}
                        <Button variant="destructive" onClick={onConfirm}>
                            {t('common.accept')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
