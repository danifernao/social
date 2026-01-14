import AdminUserEditForm from '@/components/app/admin-user-edit-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración que muestra el formulario
 * para editar la información de un usuario específico.
 */
export default function UsersEdit() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario proporcionado por Inertia.
    const { user } = usePage<{ user: User }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.user.layout.title'),
            href: route('admin.user.index'),
        },
        {
            title: user.username,
            href: route('admin.user.edit', user.username),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('admin.user.edit.title')} />

            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Encabezado con enlace al perfil del usuario */}
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <Link href={route('profile.show', user.username)}>{user.username}</Link>
                    </h2>

                    {/* Formulario de edición del usuario */}
                    <AdminUserEditForm user={user} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
