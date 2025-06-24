import { ReactNode } from 'react';

interface ContentInnerProps {
    fullWidth?: boolean;
    noMargin?: boolean;
    children: ReactNode;
}

export function AppContentLayout({ children, fullWidth, noMargin }: ContentInnerProps) {
    const maxWidth = fullWidth ? '' : 'mx-auto max-w-[40rem]';
    const margin = noMargin ? '' : 'mt-8 mb-8 p-4';

    return <div className={`${margin} flex h-full w-full ${maxWidth} flex-1 flex-col gap-8 rounded-xl`}>{children}</div>;
}
