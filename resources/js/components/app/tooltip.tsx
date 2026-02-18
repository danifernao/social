import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Componente Tooltip reutilizable que envuelve el Tooltip de shadcn/ui.
 */
export function Tooltip({ content, children }: TooltipProps) {
    return (
        <ShadcnTooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{content}</TooltipContent>
        </ShadcnTooltip>
    );
}
