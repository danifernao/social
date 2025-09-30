<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\NewMention;
use App\Utils\MentionParser;
use Illuminate\Database\Eloquent\Model;

class MentionService
{
    /**
     * Sincroniza menciones en un modelo.
     * No envía notificaciones.
     */
    public function sync(Model $model, User $auth_user): void
    {
        $this->processMentions($model, $auth_user, notify: false);
    }

    /**
     * Crea menciones nuevas en un modelo.
     * Envía notificaciones a los usuarios mencionados.
     */
    public function createWithNotifications(Model $model, User $auth_user, string $context): void
    {
        $this->processMentions($model, $auth_user, notify: true, context: $context);
    }

    /**
     * Lógica compartida para manejar menciones.
     */
    private function processMentions(
        Model $model,
        User $auth_user,
        bool $notify,
        ?string $context = null
    ): void {
        // Se extraen menciones desde el contenido del modelo.
        $mentioned_users = MentionParser::extractMentionedUsers($model->content);

        // Se filtran usuarios que no pueden ser mencionados (bloqueos, uno mismo, etc.).
        $mentioned_users = $auth_user->filterMentionables($mentioned_users);

        $new_ids = $mentioned_users->pluck('id')->toArray();
        $old_ids = $model->mentions()->pluck('user_id')->toArray();

        $to_add = array_diff($new_ids, $old_ids);
        $to_remove = array_diff($old_ids, $new_ids);

        // Guarda nuevas menciones.
        foreach ($to_add as $user_id) {
            $model->mentions()->create(['user_id' => $user_id]);

            // Envía notificaciones.
            if ($notify && $context) {
                $user = $mentioned_users->firstWhere('id', $user_id);
                $user->notify(new NewMention($auth_user, $context, $model->id));
            }
        }

        // Elimina menciones huérfanas.
        if (!empty($to_remove)) {
            $model->mentions()->whereIn('user_id', $to_remove)->delete();
        }
    }
}