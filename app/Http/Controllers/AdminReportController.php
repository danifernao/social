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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

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
        $this->authorize('moderate');

        // Determina si se desean mostrar los reportes
        // abiertos o cerrados.
        $status = strtolower($request->query('status', 'open'));

        // Consulta base de reportes.
        $query = Report::query()
            ->with(['reporter', 'resolver', 'reportable'])
            ->orderByDesc('created_at');

        // Filtra por quien hizo el reporte.
        if ($request->filled('reporter')) {
            $reporter = $request->query('reporter');

            // Si es numérico, se filtra directamente por ID.
            if (is_numeric($reporter)) {
                $query->where('reporter_id', $reporter);
            } else {
                // Si es texto, se busca el usuario por username.
                $user_id = User::where('username', $reporter)->value('id');

                // Si no existe el usuario, la consulta no retorna resultados.
                $user_id
                    ? $query->where('reporter_id', $user_id)
                    : $query->whereRaw('1 = 0');
            }
        } 

        // Filtra por quien cerró el reporte.
        elseif ($request->filled('resolver')) {
            $resolver = $request->query('resolver');

            // Fuerza el estado a "closed".
            $status = 'closed';

            if (is_numeric($resolver)) {
                $query->where('resolver_id', $resolver);
            } else {
                $userId = User::where('username', $resolver)->value('id');

                $userId
                    ? $query->where('resolver_id', $userId)
                    : $query->whereRaw('1 = 0');
            }
        }
        
        // Indica si ya se aplicó un filtro sobre la entidad reportada.
        // Los parámetros "user_reported", "post_reported" y "comment_reported"
        // son excluyentes y solo uno debe afectar la consulta.
        $filtered = false;

        // Filtra por usuario reportado.
        if ($request->filled('user_reported')) {
            $value = $request->query('user_reported');

            $filtered = true;

            if (is_numeric($value)) {
                // Filtra por ID de usuario.
                $query->where(function ($query) use ($value) {
                    // Caso: el usuario en sí fue reportado.
                    $query->where(function ($q) use ($value) {
                        $q->where('reportable_type', User::class)
                          ->where('reportable_snapshot->id', $value);
                    })
                    // Caso: se reportó contenido cuyo autor es el usuario.
                    ->orWhere(function ($q) use ($value) {
                        $q->whereIn('reportable_type', [Post::class, Comment::class])
                          ->where('reportable_snapshot->user_id', $value);
                    });
                });
            } else {
                // Filtra por nombre de usuario.
                $query->where(function ($query) use ($value) {
                    // Caso: el usuario en sí fue reportado.
                    $query->where(function ($q) use ($value) {
                        $q->where('reportable_type', User::class)
                          ->where('reportable_snapshot->username', $value);
                    })
                    // Caso: se reportó contenido cuyo autor es el usuario.
                    ->orWhere(function ($q) use ($value) {
                        $q->whereIn('reportable_type', [Post::class, Comment::class])
                          ->where('reportable_snapshot->user->username', $value);
                    });
                });
            }
        }

        // Filtra por publicación reportada.
        if ($request->filled('post_reported') && !$filtered) {
            $filtered = true;
            $query->where('reportable_type', Post::class)
                  ->where('reportable_id', $request->query('post_reported'));
        }

        // Filtra por comentario reportado.
        if ($request->filled('comment_reported') && !$filtered) {
            $query->where('reportable_type', Comment::class)
                  ->where('reportable_id', $request->query('comment_reported'));
        }
        
        // Filtra los reportes según su estado (abiertos o cerrados).
        if ($status === 'closed') {
            $query->whereNotNull('closed_at');
        } else {
            $query->whereNull('closed_at');
        }

        // Ejecuta la paginación por cursor.
        $reports = $query->cursorPaginate(1)->withQueryString();

        // Si la colección actual está vacía pero hay un cursor en la URL,
        // redirige a la primera página de la lista de reportes.
        if ($reports->isEmpty() && $request->has('cursor')) {
            return redirect()->route('admin.report.index');
        }

        return Inertia::render('admin/reports/index', [
            'reports' => ReportResource::collection($reports),
        ]);
    }

    /**
     * Crea un nuevo reporte sobre un contenido específico.
     * 
     * @param Request $request Datos de la petición HTTP.
     */
    public function store(Request $request)
    {
        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Valida los datos enviados en la petición.
        $data = $request->validate([
            'reportable_type' => ['required', 'string', 'in:post,comment,user'],
            'reportable_id'   => ['required', 'integer'],
            'reporter_note'   => ['nullable', 'string', 'max:1000'],
        ]);

        // Instancia del modelo que será reportado.
        $reportable = null;

        // Copia inmutable del contenido reportado en su estado actual.
        $snapshot = null;

        // Determina qué tipo de contenido se está intentando reportar
        // y obtiene el modelo correspondiente.
        switch ($data['reportable_type']) {
            case 'post':
                $reportable = Post::with('user')
                    ->find($data['reportable_id']);
                break;
            case 'comment':
                $reportable = Comment::with('user')
                    ->find($data['reportable_id']);
                break;
            case 'user':
                $reportable = User::find($data['reportable_id']);
                break;
        }

        // Si el contenido a reportar no existe, se aborta la operación.
        if (!$reportable) {
            abort(404);
        }

        // Verifica si el usuario está intentando reportarse a sí mismo.
        // En dicho caso, aborta la operación.
        $is_self_report = match($data['reportable_type']) {
            'post', 'comment' => $reportable->user_id === $auth_user->id,
            'user'            => $reportable->id === $auth_user->id,
        };

        if ($is_self_report) {
            throw ValidationException::withMessages([
                'message' => __("You can't report yourself."),
            ]);
        }

        // Verifica si el usuario ya tiene un reporte abierto
        // sobre el mismo contenido.
        $existing_report = Report::where('reporter_id', $auth_user->id)
            ->where('reportable_type', get_class($reportable))
            ->where('reportable_id', $reportable->id)
            ->whereNull('closed_at')
            ->exists();

        // Si el usuario no tiene un reporte abierto, crea uno.
        if (!$existing_report) {
            // Genera una copia del contenido reportado para preservar
            // su estado original, incluso si este se modifica o elimina.
            $snapshot = $reportable->toArray();

            // Crea el reporte almacenando la referencia al contenido
            // y su copia inmutable para revisión posterior.
            Report::create([
                'reporter_id'          => $auth_user->id,
                'reportable_type'      => get_class($reportable),
                'reportable_id'        => $reportable->id,
                'reportable_snapshot'  => $snapshot,
                'reporter_note'        => $data['reporter_note'] ?? null,
            ]);
        }
        
        return back()->with('status', 'report_sent');
    }


    /**
     * Muestra un reporte específico.
     * 
     * @param Request $request  Datos de la petición HTTP.
     * @param Report  $report   Instancia del reporte.
     */
    public function show(Request $request, Report $report)
    {
        // Deniega el acceso si el usuario autenticado
        // no tiene permisos de moderación.
        $this->authorize('moderate');

        // Carga relaciones necesarias: quien reportó, quien resolvió
        // y el contenido reportado.
        $report->load(['reporter', 'resolver', 'reportable']);

        // Inicializa colección vacía para reportes relacionados.
        $related_reports = collect();

        // Si el reporte aún está abierto, obtiene reportes abiertos similares.
        if ($report->closed_at === null) {
          $related_reports = Report::query()
              ->where('reportable_type', $report->reportable_type)
              ->where('reportable_id', $report->reportable_id)
              ->whereNull('closed_at')
              ->where('id', '!=', $report->id)
              ->with(['reporter', 'resolver', 'reportable'])
              ->orderByDesc('created_at')
              ->get(); 
        }

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
        $this->authorize('moderate');

        // Obtiene el usuario autenticado.
        $auth_user = $request->user();

        // Valida los datos enviados en la petición.
        $data = $request->validate([
            'resolver_note' => ['required', 'string', 'max:1000'],
        ]);

        // Si el reporte ya está cerrado, se bloquea la operación.
        if ($report->closed_at !== null) {
            throw ValidationException::withMessages([
                'message' => __('This report has already been closed.'),
            ]);
        }

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
                    'resolver_id' => $auth_user->id,
                    'resolver_note'=> $data['resolver_note'],
                    'updated_at'   => $now,
                ]);
        } else {
            // Cierra únicamente el reporte actual.
            $report->update([
                'closed_at'    => $now,
                'resolver_id' => $auth_user->id,
                'resolver_note'=> $data['resolver_note'],
            ]);
        }

        return back()->with('status', 'report_closed');
    }
}