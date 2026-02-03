import AdminReportList from '@/components/app/admin-report-list';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Reports } from '@/types/modules/report';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ReportsIndex() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la lista de reportes proporcionada por Inertia.
    const { reports } = usePage<{ reports: Reports }>().props;

    // Determina el estado del reporte según el parámetro de la ruta.
    const status = route().params.status === 'closed' ? 'closed' : 'open';

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('reports_administration'),
            href: route('admin.report.index'),
        },
    ];

    // Maneja el cambio de estado del filtro y recarga la vista
    // pasando el nuevo estado por la URL.
    const handleStatusChange = (value: string) => {
        router.get(route('admin.report.index'), { status: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('reports_administration')} />

            <AdminLayout fullWidth>
                <AppContentLayout noMargin fullWidth>
                    {/* Pestañas */}
                    <Tabs value={status} onValueChange={handleStatusChange} className="mb-4">
                        <TabsList>
                            <TabsTrigger value="open">{t('open_reports')}</TabsTrigger>
                            <TabsTrigger value="closed">{t('closed_reports')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Tabla */}
                    <AdminReportList reports={reports.data} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
