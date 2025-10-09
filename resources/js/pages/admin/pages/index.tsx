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

    // Captura las páginas informativas proporcionadas por Inertia.
    const { pages } = usePage<{ pages: Page[] }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pages'),
            href: route('admin.page.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <p>Hello world!</p>
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
