import { History } from '@/types/modules/entry/history';
import EmptyMessage from '../shared/empty-message';
import HistoryItem from './item';

interface HistoryListProps {
    histories: History[];
}

/**
 * Historial de cambios en el contenido de una entrada.
 */
export default function HistoryList({ histories }: HistoryListProps) {
    return (
        <div className="flex flex-1 flex-col gap-8">
            {histories.length > 0 ? (
                histories.map((history, i) => <HistoryItem key={history.id} first={i === 0} history={history} />)
            ) : (
                <EmptyMessage />
            )}
        </div>
    );
}
