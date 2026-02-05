import { Button } from '@/components/ui/button';
import { Comment, Entry, EntryType, Post, User } from '@/types';
import { Report } from '@/types/modules/report';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import AdminReportItemCloseDialog from './admin-report-item-close-dialog';
import FormattedText from './formatted-text';

interface AdminReportItemProps {
    report: Report;
    related: {
        data: Report[];
    };
}

/**
 * Información de un reporte.
 */
export default function AdminReportItem({ report, related }: AdminReportItemProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Controla la visibilidad del diálogo de cerrar reporte.
    const [closeOpen, setCloseOpen] = useState(false);

    // Función para manejar el botón "Atrás".
    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.get(route('admin.report.index'));
        }
    };

    // Obtiene el enlace del contenido reportado según tipo.
    const getReportableLink = () => {
        switch (report.reportable_type) {
            case 'user':
                return route('profile.show', report.reportable_id);
            case 'post':
                return route('post.show', report.reportable_id);
            case 'comment':
                return route('comment.show', report.reportable_id);
        }
    };

    // Obtiene el texto del enlace del contenido reportado según tipo.
    const getReportableText = () => {
        switch (report.reportable_type) {
            case 'user':
                const user_snapshot = report.reportable_snapshot as User;
                return report.reportable_exists ? t('user') : t('deleted_user_no', { id: user_snapshot.id });
            case 'post':
                const post_snapshot = report.reportable_snapshot as Post;
                return report.reportable_exists ? t('single_post') : t('deleted_post_no', { id: post_snapshot.id });
            case 'comment':
                const comment_snapshot = report.reportable_snapshot as Comment;
                return report.reportable_exists ? t('single_comment') : t('deleted_comment_no', { id: comment_snapshot.id });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('report_no', { id: report.id })}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-[auto_1fr] md:gap-y-4">
                        {/* Tipo de contenido reportado */}
                        <div className="text-sm font-semibold">{t('report_content_type')}</div>
                        <div className="text-sm">
                            {report.reportable_exists ? (
                                <Link href={getReportableLink()} className="text-blue-600 hover:underline">
                                    {getReportableText()}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">{getReportableText()}</span>
                            )}
                        </div>

                        {/* Reportado por */}
                        {['post', 'comment'].includes(report.reportable_type) && (
                            <>
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('reported_by')}</div>
                                <div className="text-sm">
                                    {report.reporter ? (
                                        <Link href={route('profile.show', report.reporter.id)} className="text-blue-600 hover:underline">
                                            {report.reporter.username}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">{t('deleted_user_no', { id: report.reporter_id })}</span>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Motivo del reporte */}
                        <div className="mt-2 text-sm font-semibold md:mt-0">{t('report_reason')}</div>
                        <blockquote className="text-muted-foreground text-sm italic">{report.reporter_note || t('report_reason_empty')}</blockquote>

                        {/* Instantánea del contenido reportado */}
                        {['post', 'comment'].includes(report.reportable_type) && (
                            <>
                                {/* Autor del contenido reportado */}
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('report_snapshot_author')}</div>
                                <div className="text-sm text-blue-600 hover:underline">
                                    <Link href={route('profile.show', report.reportable_snapshot.id)}>
                                        {(report.reportable_snapshot as Entry).user.username}
                                    </Link>
                                </div>

                                {/* Contenido reportado */}
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('report_snapshot_content')}</div>
                                <Card>
                                    <CardContent className="text-sm">
                                        <FormattedText
                                            entryType={report.reportable_type as EntryType}
                                            text={(report.reportable_snapshot as Entry).content}
                                            alwaysExpanded
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Reportes relacionados */}
                        {related.data.length > 0 && (
                            <>
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('related_reports')}</div>
                                <ul>
                                    {related.data.map((r) => (
                                        <li key={r.id} className="text-sm">
                                            <Link href={route('admin.report.show', r.id)} className="text-blue-600 hover:underline">
                                                {t('report_no', { id: r.id })}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {/* Información sobre el cierre del reporte */}
                        {report.closed_at && (
                            <>
                                {/* Cerrado por */}
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('closed_by')}</div>
                                <div className="text-sm">
                                    {report.resolver ? (
                                        <Link href={route('profile.show', report.resolver.id)} className="text-blue-600 hover:underline">
                                            {report.resolver.username}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">{t('deleted_user_no', { id: report.closed_by_id })}</span>
                                    )}
                                </div>

                                {/* Decisión tomada sobre el reporte */}
                                <div className="mt-2 text-sm font-semibold md:mt-0">{t('report_resolution')}</div>
                                <div className="text-sm">
                                    <blockquote className="text-muted-foreground text-sm italic">{report.resolver_note}</blockquote>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>

                {/* Acciones */}
                <CardFooter className="flex gap-2">
                    {/* Botón para cerrar reporte */}
                    {!report.closed_at && (
                        <Button variant="destructive" onClick={() => setCloseOpen(true)}>
                            {t('close_report')}
                        </Button>
                    )}

                    {/* Botón para visitar página anterior */}
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={handleBack}>
                        {t('go_back')}
                    </Button>
                </CardFooter>
            </Card>

            {/* Diálogo para cerrar el reporte */}
            <AdminReportItemCloseDialog open={closeOpen} onOpenChange={setCloseOpen} reportId={report.id} />
        </>
    );
}
