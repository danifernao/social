import AdminReportItem from '@/components/app/admin-report-item';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Report } from '@/types/modules/report';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración para ver y cerrar un reporte.
 */
export default function ReportsShow() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el reporte y los reportes relacionados proporcionados por Inertia.
    const { report, related } = usePage<{ report: Report; related: Report[] }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('reports_administration'),
            href: route('admin.report.index'),
        },
        {
            title: t('report_no', { id: report.id }),
            href: route('admin.report.show', report.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('report_no', { id: report.id })} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminReportItem report={report} related={related} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
