import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

/**
 * Muestra una ayuda contextual con las reglas básicas y ejemplos para
 * formatear texto utilizando Markdown en las publicaciones y comentarios.
 */
export function MarkdownHelp() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" className="text-muted-foreground p-0 text-sm">
                    {t('text.markdownHelp')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] text-sm">
                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="pr-4 pb-2 text-left font-medium">{t('text.description')}</th>
                            <th className="pb-2 text-left font-medium">{t('text.example')}</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        <tr>
                            <td>{t('text.bold')}</td>
                            <td>
                                <code>{t('text.mdBold')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.italic')}</td>
                            <td>
                                <code>{t('text.mdItalic')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.link')}</td>
                            <td>
                                <code>{t('text.mdLink')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.quote')}</td>
                            <td>
                                <code>{t('text.mdQuote')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.inlineCode')}</td>
                            <td>
                                <code>{t('text.mdInlineCode')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.codeBlock')}</td>
                            <td>
                                <code>{t('text.mdCodeBlock')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.orderedList')}</td>
                            <td>
                                <code>{t('text.mdOrderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.unorderedList')}</td>
                            <td>
                                <code>{t('text.mdUnorderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.image')}</td>
                            <td>
                                <code>{t('text.mdImage')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('text.youtube')}</td>
                            <td>
                                <code>{t('text.mdYoutube')}</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
