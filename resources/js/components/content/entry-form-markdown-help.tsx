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
                            <th className="pr-4 pb-2 text-left font-medium">{t('markdownTable.left.header')}</th>
                            <th className="pb-2 text-left font-medium">{t('markdownTable.right.header')}</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        <tr>
                            <td>{t('markdownTable.left.bold')}</td>
                            <td>
                                <code>{t('markdownTable.right.bold')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.italic')}</td>
                            <td>
                                <code>{t('markdownTable.right.italic')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.link')}</td>
                            <td>
                                <code>{t('markdownTable.right.link')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.quote')}</td>
                            <td>
                                <code>{t('markdownTable.right.quote')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.inlineCode')}</td>
                            <td>
                                <code>{t('markdownTable.right.inlineCode')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.codeBlock')}</td>
                            <td>
                                <code>{t('markdownTable.right.codeBlock')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.orderedList')}</td>
                            <td>
                                <code>{t('markdownTable.right.orderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.unorderedList')}</td>
                            <td>
                                <code>{t('markdownTable.right.unorderedList')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.image')}</td>
                            <td>
                                <code>{t('markdownTable.right.image')}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('markdownTable.left.youtube')}</td>
                            <td>
                                <code>{t('markdownTable.right.youtube')}</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
