import AdminSiteSettingsForm from '@/components/content/admin-site-settings-form';
import AdminLayout from '@/layouts/admin/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { BreadcrumbItem, SiteSettings } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function UsersEdit() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura la configuración del sitio proporcionado por Inertia.
    const { site_settings } = usePage<{ site_settings: SiteSettings }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('siteSettings'),
            href: route('admin.site.edit'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('siteSettings')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminSiteSettingsForm settings={site_settings} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
