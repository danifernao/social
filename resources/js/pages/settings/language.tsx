import HeadingSmall from '@/components/kit/heading-small';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SettingsLayout from '@/layouts/app/settings/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Vista de configuración que permite al usuario cambiar el idioma de la aplicación.
 */
export default function Appearance() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Idioma actual proporcionado por Inertia.
    const { lang } = usePage<{ lang: string }>().props;

    // Inicializa el formulario para el cambio de idioma.
    const { data, setData, patch, processing } = useForm({
        lang,
    });

    // Envía la solicitud para actualizar el idioma del usuario.
    const changeLanguage = () => {
        patch(route('language.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Limpia el estado del router para recargar traducciones.
                router.flushAll();
                toast.success(t('changes_saved'));
            },
            onError: (errors) => {
                toast.error(t('unexpected_error'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
            },
        });
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('language_settings'),
            href: '/settings/language',
        },
    ];

    // Detecta cambios en el idioma seleccionado y ejecuta la actualización.
    useEffect(() => {
        if (data.lang !== lang) {
            changeLanguage();
        }
    }, [data.lang]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('language_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Encabezado descriptivo de la sección */}
                    <HeadingSmall title={t('language_settings')} description={t('update_language_settings')} />

                    {/* Selector de idioma */}
                    <Select value={data.lang} onValueChange={(value: 'en' | 'es') => setData('lang', value)} disabled={processing}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Elige un idioma" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
