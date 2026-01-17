import FormattedText from '@/components/app/formatted-text';
import AppLayout from '@/layouts/kit/app-layout';
import { AppContentLayout } from '@/layouts/kit/app/app-content-layout';
import type { BreadcrumbItem } from '@/types';
import { Page } from '@/types/modules/page';
import { Head, usePage } from '@inertiajs/react';

/**
 * Vista que muestra una página estática del sitio web,
 * como términos y condiciones, política de privacidad u otras
 * páginas de contenido estático.
 */
export default function PageShow() {
    // Captura los datos de la página estática proporcionados por Inertia.
    const { page } = usePage<{ page: Page }>().props;

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: page.title,
            href: route('page.show', { lang: page.language, slug: page.slug }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={page.title} />

            <AppContentLayout>
                {/* Título de la página estática */}
                <h1 className="text-3xl">{page.title}</h1>

                {/* Contenido formateado de la página estática */}
                <FormattedText entryType="page" text={page.content || ''} alwaysExpanded={true} />
            </AppContentLayout>
        </AppLayout>
    );
}
