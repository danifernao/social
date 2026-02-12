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
import AdminTablePagination from './admin-table-pagination';

interface Props {
    pages: Page[]; // Lista de páginas estáticas.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Listado de las páginas estáticas registradas.
 */
export default function AdminPageList({ pages, previous, next }: Props) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Mapa de etiquetas traducidas para los tipos de páginas estáticas.
    const pageTypeLabels = {
        normal: t('normal_static_page'),
        about: t('about_us'),
        terms: t('terms_and_conditions'),
        policy: t('privacy_policy'),
        guidelines: t('community_guidelines'),
    };

    // Gestiona la eliminación de una página estática.
    const handleDelete = (id: number) => {
        router.delete(route('admin.page.destroy', id), {
            preserveScroll: true,
        });
    };

    return (
        <div className="w-full space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            {/* Título de la página */}
                            <TableHead>{t('title')}</TableHead>

                            {/* Tipo de página */}
                            <TableHead>{t('type')}</TableHead>

                            {/* Acciones */}
                            <TableHead className="w-0 text-center">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pages.length > 0 ? (
                            pages.map((page) => (
                                <TableRow key={page.id} className="[&_td]:px-4">
                                    {/* Título de la página */}
                                    <TableCell>
                                        <Link href={route('admin.page.edit', { page: page.id, lang: page.language })}>{page.title}</Link>
                                    </TableCell>

                                    {/* Tipo de página */}
                                    <TableCell>
                                        <Link href={route('admin.page.edit', { page: page.id, lang: page.language })}>
                                            {pageTypeLabels[page.type]}
                                        </Link>
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell className="flex gap-3">
                                        {/* Botón ver */}
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

                                        {/* Botón editar */}
                                        <Button variant="outline" size="sm" asChild>
                                            <Link
                                                href={route('admin.page.edit', page.id) + window.location.search}
                                                title={t('edit')}
                                                aria-label={t('edit')}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>

                                        {/* Botón eliminar con confirmación */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" title={t('delete')} aria-label={t('delete')}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('delete_page')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('confirm_page_deletion_irreversible', {
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
                                <TableCell colSpan={3} className="py-4 text-center">
                                    {t('no_pages_created_yet')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <AdminTablePagination previous={previous} next={next} />
        </div>
    );
}
