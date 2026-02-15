import AdminUserList from '@/components/app/admin-user-list';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, Users } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista de administración que muestra el listado de usuarios registrados.
 */
export default function UsersIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la lista de usuarios y un posible mensaje
    // proporcionados por Inertia.
    const { users, message } = usePage<{ users: Users; message: string }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('users_administration'),
            href: route('admin.user.index'),
        },
    ];

    useEffect(() => {
        // Si se ha proporcionado un mensaje, lo muestra.
        if (message) {
            toast.message(message);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('users_administration')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Listado paginado de usuarios */}
                    <AdminUserList users={users.data} previous={users.links.prev} next={users.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
