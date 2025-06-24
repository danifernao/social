import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/app/appearance-tabs';
import HeadingSmall from '@/components/app/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from 'react-i18next';

export default function Appearance() {
    const { t } = useTranslation('common');

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
