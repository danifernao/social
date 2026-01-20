import { canActOnUser } from '@/lib/utils';
import type { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import UserActionsAdmin from './user-actions-admin';
import UserActionsBlock from './user-actions-block';
import UserActionsFollow from './user-actions-follow';

interface UserActionsProps {
    user: User; // Usuario sobre el cual se ejecutarán las acciones.
}

/**
 * Agrupa las acciones disponibles sobre un usuario.
 *
 * Muestra una acción primaria visible (seguir/dejar de seguir)
 * y un menú contextual con acciones secundarias como bloquear
 * o administrar el usuario.
 */
export default function UserActions({ user }: UserActionsProps) {
    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Si no hay usuario autenticado, no se muestran acciones.
    if (!auth.user) {
        return null;
    }

    // Evita que un usuario actúe sobre su propio perfil.
    if (auth.user.id === user.id) {
        return null;
    }

    // Determina si el botón de seguir debe mostrarse.
    // No se muestra si existe bloqueo mutuo.
    const canFollow = !user.is_blocked && !user.has_blocked;

    // Determina si el usuario autenticado puede bloquear al usuario del perfil.
    // Los moderadores no pueden bloquear ni ser bloqueados.
    // No se muestra si el perfil ya bloqueó al usuario autenticado.
    const canBlock = !auth.user.can_moderate && !user.can_moderate && !user.has_blocked;

    // Determina si el usuario autenticado puede administrar al usuario del perfil.
    const canAdmin = canActOnUser(user);

    // Determina si existen acciones secundarias.
    // Si no existen, no se muestra el menú contextual.
    const hasSecondaryActions = canBlock || canAdmin;

    return (
        <div className="flex items-center gap-2">
            {/* Acción primaria: seguir / dejar de seguir */}
            {canFollow && <UserActionsFollow user={user} />}

            {/* Menú contextual con acciones secundarias */}
            {hasSecondaryActions && (
                <DropdownMenu>
                    {/* Botón de activación del menú */}
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More user actions">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    {/* Contenido del menú */}
                    <DropdownMenuContent align="end" className="w-48">
                        {/* Acción bloquear / desbloquear */}
                        {canBlock && (
                            <DropdownMenuItem asChild>
                                <UserActionsBlock user={user} />
                            </DropdownMenuItem>
                        )}

                        {/* Acción administrar usuario */}
                        {canAdmin && (
                            <DropdownMenuItem asChild>
                                <UserActionsAdmin user={user} />
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
