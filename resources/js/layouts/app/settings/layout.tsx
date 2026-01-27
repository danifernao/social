import Heading from '@/components/kit/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Layout base para las páginas de configuración del usuario.
 * Proporciona una estructura común con encabezado, navegación lateral
 * y un área de contenido principal.
 */
export default function SettingsLayout({ children }: PropsWithChildren) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el nombre de la ruta proporcionado por Inertia.
    const { routeName } = usePage<{ routeName: string }>().props;

    // Definición de los elementos de navegación de la barra lateral.
    const sidebarNavItems: NavItem[] = [
        {
            title: t('profile'),
            href: '/settings/profile',
            icon: null,
            isActive: ['profile.edit'].includes(routeName),
        },
        {
            title: t('password'),
            href: '/settings/password',
            icon: null,
            isActive: ['password.edit'].includes(routeName),
        },
        {
            title: t('language'),
            href: '/settings/language',
            icon: null,
            isActive: ['language.edit'].includes(routeName),
        },
        {
            title: t('appearance'),
            href: '/settings/appearance',
            icon: null,
            isActive: ['appearance'].includes(routeName),
        },
    ];

    return (
        <div className="px-4 py-6">
            {/* Encabezado descriptivo de la sección */}
            <Heading title={t('account_settings')} description={t('manage_profile_and_account_settings')} />

            {/**
             * Contenedor flexible que organiza la barra lateral y el contenido.
             * En pantallas grandes se distribuye en columnas,
             * mientras que en pantallas pequeñas se apila verticalmente.
             */}
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                {/* Barra lateral de navegación. */}
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': item.isActive,
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                {/**
                 * Separador visual entre el sidebar y el contenido.
                 * Solo se muestra en pantallas pequeñas.
                 */}
                <Separator className="my-6 md:hidden" />

                {/* Contenedor del contenido principal */}
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
