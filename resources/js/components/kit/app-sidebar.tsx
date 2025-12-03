import { NavFooter } from '@/components/kit/nav-footer';
import { NavMain } from '@/components/kit/nav-main';
import { NavUser } from '@/components/kit/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Auth, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Home, LogIn, Search, User, UserCog, UserPlus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;
    const params = route().params;

    let mainNavItems: NavItem[];

    if (auth.user) {
        mainNavItems = [
            {
                title: t('common.home'),
                href: '/home',
                icon: Home,
            },
            {
                title: t('common.profile'),
                href: route('profile.show', auth.user.username),
                icon: User,
                isActive: routeName === 'profile.show' && params.user === auth.user.username,
            },
            {
                title: t('common.explore'),
                href: `/search`,
                icon: Search,
            },
            {
                title: t('common.connections'),
                href: route('follow.following', auth.user.username),
                icon: Users,
                isActive: ['follow.following', 'follow.followers'].includes(routeName) && params.user === auth.user.username,
            },
            {
                name: 'notifications',
                title: t('common.notifications'),
                href: route('notification.index'),
                icon: Bell,
            },
            ...(auth.user.can_moderate
                ? [
                      {
                          title: t('common.management'),
                          href: route('admin.index'),
                          icon: UserCog,
                          isActive: ['admin.site.edit', 'admin.user.index', 'admin.user.create', 'admin.user.edit'].includes(routeName),
                      },
                  ]
                : []),
        ];
    } else {
        mainNavItems = [
            {
                title: t('common.login'),
                href: route('login'),
                icon: LogIn,
            },
            {
                title: t('common.register'),
                href: route('register'),
                icon: UserPlus,
            },
        ];
    }

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('home')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {auth.user && <NavUser />}
            </SidebarFooter>
        </Sidebar>
    );
}
