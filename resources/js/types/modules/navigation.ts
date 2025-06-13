import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    name?: string;
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}