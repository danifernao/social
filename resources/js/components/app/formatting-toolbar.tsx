import {
    Bold,
    CaptionsOff,
    Code,
    EyeOff,
    Heading,
    Heading1,
    Heading2,
    Image,
    ImagePlus,
    Italic,
    Link,
    Link2,
    List,
    ListOrdered,
    Minus,
    PaintBucket,
    Quote,
    SquareCode,
    SquarePlay,
    Type,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface FormattingToolbarProps {
    text: string; // Texto actual del editor.
    onChange: (newText: string) => void; // Callback para actualizar el texto.
    textareaRef: React.RefObject<HTMLTextAreaElement | null>; // Referencia al textarea externo.
}

/**
 * Muestra una barra de herramientas para dar formato al texto.
 * Depende de un textarea externo pasado por ref.
 */
export default function FormattingToolbar({ text, onChange, textareaRef }: FormattingToolbarProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Obtiene la selección actual del textarea.
    function getSelection() {
        const textarea = textareaRef.current;

        if (!textarea) return null;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start == null || end == null) return null;

        return { start, end, value: textarea.value.substring(start, end) };
    }

    // Reemplaza la selección con un texto nuevo.
    function replaceSelection(replacement: string, moveCursorOffset = 0): void {
        const textarea = textareaRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = before + replacement + after;

        onChange(newText);

        requestAnimationFrame(() => {
            textarea.focus();
            const newPos = start + replacement.length + moveCursorOffset;
            textarea.setSelectionRange(newPos, newPos);
        });
    }

    // Aplica una función si hay selección, o inserta un fallback.
    function applyOrInsert({ fnWhenSelected, fallback }: { fnWhenSelected: (selected: string) => string; fallback: string }): void {
        const sel = getSelection();
        if (sel && sel.start !== sel.end) {
            replaceSelection(fnWhenSelected(sel.value));
        } else {
            replaceSelection(fallback);
        }
    }

    // Acciones básicas
    const onBold = () => applyOrInsert({ fnWhenSelected: (s) => `**${s}**`, fallback: '** **' });
    const onItalic = () => applyOrInsert({ fnWhenSelected: (s) => `*${s}*`, fallback: '* *' });

    // Encabezados
    function onHeading(level: number): void {
        applyOrInsert({
            fnWhenSelected: (s) => `${'#'.repeat(level)} ${s}`,
            fallback: `${'#'.repeat(level)} `,
        });
    }

    // Mapas estáticos de estilo.
    const colors = {
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        green: 'bg-green-500',
        pink: 'bg-pink-400',
    } as const;

    const sizes = {
        small: 'text-sm',
        large: 'text-lg',
    } as const;

    // Color de fuente
    function onColorSelected(key: keyof typeof colors): void {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t(`toolbar.colors.${key}`);
        replaceSelection(`:style[${content}]{color=${key}}`);
    }

    // Tamaño de fuente
    function onSizeSelected(key: keyof typeof sizes): void {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : key;
        replaceSelection(`:style[${content}]{size=${key}}`);
    }

    // Enlaces
    const [linkData, setLinkData] = React.useState({ text: '', url: '' });

    function applyLink(): void {
        const sel = getSelection();
        const selectedIsUrl = sel && /^https?:\/\//i.test(sel.value);
        const defaultText = sel && !selectedIsUrl ? sel.value : 'example';
        const textToUse = linkData.text.trim() || defaultText;
        const urlToUse = linkData.url.trim() || 'https://example.com';
        replaceSelection(`[${textToUse}](${urlToUse})`);
        setLinkData({ text: '', url: '' });
    }

    // Imagen
    const [imageData, setImageData] = React.useState({ alt: '', url: '' });

    function applyImage(): void {
        const sel = getSelection();
        const selectedIsUrl = sel && /^https?:\/\//i.test(sel.value);
        const defaultAlt = sel && !selectedIsUrl ? sel.value : 'image';
        const altToUse = imageData.alt.trim() || defaultAlt;
        const urlToUse = imageData.url.trim() || 'https://example.com/image-placeholder.png';
        replaceSelection(`![${altToUse}](${urlToUse})`);
        setImageData({ alt: '', url: '' });
    }

    // Cita
    const onQuote = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `> ${s}`,
            fallback: '> Cita',
        });

    // Código en línea
    const onInlineCode = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `\`${s}\``,
            fallback: '`while(1);`',
        });

    // Bloque de código
    const onCodeBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : 'while(1);';
        replaceSelection(`\n\`\`\`\n${content}\n\`\`\`\n`);
    };

    // Lista ordenada
    const onOrderedList = () => {
        const sel = getSelection();
        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln, i) => `${i + 1}. ${ln}`).join('\n');
            replaceSelection(replaced);
        } else {
            replaceSelection(`1. ${t('toolbar.firstItem')}\n2. ${t('toolbar.secondItem')}\n3. ${t('toolbar.thirdItem')}\n`);
        }
    };

    // Lista sin orden
    const onUnorderedList = () => {
        const sel = getSelection();
        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln) => `- ${ln}`).join('\n');
            replaceSelection(replaced);
        } else {
            replaceSelection(`- ${t('toolbar.firstItem')}\n- ${t('toolbar.secondItem')}\n- ${t('toolbar.thirdItem')}\n`);
        }
    };

    // Texto oculto
    const onHiddenInline = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `:hidden[${s}]`,
            fallback: `:hidden[${t('toolbar.spoiler')}]`,
        });

    // Bloque oculto
    const onHiddenBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('toolbar.spoiler');
        replaceSelection(`\n:::hidden\n${content}\n:::\n`);
    };

    // Separador
    const onSeparator = () => replaceSelection('\n---\n');

    // Video
    const [videoUrl, setVideoUrl] = React.useState('');

    function applyVideo(): void {
        const sel = getSelection();
        const url = videoUrl.trim() || (sel ? sel.value : '');
        const finalUrl = url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        replaceSelection(`\n::video[${finalUrl}]\n`);
        setVideoUrl('');
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-1">
            <Button type="button" variant="ghost" size="icon" title={t('toolbar.bold')} onClick={onBold}>
                <Bold className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.italic')} onClick={onItalic}>
                <Italic className="h-4 w-4" />
            </Button>

            {/* Encabezados (H1 y H2) */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('toolbar.heading')}>
                        <Heading className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onHeading(1)}>
                        <Heading1 className="h-4 w-4" />
                        {t('toolbar.h1')}
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onHeading(2)}>
                        <Heading2 className="h-4 w-4" />
                        {t('toolbar.h2')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Color de fuente */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('toolbar.fontColor')}>
                        <PaintBucket className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto gap-2">
                    {(Object.keys(colors) as (keyof typeof colors)[]).map((key) => (
                        <button
                            key={key}
                            title={t(`toolbar.colors.${key}`)}
                            onClick={() => onColorSelected(key)}
                            className={`h-6 w-6 rounded-full ${colors[key]} border border-gray-300 transition-transform hover:scale-110`}
                        />
                    ))}
                </PopoverContent>
            </Popover>

            {/* Tamaño de fuente */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('toolbar.fontSize')}>
                        <Type className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    {(Object.keys(sizes) as (keyof typeof sizes)[]).map((key) => (
                        <Button key={key} variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onSizeSelected(key)}>
                            <Type className={`h-4 w-4 ${key === 'small' ? 'scale-90' : 'scale-125'}`} />
                            {key === 'small' ? t('toolbar.small') : t('toolbar.big')}
                        </Button>
                    ))}
                </PopoverContent>
            </Popover>

            {/* Enlace */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title="Insertar enlace">
                        <Link className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <Input
                        placeholder={t('toolbar.textPlaceholder')}
                        value={linkData.text}
                        onChange={(e) => setLinkData((p) => ({ ...p, text: e.target.value }))}
                    />
                    <Input
                        placeholder="https://example.com"
                        value={linkData.url}
                        onChange={(e) => setLinkData((p) => ({ ...p, url: e.target.value }))}
                    />
                    <Button size="sm" className="mt-2" onClick={applyLink}>
                        <Link2 className="mr-2 h-4 w-4" /> {t('toolbar.insertLink')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Imagen */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title="Insertar imagen">
                        <Image className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <Input
                        placeholder={t('toolbar.alternativeText')}
                        value={imageData.alt}
                        onChange={(e) => setImageData((p) => ({ ...p, alt: e.target.value }))}
                    />
                    <Input
                        placeholder="https://placehold.co/600x400.png"
                        value={imageData.url}
                        onChange={(e) => setImageData((p) => ({ ...p, url: e.target.value }))}
                    />
                    <Button size="sm" className="mt-2" onClick={applyImage}>
                        <ImagePlus className="mr-2 h-4 w-4" /> {t('toolbar.insertImage')}
                    </Button>
                </PopoverContent>
            </Popover>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.separator')} onClick={onSeparator}>
                <Minus className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.quote')} onClick={onQuote}>
                <Quote className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.inlineCode')} onClick={onInlineCode}>
                <Code className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.codeBlock')} onClick={onCodeBlock}>
                <SquareCode className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.orderedList')} onClick={onOrderedList}>
                <ListOrdered className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.unorderedList')} onClick={onUnorderedList}>
                <List className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.hiddenInline')} onClick={onHiddenInline}>
                <EyeOff className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" size="icon" title={t('toolbar.hiddenBlock')} onClick={onHiddenBlock}>
                <CaptionsOff className="h-4 w-4" />
            </Button>

            {/* Video */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" title={t('toolbar.video')}>
                        <SquarePlay className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                    <Button size="sm" className="mt-2" onClick={applyVideo}>
                        <SquarePlay className="mr-2 h-4 w-4" /> {t('toolbar.insertVideo')}
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
