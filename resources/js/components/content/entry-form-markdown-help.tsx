import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trans, useTranslation } from 'react-i18next';

/**
 * Muestra una ayuda contextual con las reglas básicas y ejemplos para
 * formatear texto utilizando Markdown en las publicaciones y comentarios.
 */
export function MarkdownHelp() {
    // Obtiene las traducciones para el componente.
    const { t } = useTranslation('components/entry');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" className="text-muted-foreground p-0 text-sm">
                    {t('markdown.help')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] text-sm">
                <p className="mb-4">
                    <Trans i18nKey="markdown.introduction" components={[<strong />]} ns="components/entry" />
                </p>
                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="pr-4 pb-2 text-left font-medium">{t('markdown.description.heading')}</th>
                            <th className="pb-2 text-left font-medium">{t('markdown.example.heading')}</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        <tr>
                            <td>{t('markdown.description.bold')}</td>
                            <td>
                                <code>{t('markdown.example.bold')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.italic')}</td>
                            <td>
                                <code>{t('markdown.example.italic')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.link')}</td>
                            <td>
                                <code>{t('markdown.example.link')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.quote')}</td>
                            <td>
                                <code>{t('markdown.example.quote')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.inlineCode')}</td>
                            <td>
                                <code>{t('markdown.example.inlineCode')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.codeBlock')}</td>
                            <td>
                                <code>{t('markdown.example.codeBlock')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.orderedList')}</td>
                            <td>
                                <code>{t('markdown.example.orderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.unorderedList')}</td>
                            <td>
                                <code>{t('markdown.example.unorderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.image')}</td>
                            <td>
                                <code>{t('markdown.example.image')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdown.description.youtube')}</td>
                            <td>
                                <code>{t('markdown.example.youtube')}</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
