import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/kit/appearance-tabs';
import HeadingSmall from '@/components/kit/heading-small';
import { type BreadcrumbItem } from '@/types';

import SettingsLayout from '@/layouts/app/settings/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { useTranslation } from 'react-i18next';

/**
 * Vista de configuración que permite al usuario cambiar el tema de la aplicación.
 */
export default function Appearance() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.appearance.title'),
            href: '/settings/appearance',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('settings.appearance.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Encabezado descriptivo de la sección */}
                    <HeadingSmall title={t('settings.appearance.title')} description={t('settings.appearance.description')} />

                    {/* Opción para cambiar el tema */}
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
