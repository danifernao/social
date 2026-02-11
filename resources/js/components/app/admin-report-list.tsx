import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Report } from '@/types/modules/report';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminReportNote from './admin-report-note';
import AdminTablePagination from './admin-table-pagination';

interface AdminReportListProps {
    status: 'open' | 'closed'; // Estado de los reportes.
    reports: Report[]; // Listado de reportes.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Listado administrativo de reportes.
 */
export default function AdminReportList({ status, reports, previous, next }: AdminReportListProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Mapa de etiquetas traducidas para los tipos de reportes.
    const typeLabels: Record<string, string> = {
        post: t('single_post'),
        comment: t('single_comment'),
        user: t('user'),
    };

    // Obtiene el enlace del contenido reportado según tipo.
    const getReportableLink = (report: Report) => {
        switch (report.reportable_type) {
            case 'user':
                return route('profile.show', report.reportable_id);
            case 'post':
                return route('post.show', report.reportable_id);
            case 'comment':
                return route('comment.show', report.reportable_id);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_th]:px-4">
                            {/* ID */}
                            <TableHead>ID</TableHead>

                            {/* Tipo */}
                            <TableHead>{t('content_type')}</TableHead>

                            {/* Reportado por */}
                            <TableHead>{t('reported_by')}</TableHead>

                            {/* Motivo del reporte */}
                            <TableHead className="text-center">{t('report_reason')}</TableHead>

                            {/* Fecha de creaación */}
                            <TableHead className="text-center">{t('created_at')}</TableHead>

                            {status === 'closed' && (
                                <>
                                    {/* Cerrado por */}
                                    <TableHead>{t('closed_by')}</TableHead>

                                    {/* Nota de resolución */}
                                    <TableHead className="text-center">{t('report_resolution')}</TableHead>

                                    {/* Fecha de cierre */}
                                    <TableHead className="text-center">{t('closed_at')}</TableHead>
                                </>
                            )}

                            {/* Acciones */}
                            <TableHead className="w-0 text-center">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <TableRow key={report.id} className="[&_td]:px-4">
                                    {/* ID del reporte */}
                                    <TableCell className="font-mono">#{report.id}</TableCell>

                                    {/* Tipo del contenido reportado */}
                                    <TableCell>
                                        {report.reportable_exists ? (
                                            <Link href={getReportableLink(report)} className="hover:underline">
                                                {typeLabels[report.reportable_type]}
                                            </Link>
                                        ) : (
                                            typeLabels[report.reportable_type]
                                        )}
                                    </TableCell>

                                    {/* Cerrado por */}
                                    <TableCell>
                                        {report.reporter ? (
                                            <Link href={route('profile.show', report.reporter.id)} className="hover:underline">
                                                {report.reporter.username}
                                            </Link>
                                        ) : (
                                            t('deleted_user_no', { id: report.reporter_id })
                                        )}
                                    </TableCell>

                                    {/* Motivo del reporte */}
                                    <TableCell className="text-center">
                                        <AdminReportNote report={report} userType="reporter" />
                                    </TableCell>

                                    {/* Fecha de creación */}
                                    <TableCell className="text-center">{formatDate(report.created_at)}</TableCell>

                                    {status === 'closed' && (
                                        <>
                                            {/* Cerrado por */}
                                            <TableCell>
                                                {report.resolver ? (
                                                    <Link href={route('profile.show', report.resolver.id)} className="hover:underline">
                                                        {report.resolver.username}
                                                    </Link>
                                                ) : (
                                                    t('deleted_user_no', { id: report.resolver_id })
                                                )}
                                            </TableCell>

                                            {/* Nota de resolución */}
                                            <TableCell className="text-center">
                                                <AdminReportNote report={report} userType="resolver" />
                                            </TableCell>

                                            {/* Fecha de cierre */}
                                            <TableHead className="text-center">{formatDate(report.closed_at)}</TableHead>
                                        </>
                                    )}

                                    {/* Acciones */}
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm">
                                            <Link href={route('admin.report.show', report.id) + window.location.search}>{t('view')}</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-muted-foreground py-6 text-center">
                                    {t('no_reports_found')}
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
