import AdminPageForm from '@/components/app/admin-page-form';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Page } from '@/types/modules/page';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración para editar una página estática existente.
 */
export default function PagesEdit() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la página estática proporcionada por Inertia.
    const { page } = usePage<{ page: Page }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pages_administration'),
            href: route('admin.page.index', { lang: page.language }),
        },
        {
            title: page.title,
            href: route('admin.page.edit', page.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('edit_page')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Formulario de edición de la página estática */}
                    <AdminPageForm page={page} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
