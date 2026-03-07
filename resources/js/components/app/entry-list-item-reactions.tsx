import type { Auth, Entry } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Info, SmilePlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker from './emoji-picker';
import EntryListItemReactionsInfo from './entry-list-item-reactions-info';

interface EntryListItemReactionsProps {
    // Entrada (publicación o comentario) sobre la que se pueden aplicar reacciones.
    entry: Entry;
}

/**
 * Gestiona y muestra las reacciones de una entrada.
 */
export default function EntryListItemReactions({ entry }: EntryListItemReactionsProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Lista local de reacciones asociadas a la entrada.
    const [reactions, setReactions] = useState(entry.reactions || []);

    // Controla la visibilidad del selector de emojis.
    const [emojiOpen, setEmojiOpen] = useState(false);

    // Alterna una reacción del usuario autenticado.
    const toggleReaction = (emoji: string) => {
        router.post(
            route('reaction.toggle'),
            { type: entry.type, id: entry.id, emoji },
            {
                preserveScroll: true,

                // Actualiza el estado local tras una reacción exitosa.
                onSuccess: () => {
                    setReactions((prev) => {
                        // Reacción previa del usuario, si existe.
                        const previousReaction = prev.find((r) => r.reactedByUser);

                        // Determina si está repitiendo la misma reacción.
                        const isSame = previousReaction?.emoji === emoji;

                        // Si se repite la misma reacción, se elimina.
                        // Disminuye el conteo del emoji o lo elimina si llega a cero.
                        if (previousReaction && isSame) {
                            return prev
                                .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reactedByUser: false } : r))
                                .filter((r) => r.count > 0);
                        }

                        // Como es una reacción nueva, elimina cualquier
                        // reacción previa del usuario.
                        let updated = prev
                            .map((r) => {
                                if (previousReaction && r.emoji === previousReaction.emoji) {
                                    return { ...r, count: r.count - 1, reactedByUser: false };
                                }
                                return r;
                            })
                            .filter((r) => r.count > 0);

                        // Determina si ya alguien ha reaccionado con el mismo emoji.
                        const existing = updated.find((r) => r.emoji === emoji);

                        // Incrementa el conteo si la reacción ya existe.
                        if (existing) {
                            return updated.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, reactedByUser: true } : r));
                        }

                        // Agrega una nueva reacción si no existe.
                        return [...updated, { emoji, count: 1, reactedByUser: true }];
                    });
                },

                onError: (errors) => {
                    toast.error(errors.message ?? t('unexpected_error'));

                    if (import.meta.env.DEV) {
                        console.error(errors);
                    }
                },
            },
        );
    };

    // Gestiona la selección de un emoji desde el selector.
    const handleSelect = (emoji: { native: string }) => {
        toggleReaction(emoji.native);
        setEmojiOpen(false);
    };

    return (
        <div className="relative flex gap-2">
            {/* Reacciones hechas en la entrada */}
            {reactions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {reactions.map(({ emoji, count, reactedByUser }) => (
                        <Button
                            key={emoji}
                            onClick={() => (auth.user ? toggleReaction(emoji) : false)}
                            className={reactedByUser ? 'bg-accent text-accent-foreground' : ''}
                            aria-label={reactedByUser ? t('remove_reaction') : t('react_with_emoji', { emoji })}
                            title={reactedByUser ? t('remove_reaction') : t('react_with_emoji', { emoji })}
                            variant="outline"
                            disabled={!auth.user || !auth.user.permissions.includes('react')}
                        >
                            <span className="mr-1">{count}</span>
                            <span>{emoji}</span>
                        </Button>
                    ))}
                </div>
            )}

            {auth.user && (
                <div>
                    <ButtonGroup>
                        {/* Más información sobre las reacciones */}
                        {reactions.length > 0 && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" title={t('see_who_reacted_to_this')}>
                                        <Info className="h-4 w-4" aria-hidden={true} />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('reactions')}</DialogTitle>
                                        <DialogDescription>{t('user_reaction_details')}</DialogDescription>
                                    </DialogHeader>
                                    <EntryListItemReactionsInfo entry={entry} />
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Selector de emojis */}
                        {auth.user.permissions.includes('react') && (
                            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" title={t('react')}>
                                        <SmilePlus className="h-4 w-4" aria-hidden />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <EmojiPicker onSelect={handleSelect} />
                                </PopoverContent>
                            </Popover>
                        )}
                    </ButtonGroup>
                </div>
            )}
        </div>
    );
}
