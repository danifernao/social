import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Page } from '@/types/modules/page';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';

interface Props {
    pages: Page[]; // Lista de páginas informativas.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Lista todas las páginas informativas.
 */
export default function AdminPageTable({ pages, previous, next }: Props) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Gestiona la eliminación de una página informativa.
    const handleDelete = (id: number) => {
        router.delete(route('admin.page.destroy', id));
    };

    return (
        <div className="w-full space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            <TableHead>{t('title')}</TableHead>
                            <TableHead>{t('type')}</TableHead>
                            <TableHead className="w-0 text-center">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.length > 0 ? (
                            pages.map((page) => (
                                <TableRow key={page.id} className="[&_td]:px-4">
                                    <TableCell>
                                        <Link href={route('admin.page.edit', { page: page.id, lang: page.language })}>{page.title}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={route('admin.page.edit', { page: page.id, lang: page.language })}>
                                            {t(`pageTypes.${page.type}`)}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="flex gap-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={route('page.show', { lang: page.language, slug: page.slug })}
                                                target="_blank"
                                                title={t('view')}
                                                aria-label={t('view')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>

                                        <Button variant="outline" size="sm" asChild>
                                            <Link
                                                href={route('admin.page.edit', { page: page.id, lang: page.language })}
                                                title={t('edit')}
                                                aria-label={t('edit')}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" title={t('delete')} aria-label={t('delete')}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('deletePage')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('deletePageConfirmation', {
                                                            title: page.title,
                                                        })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(page.id)}>{t('delete')}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-4 text-center">
                                    {t('noPages')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex justify-end gap-2">
                {previous ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={previous}>{t('previous')}</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        {t('previous')}
                    </Button>
                )}

                {next ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={next}>{t('next')}</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        {t('next')}
                    </Button>
                )}
            </div>
        </div>
    );
}
