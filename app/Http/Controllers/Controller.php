<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Controlador base de la aplicación.
 *
 * Todos los controladores de la aplicación extienden de esta clase.
 * Proporciona funcionalidades compartidas a través de traits o métodos
 * comunes.
 *
 * Actualmente incluye:
 * - Trait AuthorizesRequests: permite verificar permisos de usuario
 *   y aplicar políticas de acceso.
 */
abstract class Controller
{
    use AuthorizesRequests;
}