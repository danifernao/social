import { router } from '@inertiajs/react';
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
    ImageUp,
    Italic,
    Link,
    Link2,
    List,
    ListOrdered,
    LoaderCircle,
    Minus,
    PaintBucket,
    Quote,
    SquareCode,
    SquarePlay,
    Type,
    Upload,
} from 'lucide-react';
import React, { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface FormattingToolbarProps {
    text: string; // Contenido actual del editor de texto.

    // Función callback para actualizar el texto.
    onChange: (newText: string) => void;

    // Referencia al textarea controlado externamente.
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Barra de herramientas que permite aplicar formato al texto
 * utilizando sintaxis Markdown y directivas personalizadas.
 *
 * Opera directamente sobre un textarea externo mediante una referencia,
 * manipulando la selección de texto y la posición del cursor.
 */
export default function FormattingToolbar({ text, onChange, textareaRef }: FormattingToolbarProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    /**
     * Obtiene la selección actual del textarea.
     * Retorna las posiciones de inicio y fin junto con el texto seleccionado.
     */
    function getSelection() {
        const textarea = textareaRef.current;

        if (!textarea) return null;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start == null || end == null) return null;

        return { start, end, value: textarea.value.substring(start, end) };
    }

    /**
     * Reemplaza el texto seleccionado por el contenido indicado
     * y reposiciona el cursor de forma controlada.
     */
    function replaceSelection(replacement: string, moveCursorOffset = 0): void {
        const textarea = textareaRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = before + replacement + after;

        onChange(newText);

        // Reposiciona el cursor después de que React actualice el estado.
        requestAnimationFrame(() => {
            textarea.focus();
            const newPos = start + replacement.length + moveCursorOffset;
            textarea.setSelectionRange(newPos, newPos);
        });
    }

    /**
     * Aplica una transformación si existe selección,
     * o inserta un texto de respaldo en caso contrario.
     */
    function applyOrInsert({ fnWhenSelected, fallback }: { fnWhenSelected: (selected: string) => string; fallback: string }): void {
        const sel = getSelection();

        if (sel && sel.start !== sel.end) {
            replaceSelection(fnWhenSelected(sel.value));
        } else {
            replaceSelection(fallback);
        }
    }

    /**
     * Gestiona la inserción de enlaces.
     */
    const [linkData, setLinkData] = useState({ text: '', url: '' });

    function applyLink(): void {
        const sel = getSelection();
        const selectedIsUrl = sel && /^https?:\/\//i.test(sel.value);
        const defaultText = sel && !selectedIsUrl ? sel.value : 'example';
        const textToUse = linkData.text.trim() || defaultText;
        const urlToUse = linkData.url.trim() || 'https://example.com';
        replaceSelection(`[${textToUse}](${urlToUse})`);
        setLinkData({ text: '', url: '' });
    }

    /**
     * Sube un archivo multimedia.
     */
    function uploadMedia(
        file: File,
        {
            onStart,
            onSuccess,
            onFinish,
        }: {
            onStart: () => void;
            onSuccess: (url: string) => void;
            onFinish: () => void;
        },
    ): void {
        const formData = new FormData();

        formData.append('file', file);

        onStart();

        router.post(route('media.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,

            onSuccess: (page) => {
                const mediaUrl = page.props.media_url as string;

                if (!mediaUrl) {
                    toast.error(t('upload_failed'));
                    return;
                }

                onSuccess(mediaUrl);
            },

            onError: (errors) => {
                const firstError = Object.values(errors)[0];

                toast.error(firstError ?? t('upload_failed'));

                if (import.meta.env.DEV) {
                    console.error(errors);
                }
            },

            onFinish,
        });
    }

    /**
     * Gestiona la inserción de imágenes.
     */

    // Atributos de la imagen.
    const [imageData, setImageData] = useState({ alt: '', url: '' });

    // Referencia del campo de archivo de imagen.
    const imgFileInputRef = useRef<HTMLInputElement | null>(null);

    // Indica si se está subiendo una imagen.
    const [isImgUploading, setIsImgUploading] = useState(false);

    // Inserta la imagen en el editor.
    function applyImage(): void {
        const sel = getSelection();
        const selectedIsUrl = sel && /^https?:\/\//i.test(sel.value);
        const defaultAlt = sel && !selectedIsUrl ? sel.value : 'image';
        const altToUse = imageData.alt.trim() || defaultAlt;
        const urlToUse = imageData.url.trim() || 'https://example.com/image-placeholder.png';
        replaceSelection(`![${altToUse}](${urlToUse})`);
        setImageData({ alt: '', url: '' });
    }

    // Sube una imagen al seleccionar un archivo.
    function onImgFileSelected(e: ChangeEvent<HTMLInputElement>): void {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        uploadMedia(file, {
            onStart: () => setIsImgUploading(true),
            onSuccess: (url) =>
                setImageData((p) => ({
                    ...p,
                    url,
                })),
            onFinish: () => setIsImgUploading(false),
        });
    }

    /**
     * Gestiona la inserción de videos.
     */

    // Atributos del video.
    const [videoData, setVideoData] = useState({ url: '' });

    // Referencia del input de archivo de video.
    const videoFileInputRef = useRef<HTMLInputElement | null>(null);

    // Indica si se está subiendo un video.
    const [isVideoUploading, setIsVideoUploading] = useState(false);

    // Inserta el video en el editor.
    function applyVideo(): void {
        const sel = getSelection();
        const url = videoData.url.trim() || (sel ? sel.value : '');
        const finalUrl = url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        replaceSelection(`\n::video[${finalUrl}]\n`);
        setVideoData({ url: '' });
    }

    // Sube un video al seleccionar un archivo.
    function onVideoFileSelected(e: ChangeEvent<HTMLInputElement>): void {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        uploadMedia(file, {
            onStart: () => setIsVideoUploading(true),
            onSuccess: (url) => setVideoData({ url }),
            onFinish: () => setIsVideoUploading(false),
        });
    }

    /**
     * Acciones básicas de formato.
     */

    // Inserta texto en negrita.
    const onBold = () => applyOrInsert({ fnWhenSelected: (s) => `**${s}**`, fallback: '** **' });

    // Inserta texto en cursiva.
    const onItalic = () => applyOrInsert({ fnWhenSelected: (s) => `*${s}*`, fallback: '* *' });

    // Inserta encabezados según el nivel indicado.
    function onHeading(level: number): void {
        applyOrInsert({
            fnWhenSelected: (s) => `${'#'.repeat(level)} ${s}`,
            fallback: `${'#'.repeat(level)} `,
        });
    }

    // Inserta cita en bloque.
    const onQuote = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `> ${s}`,
            fallback: '> Cita',
        });

    // Inserta código en línea.
    const onInlineCode = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `\`${s}\``,
            fallback: '`while(1);`',
        });

    // Inserta bloque de código.
    const onCodeBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : 'while(1);';
        replaceSelection(`\n\`\`\`\n${content}\n\`\`\`\n`);
    };

    // Inserta lista ordenada.
    const onOrderedList = () => {
        const sel = getSelection();
        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln, i) => `${i + 1}. ${ln}`).join('\n');
            replaceSelection(replaced);
        } else {
            replaceSelection(`1. ${t('first_item')}\n2. ${t('second_item')}\n3. ${t('third_item')}\n`);
        }
    };

    // Inserta lista sin orden.
    const onUnorderedList = () => {
        const sel = getSelection();
        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln) => `- ${ln}`).join('\n');
            replaceSelection(replaced);
        } else {
            replaceSelection(`- ${t('first_item')}\n- ${t('second_item')}\n- ${t('third_item')}\n`);
        }
    };

    // Inserta texto oculto en línea.
    const onHiddenInline = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `:hidden[${s}]`,
            fallback: `:hidden[${t('spoiler')}]`,
        });

    // Inserta bloque de texto oculto.
    const onHiddenBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('spoiler');
        replaceSelection(`\n:::hidden\n${content}\n:::\n`);
    };

    // Inserta separador horizontal.
    const onSeparator = () => replaceSelection('\n---\n');

    /**
     * Estilo de fuente.
     */

    // Mapas estáticos de estilos disponibles.
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

    // Aplica un color de fuente.
    function onColorSelected(key: keyof typeof colors): void {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t(`toolbar.colors.${key}`);
        replaceSelection(`:style[${content}]{color=${key}}`);
    }

    // Aplica un tamaño de fuente.
    function onSizeSelected(key: keyof typeof sizes): void {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : key;
        replaceSelection(`:style[${content}]{size=${key}}`);
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-1">
            {/* Negrita */}
            <Button type="button" variant="ghost" size="icon" title={t('bold')} onClick={onBold}>
                <Bold className="h-4 w-4" />
            </Button>

            {/* Cursiva */}
            <Button type="button" variant="ghost" size="icon" title={t('italic')} onClick={onItalic}>
                <Italic className="h-4 w-4" />
            </Button>

            {/* Encabezados (H1 y H2) */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('heading')}>
                        <Heading className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onHeading(1)}>
                        <Heading1 className="h-4 w-4" />
                        {t('title')}
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onHeading(2)}>
                        <Heading2 className="h-4 w-4" />
                        {t('subtitle')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Color de fuente */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('font_color')}>
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
                    <Button variant="ghost" size="icon" title={t('font_size')}>
                        <Type className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    {(Object.keys(sizes) as (keyof typeof sizes)[]).map((key) => (
                        <Button key={key} variant="ghost" className="flex items-center gap-2 text-sm" onClick={() => onSizeSelected(key)}>
                            <Type className={`h-4 w-4 ${key === 'small' ? 'scale-90' : 'scale-125'}`} />
                            {key === 'small' ? t('small') : t('big')}
                        </Button>
                    ))}
                </PopoverContent>
            </Popover>

            {/* Enlace */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('insert_link')}>
                        <Link className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <Input
                        placeholder={t('link_text')}
                        value={linkData.text}
                        onChange={(e) => setLinkData((p) => ({ ...p, text: e.target.value }))}
                    />
                    <Input
                        placeholder="https://example.com"
                        value={linkData.url}
                        onChange={(e) => setLinkData((p) => ({ ...p, url: e.target.value }))}
                    />
                    <Button size="sm" className="mt-2" onClick={applyLink}>
                        <Link2 className="mr-2 h-4 w-4" /> {t('insert_link')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Imagen */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('insert_image')} disabled={isImgUploading}>
                        <Image className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <div className="flex gap-2">
                        {/* Campo URL */}
                        <Input
                            disabled={isImgUploading}
                            placeholder="https://placehold.co/600x400.png"
                            value={imageData.url}
                            onChange={(e) => setImageData((p) => ({ ...p, url: e.target.value }))}
                        />

                        {/* Botón subir imagen */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={t('upload_image')}
                            disabled={isImgUploading}
                            onClick={() => imgFileInputRef.current?.click()}
                        >
                            {isImgUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
                        </Button>

                        {/* Input oculto */}
                        <input
                            ref={imgFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            hidden
                            onChange={onImgFileSelected}
                        />
                    </div>

                    {/* Campo texto alternativo */}
                    <Input
                        disabled={isImgUploading}
                        placeholder={t('alternative_text')}
                        value={imageData.alt}
                        onChange={(e) => setImageData((p) => ({ ...p, alt: e.target.value }))}
                    />

                    {/* Botón insertar imagen */}
                    <Button size="sm" className="mt-2" onClick={applyImage} disabled={isImgUploading}>
                        <ImagePlus className="mr-2 h-4 w-4" /> {t('insert_image')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Separador horizontal */}
            <Button type="button" variant="ghost" size="icon" title={t('separator')} onClick={onSeparator}>
                <Minus className="h-4 w-4" />
            </Button>

            {/* Cita en bloque */}
            <Button type="button" variant="ghost" size="icon" title={t('quote')} onClick={onQuote}>
                <Quote className="h-4 w-4" />
            </Button>

            {/* Código en línea */}
            <Button type="button" variant="ghost" size="icon" title={t('inline_code')} onClick={onInlineCode}>
                <Code className="h-4 w-4" />
            </Button>

            {/* Bloque de código */}
            <Button type="button" variant="ghost" size="icon" title={t('code_block')} onClick={onCodeBlock}>
                <SquareCode className="h-4 w-4" />
            </Button>

            {/* Lista ordenada */}
            <Button type="button" variant="ghost" size="icon" title={t('ordered_list')} onClick={onOrderedList}>
                <ListOrdered className="h-4 w-4" />
            </Button>

            {/* Lista sin orden */}
            <Button type="button" variant="ghost" size="icon" title={t('unordered_list')} onClick={onUnorderedList}>
                <List className="h-4 w-4" />
            </Button>

            {/* Texto oculto en línea */}
            <Button type="button" variant="ghost" size="icon" title={t('hidden_text')} onClick={onHiddenInline}>
                <EyeOff className="h-4 w-4" />
            </Button>

            {/* Bloque de texto oculto */}
            <Button type="button" variant="ghost" size="icon" title={t('hidden_block')} onClick={onHiddenBlock}>
                <CaptionsOff className="h-4 w-4" />
            </Button>

            {/* Video */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" title={t('video')}>
                        <SquarePlay className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-64 flex-col gap-2 p-4">
                    <div className="flex gap-2">
                        {/* Campo URL */}
                        <Input
                            disabled={isVideoUploading}
                            placeholder="https://example.com/video.mp4"
                            value={videoData.url}
                            onChange={(e) => setVideoData({ url: e.target.value })}
                        />

                        {/* Botón subir video */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={t('upload_video')}
                            disabled={isVideoUploading}
                            onClick={() => videoFileInputRef.current?.click()}
                        >
                            {isVideoUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Button>

                        {/* Input oculto */}
                        <input ref={videoFileInputRef} type="file" accept="video/mp4,video/webm" hidden onChange={onVideoFileSelected} />
                    </div>

                    <Button size="sm" className="mt-2" onClick={applyVideo}>
                        <SquarePlay className="mr-2 h-4 w-4" /> {t('insert_video')}
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
