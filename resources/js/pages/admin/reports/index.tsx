import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración que muestra el listado de reportes.
 */
export default function PagesIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('reports_administration'),
            href: route('admin.report.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('reports_administration')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    ...
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
