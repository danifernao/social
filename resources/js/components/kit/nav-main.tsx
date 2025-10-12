import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import NotificationBadge from '../app/notification-badge';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { t } = useTranslation();

    const page = usePage();
    const pathname = page.url.split(/[?#]/)[0];

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{t('common.menu')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.href === pathname || item.isActive} tooltip={{ children: item.title }}>
                            <Link href={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.name === 'notifications' && <NotificationBadge />}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
