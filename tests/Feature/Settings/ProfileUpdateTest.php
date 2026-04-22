<?php

use App\Models\User;

// Comprueba que la página de configuración del perfil se muestre correctamente.
test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

// Comprueba que la configuración de la información del perfil
// se pueda actualizar correctamente.
test('profile information can be updated', function () {
    $user = User::factory()->withPermissions()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'username' => 'test',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $user->refresh();

    expect($user->username)->toBe('test');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

// Comprueba que el estado de verificación del correo electrónico no cambia
// si la dirección de correo electrónico no se modifica.
test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'username' => 'test',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

// Comprueba que el usuario puede eliminar su cuenta
// proporcionando la contraseña correcta.
test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

// Comprueba que el usuario no puede eliminar su cuenta
// proporcionando una contraseña incorrecta.
test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($user->fresh())->not->toBeNull();
});