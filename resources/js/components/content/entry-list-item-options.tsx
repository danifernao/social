import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import type { Entry } from '@/types';
import { router } from '@inertiajs/react';
import { EllipsisVertical } from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EntryForm from './entry-form';

interface EntryItemOptionsProps {
    entry: Entry; // Entrada (publicación o comentario) que será modificada o eliminada mediante las opciones.
}

/**
 * Muestra un menú de opciones para editar o eliminar una entrada.
 */
export default function EntryItemOptions({ entry }: EntryItemOptionsProps) {
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
    const deletedMessage = entry.type === 'post' ? 'Publicación eliminada.' : 'Comentario eliminado.';

    // Ejecuta la eliminación de la entrada tras confirmar.
    const onConfirm = () => {
        router.delete(route(routeName, { [routeParamKey]: entry.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // Notifica al contexto que la entrada fue eliminada.
                updateEntryList?.('delete', entry);

                toast(deletedMessage);
            },
            onError: (errors) => {
                toast('¡Ups! Error inesperado.');
                console.error(errors);
            },
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-label="Opciones" variant="outline">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Button variant="link" className="hover:no-underline" onClick={() => setIsFormDialogOpen(true)}>
                                Editar
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Button variant="link" className="hover:no-underline" onClick={() => setIsConfirmDialogOpen(true)}>
                                Eliminar
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogTitle>Editar</DialogTitle>
                    <DialogDescription>Edita el contenido de tu {entry.type === 'post' ? 'publicación' : 'comentario'}.</DialogDescription>
                    <EntryForm entry={entry} onSubmit={closeFormDialog} />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar {entry.type === 'post' ? 'publicación' : 'comentario'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de eliminar {entry.type === 'post' ? 'esta publicación' : 'este comentario'}? Esta acción es irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirm}>Aceptar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
