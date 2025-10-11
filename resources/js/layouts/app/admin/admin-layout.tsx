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

export default function AdminLayout({ children, fullWidth }: AdminLayoutProps) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Obtiene el usuario autenticado y el nombre de la ruta proporcionados por Inertia.
    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;

    // Obtiene el idioma pasado por parámetro URL.
    const lang = {
        ...(route().params.lang ? { lang: route().params.lang } : {}),
    };

    const currentPath = window.location.pathname;

    const sidebarNavItems: NavItem[] = [
        ...(auth.user.is_admin
            ? [
                  {
                      title: t('siteSettings'),
                      href: route('admin.site.edit'),
                      icon: null,
                      isActive: ['admin.site.edit'].includes(routeName),
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
    ];

    return (
        <div className="px-4 py-6">
            <Heading title={t('management')} description={t('managementDescription')} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href || item.isActive,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className={cn('flex-1', fullWidth ? 'md:w-xl' : 'md:max-w-2xl')}>
                    <section className={cn('space-y-12', !fullWidth && 'max-w-xl')}>{children}</section>
                </div>
            </div>
        </div>
    );
}
