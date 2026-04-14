<?php

// Comprueba que la página de registro cargue correctamente.
test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

// Comprueba que los nuevos usuarios puedan registrarse.
test('new users can register', function () {
    $response = $this->post('/register', [
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    
    $this->assertAuthenticated();
    $response->assertRedirect(route('home.index', absolute: false));
});