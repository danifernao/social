<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('notifications.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('reports', function ($user) {
    return $user->hasAnyRole(['admin', 'mod']);
});