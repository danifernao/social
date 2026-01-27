import AdminPageForm from '@/components/app/admin-page-form';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración para crear una nueva página estática.
 */
export default function PagesCreate() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Idioma pasado por parámetro en la URL.
    const lang = {
        ...(route().params.lang ? { lang: route().params.lang } : {}),
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pages_administration'),
            href: route('admin.page.index', lang),
        },
        {
            title: t('create_page'),
            href: route('admin.page.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('create_page')} />

            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    {/* Formulario para crear la página estática */}
                    <AdminPageForm />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
