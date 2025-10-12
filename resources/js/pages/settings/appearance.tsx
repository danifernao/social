import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/kit/appearance-tabs';
import HeadingSmall from '@/components/kit/heading-small';
import { type BreadcrumbItem } from '@/types';

import SettingsLayout from '@/layouts/app/settings/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { useTranslation } from 'react-i18next';

export default function Appearance() {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.appearance.title'),
            href: '/settings/appearance',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('settings.appearance.title')} description={t('settings.appearance.description')} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
