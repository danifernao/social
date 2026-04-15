<?php

use App\Models\User;

// Comprueba que los usuarios no autenticados sean redirigidos a la página
// de inicio de sesión al intentar acceder a la ruta del feed principal de una
// cuenta de usuario.
test('guests are redirected to the login page', function () {
    $this->get('/home')->assertRedirect('/login');
});

// Comprueba que los usuarios autenticados puedan acceder a su feed principal.
test('authenticated users can visit the home page', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/home')->assertOk();
});