import AdminPageForm from '@/components/app/admin-page-form';
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
            title: t('pagesManagement'),
            href: route('admin.page.index'),
        },
        {
            title: t('createPage'),
            href: route('admin.page.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('createPage')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminPageForm />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
