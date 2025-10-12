import AdminPageForm from '@/components/app/admin-page-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function PagesCreate() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Obtiene el idioma pasado por parámetro URL.
    const lang = {
        ...(route().params.lang ? { lang: route().params.lang } : {}),
    };

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('admin.page.layout.title'),
            href: route('admin.page.index', lang),
        },
        {
            title: t('admin.page.create.title'),
            href: route('admin.page.create'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.page.create.title')} />
            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <AdminPageForm />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
