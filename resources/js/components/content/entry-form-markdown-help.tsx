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
                        <tr>
                            <td>{t('bold')}</td>
                            <td>
                                <code>{t('mdBold')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('italic')}</td>
                            <td>
                                <code>{t('mdItalic')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('link')}</td>
                            <td>
                                <code>{t('mdLink')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('quote')}</td>
                            <td>
                                <code>{t('mdQuote')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('inlineCode')}</td>
                            <td>
                                <code>{t('mdInlineCode')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('codeBlock')}</td>
                            <td>
                                <code>{t('mdCodeBlock')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('orderedList')}</td>
                            <td>
                                <code>{t('mdOrderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('unorderedList')}</td>
                            <td>
                                <code>{t('mdUnorderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('image')}</td>
                            <td>
                                <code>{t('mdImage')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('youtubeVideo')}</td>
                            <td>
                                <code>{t('mdYoutube')}</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
