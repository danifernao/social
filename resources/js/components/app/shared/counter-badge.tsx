/**
 * Muestra un badge visual con un contador.
 */
export default function CounterBadge({ count }: { count: number }) {
    // Si el contador es cero o negativo, no se renderiza nada.
    if (count <= 0) {
        return null;
    }

    return (
        <div className="bg-destructive text-destructive-foreground ml-auto rounded-sm p-px px-1 text-xs font-bold">{count > 99 ? '99+' : count}</div>
    );
}
