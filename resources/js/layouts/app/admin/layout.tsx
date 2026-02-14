import AdminReportBadge from '@/components/app/admin-report-badge';
import Heading from '@/components/kit/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Auth, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
    children: ReactNode;
    fullWidth?: boolean;
}

/**
 * Layout base para las secciones administrativas del sistema.
 * Proporciona una estructura común con encabezado, navegación lateral
 * y un área de contenido principal.
 */
export default function AdminLayout({ children, fullWidth }: AdminLayoutProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario autenticado y el nombre de la ruta proporcionados por Inertia.
    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;

    // Obtiene el idioma pasado por parámetro URL.
    const lang = {
        ...(route().params.lang ? { lang: route().params.lang } : {}),
    };

    // Definición de los elementos de navegación de la barra lateral.
    const sidebarNavItems: NavItem[] = [
        ...(auth.user.is_admin
            ? [
                  {
                      title: t('general'),
                      href: route('admin.site.edit'),
                      icon: null,
                      isActive: ['admin.site.edit', 'admin.invitation.index'].includes(routeName),
                  },
                  {
                      title: t('pages'),
                      href: route('admin.page.index', lang),
                      icon: null,
                      isActive: ['admin.page.index', 'admin.page.create', 'admin.page.edit'].includes(routeName),
                  },
              ]
            : []),
        {
            title: t('users'),
            href: route('admin.user.index'),
            icon: null,
            isActive: ['admin.user.index', 'admin.user.create', 'admin.user.edit'].includes(routeName),
        },
        {
            name: 'reports',
            title: t('reports'),
            href: route('admin.report.index'),
            icon: null,
            isActive: ['admin.report.index', 'admin.report.show'].includes(routeName),
        },
    ];

    return (
        <div className="px-4 py-6">
            {/* Encabezado descriptivo de la sección */}
            <Heading title={t('administration')} description={t('manage_social_network_settings')} />

            {/**
             * Contenedor flexible que organiza la barra lateral y el contenido.
             * En pantallas grandes se distribuye en columnas,
             * mientras que en pantallas pequeñas se apila verticalmente.
             */}
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                {/* Barra lateral de navegación */}
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
                                <Link href={item.href} prefetch>
                                    {item.title}
                                    {item.name === 'reports' && <AdminReportBadge />}
                                </Link>
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
                <div className={cn('flex-1', fullWidth ? 'md:w-xl' : 'md:max-w-2xl')}>
                    <section className={cn('space-y-12', !fullWidth && 'max-w-xl')}>{children}</section>
                </div>
            </div>
        </div>
    );
}
