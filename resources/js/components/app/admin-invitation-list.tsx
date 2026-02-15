import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Invitation } from '@/types/modules/invitation';
import { Link, router } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import AdminTablePagination from './admin-table-pagination';

interface AdminInvitationListProps {
    status: 'pending' | 'accepted'; // Estado de las invitaciones.
    invitations: Invitation[]; // Lista de invitaciones.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Listado de enlaces de invitaciones de registro.
 */
export default function AdminInvitationList({ status, invitations, previous, next }: AdminInvitationListProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Gestiona la eliminación de una invitación.
    const handleDelete = (id: number) => {
        router.delete(route('admin.invitation.destroy', id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const message = page.props.message;

                if (typeof message === 'string') {
                    toast.success(message);
                }
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
        <div className="w-full space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            {/* Enlace de la invitación */}
                            <TableHead>{t('invite_link')}</TableHead>

                            {/* Creado por */}
                            <TableHead>{t('created_by')}</TableHead>

                            {/* Fecha de creación */}
                            <TableHead className="text-center">{t('created_at')}</TableHead>

                            {status === 'accepted' && (
                                <>
                                    {/* Usado por */}
                                    <TableHead>{t('used_by')}</TableHead>

                                    {/* Fecha de uso */}
                                    <TableHead className="text-center">{t('used_at')}</TableHead>
                                </>
                            )}

                            {/* Acciones */}
                            {status === 'pending' && <TableHead className="w-0 text-center">{t('actions')}</TableHead>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {invitations.length > 0 ? (
                            invitations.map((invitation) => (
                                <TableRow key={invitation.id} className="[&_td]:px-4">
                                    {/* Enlace de la invitación */}
                                    <TableCell className="font-mono">
                                        <Input
                                            type="text"
                                            value={`${window.location.origin}/register/${invitation.token}`}
                                            readOnly
                                            onClick={(e) => e.currentTarget.select()}
                                            className="w-50"
                                        />
                                    </TableCell>

                                    {/* Creado por */}
                                    <TableCell>
                                        {invitation.creator ? (
                                            <Link href={route('profile.show', invitation.creator.id)} className="hover:underline">
                                                {invitation.creator.username}
                                            </Link>
                                        ) : (
                                            t('deleted_user_no', { id: invitation.creator_id })
                                        )}
                                    </TableCell>

                                    {/* Fecha de creación */}
                                    <TableCell className="text-center">{formatDate(invitation.created_at)}</TableCell>

                                    {status === 'accepted' && (
                                        <>
                                            {/* Usado por */}
                                            <TableCell>
                                                {invitation.used_by ? (
                                                    <Link href={route('profile.show', invitation.used_by.id)} className="hover:underline">
                                                        {invitation.used_by.username}
                                                    </Link>
                                                ) : (
                                                    t('deleted_user_no', { id: invitation.used_by_id })
                                                )}
                                            </TableCell>

                                            {/* Fecha de uso */}
                                            <TableCell className="text-center">{formatDate(invitation.used_at!)}</TableCell>
                                        </>
                                    )}

                                    {/* Acciones */}
                                    {status === 'pending' && (
                                        <TableCell className="flex items-center justify-center gap-3">
                                            {/* Botón eliminar con confirmación */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" title={t('delete')} aria-label={t('delete')}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('delete_invitation')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('confirm_invite_link_deletion_irreversible')}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(invitation.id)}>
                                                            {t('delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-4 text-center">
                                    {t('no_invitations_found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <AdminTablePagination previous={previous} next={next} />
        </div>
    );
}
