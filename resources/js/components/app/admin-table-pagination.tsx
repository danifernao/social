import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface Props {
    previous: string | null; // URL de la página anterior.
    next: string | null; // URL de la página siguiente.
}

/**
 * Controles de paginación de una tabla.
 */
export default function AdminTablePagination({ previous, next }: Props) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    return (
        <div className="flex justify-end gap-2">
            {/* Botón para ir a la página anterior */}
            {previous ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={previous}>{t('common.previous')}</Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    {t('common.previous')}
                </Button>
            )}

            {/* Botón para ir a la página siguiente */}
            {next ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={next}>{t('common.next')}</Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    {t('common.next')}
                </Button>
            )}
        </div>
    );
}
