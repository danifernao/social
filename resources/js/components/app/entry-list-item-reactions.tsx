import type { Auth, Entry } from '@/types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { router, usePage } from '@inertiajs/react';
import { SmilePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface EntryListItemReactionsProps {
    entry: Entry; // Entrada (publicación o comentario) a la que se le puede reaccionar.
}

export default function EntryListItemReactions({ entry }: EntryListItemReactionsProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Estado que almacena la lista de reacciones asociadas a la entrada.
    const [reactions, setReactions] = useState(entry.reactions || []);

    // Estado que controla la visibilidad del selector de emojis.
    const [showPicker, setShowPicker] = useState(false);

    // Referencia al contenedor del selector de emojis para detectar clics fuera de él.
    const pickerRef = useRef<HTMLDivElement>(null);

    // Alterna una reacción del usuario autenticado: la crea o la elimina.
    const toggleReaction = (emoji: string) => {
        router.put(
            route('reaction.toggle'),
            { type: entry.type, id: entry.id, emoji },
            {
                preserveScroll: true,

                // Al reaccionar exitosamente, se actualiza el estado local de reacciones.
                onSuccess: () => {
                    setReactions((prev) => {
                        // Reacción actual del usuario (si existe).
                        const previousReaction = prev.find((r) => r.reactedByUser);

                        // Determina si está repitiendo la misma reacción.
                        const isSame = previousReaction?.emoji === emoji;

                        /* Si está repitiendo la misma reacción, se interpreta que la está quitando.
                           Disminuye el conteo del emoji o lo elimina si llega a cero.
                        */
                        if (previousReaction && isSame) {
                            return prev
                                .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reactedByUser: false } : r))
                                .filter((r) => r.count > 0);
                        }

                        // Como es una reacción nueva, se procede a retirar cualquier reacción previa que haya hecho, si existe.
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

                        // Incrementa el conteo de la reacción existente.
                        if (existing) {
                            return updated.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, reactedByUser: true } : r));
                        }

                        // Si es una nueva reacción, la agrega al final.
                        return [...updated, { emoji, count: 1, reactedByUser: true }];
                    });
                },

                onError: (errors) => {
                    toast(t('error'));
                    console.error(errors);
                },
            },
        );
    };

    // Gestiona la selección de un emoji desde el selector.
    const handleSelect = (emoji: { native: string }) => {
        toggleReaction(emoji.native);
        setShowPicker(false);
    };

    // Cierra el selector si se hace clic fuera de él.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    return (
        <div className="relative flex gap-2">
            {reactions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {reactions.map(({ emoji, count, reactedByUser }) => (
                        <Button
                            key={emoji}
                            onClick={() => (auth.user ? toggleReaction(emoji) : false)}
                            className={reactedByUser ? 'bg-accent text-accent-foreground' : ''}
                            aria-label={reactedByUser ? t('removeReaction') : t('reactWith', { emoji })}
                            title={reactedByUser ? t('removeReaction') : t('reactWith', { emoji })}
                            variant="outline"
                        >
                            <span className="mr-1">{count}</span>
                            <span>{emoji}</span>
                        </Button>
                    ))}
                </div>
            )}

            {auth.user && (
                <Button onClick={() => setShowPicker(!showPicker)} variant="outline" title={t('react')}>
                    <SmilePlus />
                </Button>
            )}

            {showPicker && (
                <div className="absolute z-50 mt-2" ref={pickerRef}>
                    <Picker data={data} onEmojiSelect={handleSelect} />
                </div>
            )}
        </div>
    );
}
