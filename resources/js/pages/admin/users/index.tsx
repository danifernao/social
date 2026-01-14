import AdminUserList from '@/components/app/admin-user-list';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { Auth, BreadcrumbItem, Users } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista de administración que muestra el listado de usuarios registrados.
 */
export default function UsersIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura los datos de autenticación, la lista de usuarios
    // y un posible mensaje proporcionados por Inertia.
    const { auth, users, message } = usePage<{ auth: Auth; users: Users; message: string }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.user.layout.title'),
            href: route('admin.user.index'),
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
            {/* Título del documento */}
            <Head title={t('admin.user.layout.title')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Botón para crear un nuevo usuario */}
                    {auth.user.is_admin && (
                        <div>
                            <Button variant="outline" asChild>
                                <Link href={route('admin.user.create')}>{t('admin.user.index.create')}</Link>
                            </Button>
                        </div>
                    )}

                    {/* Listado paginado de usuarios */}
                    <AdminUserList users={users.data} previous={users.links.prev} next={users.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
