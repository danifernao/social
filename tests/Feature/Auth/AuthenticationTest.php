<?php

use App\Models\User;

// Comprueba que la página de inicio de sesión cargue correctamente.
test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

// Comprueba que los usuarios pueden autenticarse usando la página
// de inicio de sesión.
test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home.index', absolute: false));
});

// Comprueba que los usuarios no pueden autenticarse con una
// contraseña incorrecta.
test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

// Comprueba que los usuarios pueden cerrar sesión.
test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});