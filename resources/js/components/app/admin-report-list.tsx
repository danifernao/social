import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Report } from '@/types/modules/report';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminReportNote from './admin-report-note';

interface AdminReportListProps {
    status: 'open' | 'closed';
    reports: Report[];
}

/**
 * Listado administrativo de reportes.
 */
export default function AdminReportList({ status, reports }: AdminReportListProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Mapa de etiquetas traducidas para los tipos de reportes.
    const typeLabels: Record<string, string> = {
        post: t('single_post'),
        comment: t('single_comment'),
        user: t('user'),
    };

    return (
        <div className="w-full rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="[&_th]:px-4">
                        {/* ID */}
                        <TableHead>ID</TableHead>

                        {/* Tipo */}
                        <TableHead>{t('type')}</TableHead>

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
                                <TableCell>{typeLabels[report.reportable_type] ?? report.reportable_type}</TableCell>

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
                                                t('deleted_user_no', { id: report.closed_by_id })
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
                                        <Link href={route('admin.report.show', report.id)}>{t('view')}</Link>
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
    );
}
