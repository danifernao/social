<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\ReportResource;
use App\Http\Resources\UserResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminReportController extends Controller
{
    /**
     * Muestra la lista paginada de reportes.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function index(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de moderación.
        if (!$request->user()->canModerate()) {
            abort(403);
        }

        // Determina si se desean mostrar los reportes
        // abiertos o cerrados.
        $status = strtolower($request->query('status', 'open'));

        // Consulta base de reportes.
        $query = Report::query()
            ->with(['reporter', 'resolver', 'reportable'])
            ->orderByDesc('created_at');
        
        // Filtra los reportes según su estado (abiertos o cerrados).
        if ($status === 'closed') {
            $query->whereNotNull('closed_at');
        } else {
            $query->whereNull('closed_at');
        }

        $reports = $query->cursorPaginate(15);

        return inertia('admin/reports/index', [
            'reports' => ReportResource::collection($reports),
        ]);
    }

    /**
     * Crea un nuevo reporte.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de moderación.
        if (!$request->user()->canModerate()) {
            abort(403);
        }

        // Valida la información recibida.
        $data = $request->validate([
            'reportable_type' => ['required', 'string', 'in:post,comment,user'],
            'reportable_id'   => ['required', 'integer'],
            'reporter_note'   => ['nullable', 'string', 'max:1000'],
        ]);

        // Modelo reportado.
        $reportable = null;

        // Copia inmutable del contenido reportado.
        $snapshot = null;

        // Se determina qué modelo se está intentando reportar
        // y se valida que exista en la base de datos.
        switch ($data['reportable_type']) {
            case 'post':
                $reportable = Post::find($data['reportable_id']);
                if ($reportable) {
                    $snapshot = (new PostResource($reportable))->resolve();
                }
                break;

            case 'comment':
                $reportable = Comment::find($data['reportable_id']);
                if ($reportable) {
                    $snapshot = (new CommentResource($reportable))->resolve();
                }
                break;

            case 'user':
                $reportable = User::find($data['reportable_id']);
                if ($reportable) {
                    $snapshot = (new UserResource($reportable))->resolve();
                }
                break;
        }

        // Si el contenido reportado no existe, se devuelve un 404.
        if (!$reportable) {
            abort(404);
        }

        // Se crea el reporte almacenando una copia inmutable
        // del contenido reportado.
        Report::create([
            'reporter_id'          => $request->user()->id,
            'reportable_type'      => get_class($reportable),
            'reportable_id'        => $reportable->id,
            'reportable_snapshot'  => $snapshot,
            'reporter_note'        => $data['reporter_note'] ?? null,
        ]);

        return redirect()
            ->route('admin.report.index')
            ->with('message', __('Report successfully created.'));
    }


    /**
     * Muestra un reporte específico.
     * 
     * @param Report $report Instancia del reporte.
     */
    public function show(Report $report)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de moderación.
        if (!$request->user()->canModerate()) {
            abort(403);
        }

        // Carga los datos del usuario que hizo el reporte, del
        // moderador y del contenido reportado.
        $report->load(['reporter', 'resolver', 'reportable']);

        // Si el reporte está cerrado, no se agrupa
        if ($report->closed_at !== null) {
            return Inertia::render('admin/reports/show', [
                'report' => new ReportResource($report),
                'related' => ReportResource::collection($related_reports),
            ]);
        }

        // Obtiene los reportes abiertos similares.
        $related_reports = Report::query()
            ->where('reportable_type', $report->reportable_type)
            ->where('reportable_id', $report->reportable_id)
            ->whereNull('closed_at')
            ->where('id', '!=', $report->id)
            ->with(['reporter', 'resolver', 'reportable'])
            ->orderByDesc('created_at')
            ->get();

        // Transforma el reporte utilizando ReportResource para el frontend.
        $report_data = (new ReportResource($report))->resolve();

        return Inertia::render('admin/reports/show', [
            'report' => $report_data,
            'related' => ReportResource::collection($related_reports),
        ]);
    }

    /**
     * Cierra un reporte y, si existen, cierra también los reportes
     * asociados al mismo contenido reportado.
     * 
     * @param Request $request Datos de la petición HTTP.
     * @param Report  $report  Instancia del reporte.
     */
    public function update(Request $request, Report $report)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de moderación.
        if (!$request->user()->canModerate()) {
            abort(403);
        }

        // Si el reporte ya está cerrado, se bloquea la operación.
        if ($report->closed_at !== null) {
            abort(403);
        }

        // Obtiene la nota opcional del moderador.
        $resolver_note = $request->input('resolver_note');

        // Obtiene la fecha y hora actual.
        $now = Carbon::now();

        // Determina si se deben cerrar todos los reportes
        // asociados al mismo contenido.
        $close_all = $request->boolean('all', false);

        if ($close_all) {
            // Cierra todos los reportes abiertos asociados
            // al mismo contenido reportado.
            Report::where('reportable_type', $report->reportable_type)
                ->where('reportable_id', $report->reportable_id)
                ->whereNull('closed_at')
                ->update([
                    'closed_at'    => $now,
                    'closed_by_id' => $request->user()->id,
                    'resolver_note'=> $resolver_note,
                    'updated_at'   => $now,
                ]);
        } else {
            // Cierra únicamente el reporte actual.
            $report->update([
                'closed_at'    => $now,
                'closed_by_id' => $request->user()->id,
                'resolver_note'=> $resolver_note,
            ]);
        }

        return redirect()
            ->route('admin.report.index')
            ->with('message', __('Report successfully updated.'));
    }
}