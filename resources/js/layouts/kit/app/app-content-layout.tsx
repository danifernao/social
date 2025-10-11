import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContentInnerProps {
    fullWidth?: boolean;
    noMargin?: boolean;
    children: ReactNode;
}

export function AppContentLayout({ children, fullWidth, noMargin }: ContentInnerProps) {
    return (
        <div
            className={cn('flex h-full w-full flex-1 flex-col gap-8 rounded-xl', !fullWidth && 'mx-auto max-w-[43rem]', !noMargin && 'mt-8 mb-8 p-4')}
        >
            {children}
        </div>
    );
}
