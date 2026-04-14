<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Indica que se deben ejecutar los seeders después de cada migración.
    protected $seed = true;
}
