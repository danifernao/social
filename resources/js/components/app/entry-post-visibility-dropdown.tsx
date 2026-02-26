import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Post } from '@/types';
import { Globe, LoaderCircle, Lock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PostVisibility = NonNullable<Post['visibility']>;

interface EntryPostVisibilityDropdownProps {
    value: PostVisibility; // Opción seleccionada por defecto.
    onChange: (value: PostVisibility) => void; // Callback para gestionar el cambio.
    username?: string | null; // Nombre del usuario autenticado.
    variant?: 'outline' | 'ghost'; // Variante del botón trigger.
    iconSize?: number; // Tamaño del icono del trigger (px)
    disabled?: boolean; // Desactiva el dropdown.
    loading?: boolean; // Muestra el icono cargando.
}

export default function EntryPostVisibilityDropdown({
    value,
    onChange,
    username = null,
    variant = 'outline',
    iconSize = 16,
    disabled = false,
    loading = false,
}: EntryPostVisibilityDropdownProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Icono y mensaje de visibilidad según la configuración de la publicación.
    const visibilityOptions = {
        public: {
            icon: Globe,
            label: 'public',
            description: username ? 'visible_to_all' : 'anyone_can_see_your_post',
        },
        following: {
            icon: Users,
            label: 'following',
            description: username ? 'visible_to_user_following' : 'only_users_you_follow_can_see_your_post',
        },
        private: {
            icon: Lock,
            label: 'private',
            description: username ? 'visible_to_user_only' : 'only_you_can_see_your_post',
        },
    };

    // Icono y descripción del botón trigger.
    const TriggerIcon = visibilityOptions[value].icon;
    const TriggerDescription = visibilityOptions[value].description;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div title={t(TriggerDescription, { username: username })}>
                    <Button
                        aria-label={t(TriggerDescription, { username: username })}
                        type="button"
                        variant={variant}
                        size="icon"
                        disabled={disabled || loading}
                        className="data-[state=open]:bg-muted disabled:opacity-100"
                    >
                        {loading ? (
                            <LoaderCircle className="animate-spin" style={{ width: iconSize, height: iconSize }} aria-label={t('loading')} />
                        ) : (
                            <TriggerIcon style={{ width: iconSize, height: iconSize }} />
                        )}
                    </Button>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuRadioGroup value={value} onValueChange={(val) => onChange(val as PostVisibility)} className="flex flex-col gap-1">
                    {Object.entries(visibilityOptions).map(([key, option]) => {
                        const Icon = option.icon;

                        return (
                            <DropdownMenuRadioItem
                                key={key}
                                value={key}
                                className="data-[state=checked]:bg-muted flex items-start gap-3 py-3 pl-3 [&>span:first-child]:hidden"
                            >
                                <Icon className="text-muted-foreground mt-1 h-4 w-4" aria-hidden={true} />

                                <div className="flex flex-col">
                                    <span className="font-semibold">{t(option.label)}</span>
                                    <span className="text-muted-foreground text-xs">{t(option.description)}</span>
                                </div>
                            </DropdownMenuRadioItem>
                        );
                    })}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
