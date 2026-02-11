/**
 * Muestra un badge visual con un contador.
 */
export default function CounterBadge({ count }: { count: number }) {
    // Si el contador es cero o negativo, no se renderiza nada.
    if (count <= 0) {
        return null;
    }

    return <div className="ml-auto rounded-sm bg-red-600 p-px px-1 text-xs font-bold text-white">{count > 99 ? '99+' : count}</div>;
}
