<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Indica que se deben ejecutar los seeders después de cada migración.
    protected $seed = true;

    // Desactiva Vite durante los tests para evitar errores de recursos
    // no encontrados.
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }
}