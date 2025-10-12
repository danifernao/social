import AdminUserCreateForm from '@/components/app/admin-user-create-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function UsersEdit() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

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
            <Head title={t('admin.user.create.title')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminUserCreateForm />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
