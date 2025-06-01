import { ReactNode } from 'react';

interface ContentInnerProps {
    children: ReactNode;
}

export function ContentInner({ children }: ContentInnerProps) {
    return <div className="mx-auto mt-8 mb-8 flex h-full w-full max-w-[40rem] flex-1 flex-col gap-8 rounded-xl p-4">{children}</div>;
}
