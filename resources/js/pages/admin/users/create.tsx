import AdminUserCreateForm from '@/components/app/admin-user-create-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración que muestra el formulario
 * para crear un nuevo usuario.
 */
export default function UsersCreate() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.user.layout.title'),
            href: route('admin.user.index'),
        },
        {
            title: t('admin.user.create.title'),
            href: route('admin.user.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('admin.user.create.title')} />

            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Formulario para crear un nuevo usuario */}
                    <AdminUserCreateForm />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
