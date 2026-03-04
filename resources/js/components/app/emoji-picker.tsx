import { useAppearance } from '@/hooks/kit/use-appearance';
import i18n from '@/i18n';
import data from '@emoji-mart/data';
import en from '@emoji-mart/data/i18n/en.json';
import es from '@emoji-mart/data/i18n/es.json';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
    onSelect: (emoji: any) => void; // Callback que se ejecuta al seleccionar un emoji.
    pickerProps?: Partial<React.ComponentProps<typeof Picker>>; // Propiedades adicionales.
}

/**
 * Componente envoltorio para el selector de emojis.
 */
export default function EmojiPicker({ onSelect, pickerProps }: EmojiPickerProps) {
    // Obtiene la apariencia actual de la aplicación.
    const { appearance } = useAppearance();

    // Determina el tema que debe aplicarse al selector.
    const theme: 'light' | 'dark' | 'auto' = appearance === 'system' ? 'auto' : appearance;

    // Mapa de idiomas aceptados en el selector.
    const localeMap: Record<string, any> = {
        es,
        en,
    };

    // Idioma activo del selector.
    const locale = localeMap[i18n.currentLang] ?? en;

    return <Picker data={data} onEmojiSelect={onSelect} i18n={locale} theme={theme} {...pickerProps} />;
}
