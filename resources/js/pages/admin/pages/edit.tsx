import AdminPageForm from '@/components/app/admin-page-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Page } from '@/types/modules/page';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function UsersEdit() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario proporcionado por Inertia.
    const { page } = usePage<{ page: Page }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pagesManagement'),
            href: route('admin.user.index'),
        },
        {
            title: page.title,
            href: route('admin.page.edit', page.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminPageForm page={page} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
