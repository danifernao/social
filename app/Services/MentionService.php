<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\NewMention;
use App\Utils\MentionParser;
use Illuminate\Database\Eloquent\Model;

/**
 * Gestiona la creación, actualización y notificación de menciones en contenido.
 */
class MentionService
{
    /**
     * Actualiza las menciones de un modelo sin enviar notificaciones.
     * 
     * @param Model $model     Modelo que contiene el contenido con menciones.
     * @param User  $auth_user Usuario que realiza la acción.
     */
    public function sync(Model $model, User $auth_user): void
    {
        $this->processMentions($model, $auth_user, notify: false);
    }

    /**
     * Registra nuevas menciones y notifica a los usuarios mencionados.
     * 
     * @param Model  $model     Modelo que contiene el contenido con menciones.
     * @param User   $auth_user Usuario que realiza la acción.
     * @param string $context   Tipo de contenido: "post" o "comment".
     */
    public function createWithNotifications(
        Model $model,
        User $auth_user,
        string $context
    ): void {
        $this->processMentions(
            $model,
            $auth_user,
            notify: true,
            context: $context
        );
    }

    /**
     * Maneja la lógica común para registrar y eliminar menciones.
     * 
     * @param Model       $model     Modelo que contiene el contenido
     *                               con menciones.
     * @param User        $auth_user Usuario que realiza la acción.
     * @param bool        $notify    Indica si se deben enviar notificaciones.
     * @param string|null $context   Tipo de contenido: "post" o "comment".
     */
    private function processMentions(
        Model $model,
        User $auth_user,
        bool $notify,
        ?string $context = null
    ): void {
        // Extrae usuarios mencionados desde el contenido del modelo.
        $mentioned_users = MentionParser::extractMentionedUsers($model->content);

        // Filtra usuarios no mencionables (bloqueos y usuario autenticado).
        $mentioned_users = $auth_user->filterMentionables($mentioned_users);

        // IDs de usuarios mencionados actualmente en el contenido.
        $new_ids = $mentioned_users->pluck('id')->toArray();

        // IDs de usuarios previamente registrados como menciones.
        $old_ids = $model->mentions()->pluck('user_id')->toArray();

        // Menciones nuevas que deben registrarse.
        $to_add = array_diff($new_ids, $old_ids);

        // Menciones que ya no existen en el contenido y deben eliminarse.
        $to_remove = array_diff($old_ids, $new_ids);

        // Registra nuevas menciones en el modelo.
        foreach ($to_add as $user_id) {
            $model->mentions()->create(['user_id' => $user_id]);

            // Envía notificación al usuario mencionado, si corresponde.
            if ($notify && $context) {
                $user = $mentioned_users->firstWhere('id', $user_id);
                $user->notify(new NewMention($auth_user, $context, $model->id));
            }
        }

        // Elimina menciones que ya no existen en el contenido.
        if (!empty($to_remove)) {
            $model->mentions()->whereIn('user_id', $to_remove)->delete();
        }
    }
}