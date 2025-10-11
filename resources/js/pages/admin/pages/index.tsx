import AdminPageTable from '@/components/app/admin-page-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/app/admin/admin-layout';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { Auth, BreadcrumbItem } from '@/types';
import { Locale } from '@/types/modules/locale';
import { Pages } from '@/types/modules/page';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 *
 */
export default function PagesIndex() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura los datos proporcionadas por Inertia.
    const { auth, locales, pages, language: currentLanguage } = usePage<{ auth: Auth; locales: Locale[]; pages: Pages; language: string }>().props;

    // Cambia el idioma de la consulta de páginas.
    const handleLanguageChange = (lang: string) => {
        router.get(route('admin.page.index'), { lang }, { preserveState: true, preserveScroll: true });
    };

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('pagesManagement'),
            href: route('admin.page.index', { lang: currentLanguage }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages')} />
            <AdminLayout fullWidth={true}>
                <AppContentLayout noMargin={true} fullWidth={true}>
                    <div className="flex items-center justify-between">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.page.create', { lang: currentLanguage })}>{t('createPage')}</Link>
                        </Button>
                        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder={t('selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map(({ lang, label }) => (
                                    <SelectItem key={lang} value={lang}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AdminPageTable pages={pages.data} previous={pages.links.prev} next={pages.links.next} />
                </AppContentLayout>
            </AdminLayout>
        </AppLayout>
    );
}
