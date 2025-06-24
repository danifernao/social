import HeadingSmall from '@/components/app/heading-small';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function Appearance() {
    const { t } = useTranslation('common');
    const { lang } = usePage<{ lang: string }>().props;

    const { data, setData, patch, processing } = useForm({
        lang,
    });

    const changeLanguage = () => {
        patch(route('language.update'), {
            preserveScroll: true,
            onSuccess: () => {
                router.flushAll();
                toast('¡Cambios guardados!');
            },
            onError: (errors) => {
                toast(t('error'));
                console.log(errors);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('languageSettings'),
            href: '/settings/language',
        },
    ];

    useEffect(() => {
        if (data.lang !== lang) {
            changeLanguage();
        }
    }, [data.lang]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('languageSettings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('languageSettings')} description={t('languageSettingsDescription')} />
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
