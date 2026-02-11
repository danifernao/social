import { Auth } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import CounterBadge from './counter-badge';

/**
 * Badge con la cantidad de reportes pendientes.
 */
export default function AdminReportBadge() {
    // Captura el usuario autenticado y el contador inicial de reportes pendientes.
    const { auth, pendingReportsCount } = usePage<{
        auth: Auth;
        pendingReportsCount: number;
    }>().props;

    // Estado local que almacena la cantidad actual de reportes pendientes.
    const [pendingCount, setPendingCount] = useState<number>(pendingReportsCount);

    // Si no existe un usuario autenticado o el usuario
    // no tiene permisos de moderación, no se muestra el badge.
    if (!auth.user || !auth.user.can_moderate) {
        return null;
    }

    // Se suscribe al canal privado de reportes.
    // Escucha el evento que informa cambios en el número de reportes pendientes
    // y actualiza el estado local en tiempo real.
    useEcho('reports', ['.PendingReportsCountUpdated'], (event: { pending_count: number }) => {
        setPendingCount(event.pending_count);
    });

    // Si no hay reportes pendientes, no se muestra el badge.
    if (pendingCount <= 0) {
        return null;
    }

    return <CounterBadge count={pendingCount} />;
}
