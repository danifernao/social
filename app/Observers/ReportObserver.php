<?php

namespace App\Observers;

use App\Events\PendingReportsCountUpdated;
use App\Models\Report;

/**
 * Observa eventos del modelo Report para reaccionar
 * a cambios relevantes en su estado.
 */
class ReportObserver
{
    /**
     * Método que se ejecuta cuando se crea un nuevo reporte.
     */
    public function created(Report $report): void
    {
        // Emite un evento para informar que el conteo de reportes
        // pendientes ha cambiado.
        event(new PendingReportsCountUpdated(
            Report::pending()->count()
        ));
    }

    /**
     * Método que se ejecuta cuando se actualiza un reporte.
     */
    public function updated(Report $report): void
    {
        // Emite un evento para informar que el conteo de reportes
        // pendientes ha cambiado.
        event(new PendingReportsCountUpdated(
            Report::pending()->count()
        ));
    }
}