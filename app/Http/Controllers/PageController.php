<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Muestra una lista paginada de páginas informativas.
     */
    public function index()
    {
        $pages = Page::latest()->cursorPaginate(50);

        return inertia('admin/pages/index', [
            'pages' => $pages,
        ]);
    }
}