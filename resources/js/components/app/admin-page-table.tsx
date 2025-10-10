import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Page } from '@/types/modules/page';
import { Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
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

    // Convierte una fecha ISO en formato corto y legible.
    const formatDate = (date: string) => {
        return format(parseISO(date), 'dd/MM/yyyy h:mm a');
    };

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
                            <TableHead>{t('createdAt')}</TableHead>
                            <TableHead className="w-0"></TableHead>
                            <TableHead className="w-0"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.length > 0 ? (
                            pages.map((page) => (
                                <TableRow key={page.id} className="[&_td]:px-4">
                                    <TableCell>{page.title}</TableCell>
                                    <TableCell>{formatDate(page.created_at)}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('admin.page.edit', page.id)}>{t('edit')}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    {t('delete')}
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
