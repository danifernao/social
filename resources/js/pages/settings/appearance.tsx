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
            title: t('appearanceSettings'),
            href: '/settings/appearance',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('appearanceSettings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('appearanceSettings')} description={t('appearanceSettingsDescription')} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
