import ReportItem from '@/components/app/admin/reports/item';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Report } from '@/types/modules/report';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface RelatedReports {
    data: Report[];
}

/**
 * Vista de administración para ver y cerrar un reporte.
 */
export default function ReportsShow() {
    const { t } = useTranslation();

    const { report, related } = usePage<{ report: Report; related: RelatedReports }>().props;

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
            <Head title={t('report_no', { id: report.id })} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <ReportItem report={report} related={related} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
