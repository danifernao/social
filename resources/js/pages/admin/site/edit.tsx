import AdminLayout from '@/layouts/admin/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
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
            title: t('siteSettings'),
            href: route('admin.site.edit'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('siteSettings')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <>Hello world!</>
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
