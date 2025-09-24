import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

/**
 * Muestra una ayuda contextual con las reglas básicas y ejemplos para
 * formatear texto utilizando Markdown en las publicaciones y comentarios.
 */
export function MarkdownHelp() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" className="text-muted-foreground p-0 text-sm">
                    {t('markdownHelp')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] text-sm">
                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="pr-4 pb-2 text-left font-medium">{t('description')}</th>
                            <th className="pb-2 text-left font-medium">{t('example')}</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        {Object.entries(t('markdownExamples', { returnObjects: true })).map(([description, example]) => (
                            <tr key={description}>
                                <td>{description}</td>
                                <td>
                                    <code>{example}</code>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
