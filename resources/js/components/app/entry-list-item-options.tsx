import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { useCanActOnUser, useCheckPermission, useIsAuthUser } from '@/hooks/app/use-auth';
import type { Entry, Post, User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EntryForm from './entry-form';
import ReportDialog from './report-dialog';

interface EntryItemOptionsProps {
    entry: Entry; // Entrada (publicación o comentario) sobre la que se ejecutarán las acciones.
}

/**
 * Menú de opciones para editar o eliminar una entrada.
 */
export default function EntryItemOptions({ entry }: EntryItemOptionsProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el nombre de la ruta actual proporcionado por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    // Determina si el usuario autenticado es el autor de la entrada y
    // tiene permiso para actualizarla.
    const isEntryAuthor = useIsAuthUser(entry.user) && useCheckPermission(entry.type);

    // Determina si el usuario autenticado puede actualizar la entrada.
    const canUpdateEntry = useCanActOnUser(entry.user);

    // Determina si el usuario autenticado puede fijar la entrada.
    const canPinEntry =
        (routeName === 'profile.show' && entry.type === 'post' && !entry.profile_user_id && (isEntryAuthor || canUpdateEntry)) ||
        (routeName === 'post.show' && entry.type === 'comment' && (useIsAuthUser({ id: entry.post_user_id } as User) || canUpdateEntry));

    // Controla la visibilidad del formulario de edición.
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

    // Controla la visibilidad del diálogo de confirmación de eliminación.
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // Controla la visibilidad del diálogo para reportar la entrada.
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

    // Contexto para notificar cambios en la lista de entradas.
    const updateEntryList = useContext(EntryListUpdateContext);

    // Cierra el formulario tras una edición exitosa.
    const closeFormDialog = () => {
        setIsFormDialogOpen(false);
    };

    // Controla el estado de la opción fijar/desfijar.
    const [isTogglingPin, setIsTogglingPin] = useState(false);

    // Determina si una publicación está silenciada o no.
    const [isMuted, setIsMuted] = useState(entry.type === 'post' ? entry.is_muted : null);

    // Controla el estado de la opción silenciar o dejar de silenciar.
    const [isTogglingMute, setIsTogglingMute] = useState(false);

    // Define el nombre del parámetro requerido por la ruta.
    const routeParamKey = entry.type === 'post' ? 'post' : 'comment';

    // Define la ruta de actualización según el tipo de entrada.
    const updateRouteName = entry.type === 'post' ? 'post.update' : 'comment.update';

    // Mensaje mostrado tras fijar/desfijar una entrada.
    const pinnedMessage =
        entry.type === 'post'
            ? entry.is_pinned
                ? t('post_unpinned')
                : t('post_pinned')
            : entry.is_pinned
              ? t('comment_unpinned')
              : t('comment_pinned');

    // Define la ruta de eliminación según el tipo de entrada.
    const deleteRouteName = entry.type === 'post' ? 'post.delete' : 'comment.delete';

    // Mensaje mostrado tras eliminar la entrada.
    const deletedMessage = entry.type === 'post' ? t('post_deleted') : t('comment_deleted');

    // Alterna el estado fijado de la entrada.
    const togglePin = () => {
        setIsTogglingPin(true);

        router.patch(
            route(updateRouteName, { [routeParamKey]: entry.id }),
            {
                is_pinned: !entry.is_pinned,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedEntry = entry.type === 'post' ? (page.props.post as Post) : (page.props.comment as Comment);

                    // Informa al contexto del cambio realizado.
                    updateEntryList?.('update', updatedEntry);

                    toast.success(pinnedMessage);
                },
                onError: (errors) => {
                    toast.error(t('unexpected_error'));

                    if (import.meta.env.DEV) {
                        console.error(errors);
                    }
                },
                onFinish: () => {
                    setIsTogglingPin(false);
                },
            },
        );
    };

    // Activa o desactiva las notificaciones para la publicación.
    const toggleMute = () => {
        setIsTogglingMute(true);

        router.post(
            route('post.mute.toggle', entry.id),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as unknown as { status: string; message: string };

                    setIsMuted(props.status === 'post_muted');

                    toast.success(props.message);
                },
                onError: (errors) => {
                    toast.error(t('unexpected_error'));

                    if (import.meta.env.DEV) {
                        console.error(errors);
                    }
                },
                onFinish: () => {
                    setIsTogglingMute(false);
                },
            },
        );
    };

    // Ejecuta la eliminación de la entrada tras la confirmación del usuario.
    const onConfirm = () => {
        setIsConfirmDialogOpen(false);

        router.delete(route(deleteRouteName, { [routeParamKey]: entry.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // Notifica al contexto que la entrada fue eliminada.
                updateEntryList?.('delete', entry);

                toast.success(deletedMessage);
            },
            onError: (errors) => {
                toast.error(t('unexpected_error'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
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
                    {/* Opción para fijar la entrada */}
                    {canPinEntry && (
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={togglePin} disabled={isTogglingPin}>
                                {entry.is_pinned ? t('unpin') : t('pin')}
                            </Button>
                        </DropdownMenuItem>
                    )}

                    {/* Opción para silenciar o dejar de silenciar las notificaciones asociadas a la publicación */}
                    {entry.type === 'post' && (
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={toggleMute}>
                                {isMuted ? t('unmute_post') : t('mute_post')}
                            </Button>
                        </DropdownMenuItem>
                    )}

                    {/* Opción para editar la entrada */}
                    {(isEntryAuthor || canUpdateEntry) && (
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsFormDialogOpen(true)}>
                                {t('edit')}
                            </Button>
                        </DropdownMenuItem>
                    )}

                    {/* Opción para eliminar la entrada */}
                    {(isEntryAuthor || canUpdateEntry) && (
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsConfirmDialogOpen(true)}>
                                {t('delete')}
                            </Button>
                        </DropdownMenuItem>
                    )}

                    {/* Opción para reportar la entrada */}
                    {!isEntryAuthor && (
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsReportDialogOpen(true)}>
                                {t('report')}
                            </Button>
                        </DropdownMenuItem>
                    )}

                    {/* Opción administrativa para gestionar al autor de la entrada */}
                    {canUpdateEntry && (
                        <>
                            <DropdownMenuItem asChild>
                                <Button asChild variant="link" className="w-full justify-start hover:no-underline">
                                    <Link
                                        href={route('admin.report.index', {
                                            [entry.type === 'post' ? 'post_reported' : 'comment_reported']: entry.id,
                                        })}
                                    >
                                        {t('view_reports')}
                                    </Link>
                                </Button>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Button asChild variant="link" className="w-full justify-start hover:no-underline">
                                    <Link href={route('admin.user.edit', entry.user.id)}>{t('manage_user')}</Link>
                                </Button>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Diálogo de edición */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    {/* Título y descripción del diálogo */}
                    <DialogTitle>{entry.type === 'post' ? t('edit_post') : t('edit_comment')}</DialogTitle>
                    <DialogDescription>{entry.type === 'post' ? t('edit_post_content') : t('edit_comment_content')}</DialogDescription>

                    {/* Formulario de edición de la entrada */}
                    <EntryForm entry={entry} onSubmit={closeFormDialog} />
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        {/* Título y descripción del diálogo */}
                        <DialogTitle>{entry.type === 'post' ? t('delete_post') : t('delete_comment')}</DialogTitle>
                        <DialogDescription>
                            {entry.type === 'post' ? t('confirm_post_deletion_irreversible') : t('confirm_comment_deletion_irreversible')}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        {/* Botón cancelar */}
                        <DialogClose asChild>
                            <Button>{t('cancel')}</Button>
                        </DialogClose>

                        {/* Botón aceptar */}
                        <Button variant="destructive" onClick={onConfirm}>
                            {t('accept')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo para reportar la entrada */}
            <ReportDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} reportableType={entry.type} reportableId={entry.id} />
        </>
    );
}
