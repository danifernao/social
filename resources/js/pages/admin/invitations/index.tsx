import AdminInvitationList from '@/components/app/admin-invitation-list';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Invitation, Invitations } from '@/types/modules/invitation';
import { Head, router, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista de administración que muestra el listado de invitaciones.
 */
export default function PagesIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la lista de invitaciones proporcionada por Inertia.
    const { invitations } = usePage<{ invitations: Invitations }>().props;

    // Controla la visibilidad del diálogo de confirmación de eliminación.
    const [isInviteLinkDialogOpen, setIsInviteLinkDialogOpen] = useState(false);

    // Estado que indica si se está procesando una solictud de creación.
    const [isProcessing, setIsProcessing] = useState(false);

    // Almacena el enlace de invitación.
    const [inviteLink, setInviteLink] = useState('');

    // Determina el estado de la invitación según el parámetro de la ruta.
    const status = route().params.status === 'accepted' ? 'accepted' : 'pending';

    // Crea el enlace de invitación.
    const handleCreate = () => {
        setIsProcessing(true);

        router.post(
            route('admin.invitation.store'),
            {},
            {
                onSuccess: (page) => {
                    const token = (page.props.invitation as Invitation).token;
                    const link = `${window.location.origin}/register/${token}`;
                    setInviteLink(link);
                    setIsInviteLinkDialogOpen(true);
                },
                onError: (errors) => {
                    toast.error(t('unexpected_error'));

                    if (import.meta.env.DEV) {
                        console.error(errors);
                    }
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    // Maneja el cambio de estado del filtro y recarga la vista
    // pasando el nuevo estado por la URL.
    const handleStatusChange = (value: string) => {
        router.get(route('admin.invitation.index'), { status: value }, { preserveScroll: true });
    };

    // Selecciona el texto del campo al hacer clic.
    const handleSelect = (e: React.MouseEvent<HTMLInputElement>) => {
        e.currentTarget.select();
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('site_administration'),
            href: route('admin.site.edit'),
        },
        {
            title: t('invitation_management'),
            href: route('admin.invitation.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('invitation_management')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <div className="flex items-center justify-between">
                        {/* Botón de creación */}
                        <Button variant="outline" onClick={handleCreate} disabled={isProcessing}>
                            {t('create_invitation')}
                            {isProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        </Button>

                        {/* Diálogo para copiar el enlace de invitación */}
                        <Dialog open={isInviteLinkDialogOpen} onOpenChange={setIsInviteLinkDialogOpen}>
                            <DialogContent>
                                {/* Cabecera del diálogo */}
                                <DialogHeader>
                                    <DialogTitle>{t('invite_link')}</DialogTitle>
                                </DialogHeader>

                                {/* Campo enlace de invitación */}
                                <div className="mt-4 space-y-4">
                                    <Input type="text" value={inviteLink} readOnly onClick={handleSelect} />
                                </div>

                                {/* Acciones del diálogo */}
                                <DialogFooter className="mt-4">
                                    {/* Botón aceptar */}
                                    <DialogClose asChild>
                                        <Button>{t('accept')}</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Pestañas */}
                    <Tabs value={status} onValueChange={handleStatusChange}>
                        <TabsList>
                            <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
                            <TabsTrigger value="accepted">{t('accepted')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Listado de invitaciones */}
                    <AdminInvitationList
                        status={status}
                        invitations={invitations.data}
                        previous={invitations.links.prev}
                        next={invitations.links.next}
                    />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
