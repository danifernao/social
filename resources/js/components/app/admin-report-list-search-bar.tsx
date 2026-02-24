import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Barra de búsqueda para reportes.
 */
export default function AdminReportListSearchBar() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Obtiene los parámetros de consulta pasado por URL.
    const params = new URLSearchParams(location.search);

    // Tipo de actor según la URL.
    const initialActorType = (() => {
        if (params.has('reporter') && params.has('resolver')) return 'reporter_resolver';
        if (params.has('resolver')) return 'resolver';
        if (params.has('reporter')) return 'reporter';
        return 'resolver';
    })();

    // Valor del actor según la URL.
    const initialActorValue = params.get('reporter') ?? params.get('resolver') ?? '';

    // Tipo de entidad reportada según la URL.
    const initialReportedType = (() => {
        if (params.has('user_reported')) return 'user_reported';
        if (params.has('post_reported')) return 'post_reported';
        if (params.has('comment_reported')) return 'comment_reported';
        return 'user_reported';
    })();

    // Valor de la entidad reportada según la URL.
    const initialReportedValue = params.get('user_reported') ?? params.get('post_reported') ?? params.get('comment_reported') ?? '';

    // Estados del actor.
    const [currentActorType, setCurrentActorType] = useState(initialActorType);
    const [actorValue, setActorValue] = useState(initialActorValue);

    // Estados de la entidad reportada.
    const [currentReportedType, setCurrentReportedType] = useState(initialReportedType);
    const [reportedValue, setReportedValue] = useState(initialReportedValue);

    // Elimina parámetros del actor.
    const clearActorParams = () => {
        params.delete('reporter');
        params.delete('resolver');
    };

    // Elimina parámetros de la entidad reportada.
    const clearReportedParams = () => {
        params.delete('user_reported');
        params.delete('post_reported');
        params.delete('comment_reported');
    };

    // Gestiona la búsqueda del actor.
    const handleActorSearch = () => {
        if (!currentActorType || !actorValue) return;

        clearActorParams();
        clearReportedParams();

        if (currentActorType === 'reporter') {
            params.set('reporter', actorValue);
            params.set('status', params.get('status') ?? 'open');
        }

        if (currentActorType === 'resolver') {
            params.set('resolver', actorValue);
            params.set('status', 'closed');
        }

        if (currentActorType === 'reporter_resolver') {
            params.set('reporter', actorValue);
            params.set('resolver', actorValue);
            params.set('status', 'closed');
        }

        router.visit(`?${params.toString()}`);
    };

    // Gestiona la búsqueda por entidad reportada.
    const handleReportedSearch = () => {
        if (!currentReportedType || !reportedValue) return;

        clearReportedParams();
        params.set(currentReportedType, reportedValue);

        router.visit(`?${params.toString()}`);
    };

    return (
        <div className="flex w-full gap-12">
            {/* Actor del reporte */}
            <form className="flex flex-1 items-center" onSubmit={(e) => e.preventDefault()}>
                <Select value={currentActorType} onValueChange={setCurrentActorType}>
                    <SelectTrigger className="bg-muted w-fit gap-1 rounded-tr-none rounded-br-none border-none">
                        <SelectValue placeholder={t('reporter')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="reporter">{t('reporter')}</SelectItem>
                        <SelectItem value="resolver">{t('resolver')}</SelectItem>
                        <SelectItem value="reporter_resolver">{t('reporter_resolver')}</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    className="flex-1 rounded-tl-none rounded-bl-none"
                    value={actorValue}
                    onChange={(e) => setActorValue(e.target.value)}
                    placeholder={t('id_or_username')}
                    onKeyDown={(e) => e.key === 'Enter' && handleActorSearch()}
                />
            </form>

            {/* Entidad reportada */}
            <form className="flex flex-1 items-center" onSubmit={(e) => e.preventDefault()}>
                <Select value={currentReportedType} onValueChange={setCurrentReportedType}>
                    <SelectTrigger className="bg-muted w-fit gap-1 rounded-tr-none rounded-br-none border-none">
                        <SelectValue placeholder={t('post_reported')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user_reported">{t('user_reported')}</SelectItem>
                        <SelectItem value="post_reported">{t('post_reported')}</SelectItem>
                        <SelectItem value="comment_reported">{t('comment_reported')}</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    value={reportedValue}
                    onChange={(e) => setReportedValue(e.target.value)}
                    className="flex-1 rounded-tl-none rounded-bl-none"
                    placeholder={currentReportedType === 'user_reported' ? t('id_or_username') : t('reported_entry_id')}
                    onKeyDown={(e) => e.key === 'Enter' && handleReportedSearch()}
                />
            </form>
        </div>
    );
}
