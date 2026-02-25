import AdminReportList from '@/components/app/admin-report-list';
import AdminReportListSearchBar from '@/components/app/admin-report-list-search-bar';
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
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        const queryParams: Record<string, string> = { ...params, status: value };

        if (value === 'open' && queryParams.resolver) {
            delete queryParams.resolver;
        }

        router.get(route('admin.report.index'), queryParams, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('reports_administration')} />

            <AdminLayout fullWidth>
                <AppContentLayout noMargin fullWidth>
                    {/* Barra de búsqueda */}
                    <AdminReportListSearchBar />

                    {/* Pestañas */}
                    <Tabs value={status} onValueChange={handleStatusChange}>
                        <TabsList>
                            <TabsTrigger value="open">{t('open_reports')}</TabsTrigger>
                            <TabsTrigger value="closed">{t('closed_reports')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Tabla */}
                    <AdminReportList status={status} reports={reports.data} previous={reports.links.prev} next={reports.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
