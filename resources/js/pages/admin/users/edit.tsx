import AdminUserSettingsForm from '@/components/app/admin-user-settings-form';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem, User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function UsersEdit() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario proporcionado por Inertia.
    const { user } = usePage<{ user: User }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('userManagement'),
            href: route('admin.user.show'),
        },
        {
            title: user.username,
            href: route('admin.user.edit', { user: user.username }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('userSettings')} />
            <AdminLayout>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <Link href={`/user/${user.username}`}>{user.username}</Link>
                    </h2>
                    <AdminUserSettingsForm user={user} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
