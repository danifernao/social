import { NavFooter } from '@/components/app/nav-footer';
import { NavMain } from '@/components/app/nav-main';
import { NavUser } from '@/components/app/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type Auth, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Home, LogIn, Search, User, UserCog, UserPlus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const { auth, routeName } = usePage<{ auth: Auth; routeName: string }>().props;

    const navAuth = [
        {
            title: t('home'),
            href: '/home',
            icon: Home,
        },
        {
            title: t('profile'),
            href: `/user/${auth.user?.username}`,
            icon: User,
        },
        {
            title: t('explore'),
            href: `/search`,
            icon: Search,
            isActive: ['search.show', 'search.hashtag'].includes(routeName),
        },
        {
            title: t('connections'),
            href: `/user/${auth.user?.username}/following`,
            icon: Users,
            isActive: ['follow.following', 'follow.followers'].includes(routeName),
        },
        {
            name: 'notifications',
            title: t('notifications'),
            href: `/notifications`,
            icon: Bell,
        },
        ...(auth.user?.can_moderate
            ? [
                  {
                      title: t('management'),
                      href: '/admin',
                      icon: UserCog,
                      isActive: ['admin.site.edit', 'admin.user.show', 'admin.user.edit'].includes(routeName),
                  },
              ]
            : []),
    ];

    const navGuest = [
        {
            title: t('login'),
            href: '/login',
            icon: LogIn,
        },
        {
            title: t('register'),
            href: `/register`,
            icon: UserPlus,
        },
    ];

    const mainNavItems: NavItem[] = auth.user ? navAuth : navGuest;

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/home" prefetch>
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
