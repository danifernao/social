import AdminSiteEditForm from '@/components/app/admin-site-edit-form';
import AdminLayout from '@/layouts/app/admin/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, SiteSettings } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * Vista de administración que muestra el formulario
 * para editar la configuración global del sitio web.
 */
export default function SiteEdit() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la configuración global del sitio proporcionada por Inertia.
    const { site_settings } = usePage<{ site_settings: SiteSettings }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('site_administration'),
            href: route('admin.site.edit'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('site_administration')} />

            {/* Formulario para editar los datos globales del sitio */}
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminSiteEditForm settings={site_settings} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
