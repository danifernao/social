import AdminUserTable from '@/components/content/admin-user-table';
import AdminLayout from '@/layouts/admin/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { BreadcrumbItem, Users } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 *
 */
export default function UsersIndex() {
    // Captura la lista de usuarios y el mensaje, si existe, proporcionados por Inertia.
    const { users, message } = usePage<{ users: Users; message: string }>().props;

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Administración de usuarios',
            href: route('admin.user.show'),
        },
    ];

    useEffect(() => {
        // Si se ha proporcionado un mensaje, lo muestra.
        if (message) {
            toast(message);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de usuarios" />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminUserTable users={users.data} previous={users.links.prev} next={users.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
