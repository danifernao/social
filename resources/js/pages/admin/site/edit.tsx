import AdminSiteEditForm from '@/components/app/admin-site-edit-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, SiteSettings } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function SiteEdit() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura la configuración del sitio proporcionado por Inertia.
    const { site_settings } = usePage<{ site_settings: SiteSettings }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.site.layout.title'),
            href: route('admin.site.edit'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.site.layout.title')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminSiteEditForm settings={site_settings} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
