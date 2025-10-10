import AdminPageTable from '@/components/app/admin-page-table';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Pages } from '@/types/modules/page';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function PagesIndex() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura las páginas informativas proporcionadas por Inertia.
    const { pages } = usePage<{ pages: Pages }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pagesManagement'),
            href: route('admin.page.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages')} />
            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <div>
                        <Button variant="outline" asChild>
                            <Link href={route('admin.page.create')}>{t('createPage')}</Link>
                        </Button>
                    </div>
                    <AdminPageTable pages={pages.data} previous={pages.links.prev} next={pages.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
