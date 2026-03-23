import { generateThumbnail } from '@/lib/utils';
import { User } from '@/types';
import { router } from '@inertiajs/react';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    CaptionsOff,
    Code,
    EyeOff,
    Heading,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    History,
    Image,
    ImagePlus,
    Italic,
    Link,
    Link2,
    List,
    ListOrdered,
    LoaderCircle,
    Minus,
    PaintBucket,
    Quote,
    Smile,
    SquareCode,
    SquarePlay,
    Strikethrough,
    Upload,
} from 'lucide-react';
import React, { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import EmojiPicker from './emoji-picker';
import MediaDialog from './media-dialog';

interface RichTextToolbarProps {
    user: User; // Usuario autenticado.

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
export default function RichTextToolbar({ user, text, onChange, textareaRef }: RichTextToolbarProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Estado para controlar el diálogo de selección de archivos multimedia.
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

    // Modo de inserción multimedia.
    const [mediaMode, setMediaMode] = useState<'image' | 'video' | null>(null);

    // Estados para controlar la apertura manual de los Popovers
    // de imagen, video y emoji.
    const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
    const [isVideoPopoverOpen, setIsVideoPopoverOpen] = useState(false);
    const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState(false);

    // Clases para ocultar los botones en los campos para números.
    const noSpinButtonClassName =
        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

    /**
     * Obtiene la selección actual del textarea.
     * Retorna las posiciones de inicio y fin junto con el texto seleccionado.
     */
    function getSelection() {
        const textarea = textareaRef.current;

        if (!textarea) {
            return null;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start == null || end == null) {
            return null;
        }

        return { start, end, value: textarea.value.substring(start, end) };
    }

    /**
     * Reemplaza el texto seleccionado por el contenido indicado
     * y reposiciona el cursor de forma controlada.
     */
    function replaceSelection(replacement: string, moveCursorOffset = 0) {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

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
     * Obtiene la URL seleccionada.
     */
    function getSelectedUrl(): string {
        const sel = getSelection();
        const selectedIsUrl = sel && /^https?:\/\//i.test(sel.value);

        return selectedIsUrl ? sel.value.trim() : '';
    }

    /**
     * Aplica una transformación si existe selección,
     * o inserta un texto de respaldo en caso contrario.
     */
    type ApplyOptions = {
        fnWhenSelected: (s: string) => string;
        fallback: string;
        block?: boolean;
        beforeLines?: number;
        afterLines?: number;
    };

    function applyOrInsert({ fnWhenSelected, fallback, block = false, beforeLines = 1, afterLines = 1 }: ApplyOptions) {
        const sel = getSelection();

        const content = sel && sel.start !== sel.end ? fnWhenSelected(sel.value) : fallback;

        if (block) {
            insertBlock(content, beforeLines, afterLines);
        } else {
            replaceSelection(content);
        }
    }

    /**
     * Inserta un bloque asegurando una cantidad mínima de saltos
     * de línea antes y después del contenido.
     */
    function insertBlock(content: string, beforeLines = 1, afterLines = 1) {
        const sel = getSelection();

        if (!sel) {
            return;
        }

        const before = text.slice(0, sel.start);
        const after = text.slice(sel.end);

        // Cuenta saltos existentes antes del cursor.
        const beforeMatch = before.match(/\n*$/);
        const existingBefore = beforeMatch ? beforeMatch[0].length : 0;

        // Cuenta saltos existentes después del cursor.
        const afterMatch = after.match(/^\n*/);
        const existingAfter = afterMatch ? afterMatch[0].length : 0;

        // Si no hay texto antes, no se agregan saltos.
        const requiredBefore = before.length === 0 ? 0 : beforeLines;

        const prefix = '\n'.repeat(Math.max(0, requiredBefore - existingBefore));
        const suffix = '\n'.repeat(Math.max(0, afterLines - existingAfter));

        replaceSelection(`${prefix}${content}${suffix}`);
    }

    /**
     * Sube un archivo multimedia.
     */
    async function uploadMedia(
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
    ): Promise<void> {
        const formData = new FormData();

        formData.append('file', file);

        if (file.type.startsWith('video/')) {
            const thumbnail = await generateThumbnail(file);

            if (thumbnail) {
                formData.append('thumbnail', thumbnail, 'thumbnail.jpg');
            }
        }

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
    const [imageData, setImageData] = useState({ alt: '', url: '', width: '', height: '' });

    // Referencia del campo de archivo de imagen.
    const imgFileInputRef = useRef<HTMLInputElement | null>(null);

    // Indica si se está subiendo una imagen.
    const [isImgUploading, setIsImgUploading] = useState(false);

    // Inserta la imagen en el editor.
    function applyImage(): void {
        const alt = imageData.alt.trim();
        const url = imageData.url.trim() || `${window.location.origin}/samples/cat.jpg`;
        const attrs = [];

        if (alt) {
            attrs.push(`alt="${alt}"`);
        }

        if (imageData.width) {
            attrs.push(`width=${imageData.width}`);
        }

        if (imageData.height) {
            attrs.push(`height=${imageData.height}`);
        }

        insertBlock(`::image[${url}]${attrs.length ? `{${attrs.join(' ')}}` : ''}`);

        setImageData({ alt: '', url: '', width: '', height: '' });
    }

    // Sube una imagen al seleccionar un archivo.
    function onImgFileSelected(e: ChangeEvent<HTMLInputElement>) {
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
    const [videoData, setVideoData] = useState({ url: '', width: '', height: '' });

    // Referencia del input de archivo de video.
    const videoFileInputRef = useRef<HTMLInputElement | null>(null);

    // Indica si se está subiendo un video.
    const [isVideoUploading, setIsVideoUploading] = useState(false);

    // Inserta el video en el editor.
    function applyVideo(): void {
        const url = imageData.url.trim() || `${window.location.origin}/samples/cat.mp4`;
        const attrs = [];

        if (videoData.width) {
            attrs.push(`width=${videoData.width}`);
        }

        if (videoData.height) {
            attrs.push(`height=${videoData.height}`);
        }

        insertBlock(`::video[${url}]${attrs.length ? `{${attrs.join(' ')}}` : ''}`);

        setVideoData({ url: '', width: '', height: '' });
    }

    // Sube un video al seleccionar un archivo.
    function onVideoFileSelected(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        uploadMedia(file, {
            onStart: () => setIsVideoUploading(true),
            onSuccess: (url) => setVideoData((p) => ({ ...p, url })),
            onFinish: () => setIsVideoUploading(false),
        });
    }

    /**
     * Gestiona la inserción de enlaces.
     */
    const [linkData, setLinkData] = useState({ text: '', url: '' });

    function applyLink() {
        const text = linkData.text.trim() || t('text');
        const url = linkData.url.trim() || 'https://example.com';

        replaceSelection(`[${text}](${url})`);
        setLinkData({ text: '', url: '' });
    }

    /**
     * Inserta el emoji seleccionado.
     */
    function onEmojiSelect(emoji: any) {
        const native = emoji.native;

        if (!native) {
            return;
        }

        replaceSelection(native);

        setIsEmojiPopoverOpen(false);
    }

    /**
     * Acciones básicas de formato.
     */

    // Inserta texto en negrita.
    const onBold = () => applyOrInsert({ fnWhenSelected: (s) => `**${s}**`, fallback: `**${t('text')}**` });

    // Inserta texto en cursiva.
    const onItalic = () => applyOrInsert({ fnWhenSelected: (s) => `*${s}*`, fallback: `*${t('text')}*` });

    // Inserta texto tachado.
    const onStrikethrough = () => applyOrInsert({ fnWhenSelected: (s) => `~~${s}~~`, fallback: `~~${t('text')}~~` });

    // Iconos de encabezados.
    const headingIcons = {
        1: Heading1,
        2: Heading2,
        3: Heading3,
        4: Heading4,
        5: Heading5,
        6: Heading6,
    };

    // Inserta encabezados según el nivel indicado.
    const onHeading = (level: number) =>
        applyOrInsert({
            fnWhenSelected: (s) => `${'#'.repeat(level)} ${s}`,
            fallback: `${'#'.repeat(level)} ${t('text')}`,
            block: true,
        });

    // Alinea el texto.
    function onAlign(type: 'left' | 'right' | 'center' | 'justify') {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('text');

        insertBlock(`:::${type}\n${content}\n:::`);
    }

    // Inserta cita en bloque.
    const onQuote = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `> ${s}`,
            fallback: `> ${t('text')}`,
            block: true,
            beforeLines: 1,
            afterLines: 2,
        });

    // Inserta código en línea.
    const onInlineCode = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `\`${s}\``,
            fallback: `\`${t('text')}\``,
        });

    // Inserta bloque de código.
    const onCodeBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('text');

        insertBlock(`\`\`\`\n${content}\n\`\`\``);
    };

    // Inserta lista ordenada.
    const onOrderedList = () => {
        const sel = getSelection();

        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln, i) => `${i + 1}. ${ln}`).join('\n');

            insertBlock(replaced, 1, 2);
        } else {
            insertBlock(`1. ${t('first_item')}\n2. ${t('second_item')}\n3. ${t('third_item')}`, 2, 2);
        }
    };

    // Inserta lista sin orden.
    const onUnorderedList = () => {
        const sel = getSelection();

        if (sel && sel.start !== sel.end) {
            const lines = sel.value.split(/\r?\n/);
            const replaced = lines.map((ln) => `- ${ln}`).join('\n');

            insertBlock(replaced, 1, 2);
        } else {
            insertBlock(`- ${t('first_item')}\n- ${t('second_item')}\n- ${t('third_item')}`, 2, 2);
        }
    };

    // Inserta texto oculto en línea.
    const onHiddenInline = () =>
        applyOrInsert({
            fnWhenSelected: (s) => `:hidden[${s}]`,
            fallback: `:hidden[${t('text')}]`,
        });

    // Inserta bloque de texto oculto.
    const onHiddenBlock = () => {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('text');

        insertBlock(`:::hidden\n${content}\n:::`);
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
        xsmall: { text: 'text-xs', icon: '!w-3 !h-3', tl: 'extra_small' },
        small: { text: 'text-sm', icon: '!w-4 !h-4', tl: 'small' },
        large: { text: 'text-lg', icon: '!w-5 !h-5', tl: 'large' },
        xlarge: { text: 'text-xl', icon: '!w-6 !h-6', tl: 'extra_large' },
    } as const;

    // Aplica un color de fuente.
    function onColorSelected(key: keyof typeof colors) {
        const sel = getSelection();
        const content = sel && sel.start !== sel.end ? sel.value : t('text');

        replaceSelection(`:style[${content}]{color=${key}}`);
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            {/* Formato básico (Negrita, Cursiva y Tachado) */}
            <Button variant="ghost" className="h-8 w-8" title={t('bold')} onClick={onBold}>
                <Bold />
            </Button>

            <Button variant="ghost" className="h-8 w-8" title={t('italic')} onClick={onItalic}>
                <Italic />
            </Button>

            <Button variant="ghost" className="h-8 w-8" title={t('strikethrough')} onClick={onStrikethrough}>
                <Strikethrough />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Encabezados (H1 y H2) */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="data-[state=open]:bg-accent h-8 w-8" title={t('insert_heading')}>
                        <Heading />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    {(Object.keys(headingIcons) as unknown as (keyof typeof headingIcons)[]).map((level) => {
                        const Icon = headingIcons[level];

                        return (
                            <Button
                                key={level}
                                type="button"
                                variant="ghost"
                                className="flex w-full items-center justify-start gap-2 text-sm"
                                onClick={() => onHeading(Number(level))}
                            >
                                <Icon />
                                {t('heading_level', { level })}
                            </Button>
                        );
                    })}
                </PopoverContent>
            </Popover>

            {/* Separador horizontal */}
            <Button type="button" variant="ghost" className="h-8 w-8" title={t('insert_separator')} onClick={onSeparator}>
                <Minus />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Cita en bloque */}
            <Button type="button" variant="ghost" className="h-8 w-8" title={t('quote')} onClick={onQuote}>
                <Quote />
            </Button>

            {/* Código */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" title={t('insert_code')} className="data-[state=open]:bg-accent h-8 w-8">
                        <Code />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onInlineCode}>
                        <Code />
                        {t('inline_code')}
                    </Button>
                    <Button type="button" variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onCodeBlock}>
                        <SquareCode />
                        {t('code_block')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Lista */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" title={t('insert_list')} className="data-[state=open]:bg-accent h-8 w-8">
                        <List />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button type="button" variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onOrderedList}>
                        <ListOrdered /> {t('ordered_list')}
                    </Button>
                    <Button type="button" variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onUnorderedList}>
                        <List /> {t('unordered_list')}
                    </Button>
                </PopoverContent>
            </Popover>

            {/* Contenido oculto */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" title={t('hide_content')} className="data-[state=open]:bg-accent h-8 w-8">
                        <EyeOff />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button type="button" variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onHiddenInline}>
                        <EyeOff /> {t('hidden_text')}
                    </Button>
                    <Button type="button" variant="ghost" className="flex w-full items-center justify-start gap-2 text-sm" onClick={onHiddenBlock}>
                        <CaptionsOff /> {t('hidden_block')}
                    </Button>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            {/* Color de fuente */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="data-[state=open]:bg-accent h-8 w-8" title={t('change_font_color')}>
                        <PaintBucket />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-auto gap-2">
                    {(Object.keys(colors) as (keyof typeof colors)[]).map((key) => (
                        <button
                            key={key}
                            title={t(key)}
                            onClick={() => onColorSelected(key)}
                            className={`h-6 w-6 rounded-full ${colors[key]} border border-gray-300 transition-transform hover:scale-110`}
                        />
                    ))}
                </PopoverContent>
            </Popover>

            {/* Alineación de texto */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="data-[state=open]:bg-accent h-8 w-8" title={t('align_text')}>
                        <AlignLeft />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex w-auto flex-col items-start gap-1 p-2">
                    <Button variant="ghost" className="flex w-full items-center justify-start gap-2" onClick={() => onAlign('left')}>
                        <AlignLeft />
                        {t('align_left')}
                    </Button>

                    <Button variant="ghost" className="flex w-full items-center justify-start gap-2" onClick={() => onAlign('center')}>
                        <AlignCenter />
                        {t('align_center')}
                    </Button>

                    <Button variant="ghost" className="flex w-full items-center justify-start gap-2" onClick={() => onAlign('right')}>
                        <AlignRight />
                        {t('align_right')}
                    </Button>

                    <Button variant="ghost" className="flex w-full items-center justify-start gap-2" onClick={() => onAlign('justify')}>
                        <AlignJustify />
                        {t('align_justify')}
                    </Button>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            {/* Enlace */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-accent h-8 w-8"
                        title={t('insert_link')}
                        onClick={(e) => {
                            const selectedUrl = getSelectedUrl();

                            if (selectedUrl) {
                                e.preventDefault();
                                replaceSelection(`[${selectedUrl}](${selectedUrl})`);
                                return;
                            }
                        }}
                    >
                        <Link />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-4">
                    <form
                        className="flex w-64 flex-col gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyLink();
                        }}
                    >
                        {/* Campo texto */}
                        <Input
                            placeholder={t('link_text')}
                            value={linkData.text}
                            onChange={(e) => setLinkData((p) => ({ ...p, text: e.target.value }))}
                        />

                        {/* Campo URL */}
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={linkData.url}
                            onChange={(e) => setLinkData((p) => ({ ...p, url: e.target.value }))}
                        />

                        {/* Botón insertar enlace */}
                        <Button size="sm" type="submit" className="mt-2">
                            <Link2 className="mr-2 h-4 w-4" /> {t('insert_link')}
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>

            {/* Imagen */}
            <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        disabled={isImgUploading}
                        onClick={(e) => {
                            const selectedUrl = getSelectedUrl();

                            if (selectedUrl) {
                                e.preventDefault();
                                replaceSelection(`\n::image[${selectedUrl}]\n`);
                                return;
                            }

                            setIsImagePopoverOpen(true);
                        }}
                        title={t('insert_image')}
                        className="data-[state=open]:bg-accent h-8 w-8"
                    >
                        <Image />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-4">
                    <form
                        className="flex w-64 flex-col gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyImage();
                        }}
                    >
                        <div className="flex gap-2">
                            {/* Campo URL */}
                            <Input
                                type="url"
                                disabled={isImgUploading}
                                placeholder={'https://'}
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
                                {isImgUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload />}
                            </Button>

                            {/* Botón para abrir álbum */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t('open_uploads_history')}
                                onClick={() => {
                                    setMediaMode('image');
                                    setIsMediaDialogOpen(true);
                                }}
                            >
                                <History />
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

                        {/* Ancho / alto */}
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min="0"
                                placeholder={t('width')}
                                value={imageData.width}
                                onChange={(e) =>
                                    setImageData((p) => ({
                                        ...p,
                                        width: e.target.value,
                                    }))
                                }
                                className={noSpinButtonClassName}
                            />

                            <Input
                                type="number"
                                min="0"
                                placeholder={t('height')}
                                value={imageData.height}
                                onChange={(e) =>
                                    setImageData((p) => ({
                                        ...p,
                                        height: e.target.value,
                                    }))
                                }
                                className={noSpinButtonClassName}
                            />
                        </div>

                        {/* Botón insertar imagen */}
                        <Button type="submit" size="sm" className="mt-2" disabled={isImgUploading}>
                            <ImagePlus className="mr-2 h-4 w-4" /> {t('insert_image')}
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>

            {/* Video */}
            <Popover open={isVideoPopoverOpen} onOpenChange={setIsVideoPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        title={t('insert_video')}
                        className="data-[state=open]:bg-accent h-8 w-8"
                        onClick={(e) => {
                            const selectedUrl = getSelectedUrl();

                            if (selectedUrl) {
                                e.preventDefault();
                                replaceSelection(`\n::video[${selectedUrl}]\n`);
                                return;
                            }

                            setIsVideoPopoverOpen(true);
                        }}
                    >
                        <SquarePlay />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-4">
                    <form
                        className="flex w-64 flex-col gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyVideo();
                        }}
                    >
                        <div className="flex gap-2">
                            {/* Campo URL */}
                            <Input
                                type="url"
                                disabled={isVideoUploading}
                                placeholder={'https://'}
                                value={videoData.url}
                                onChange={(e) => setVideoData((p) => ({ ...p, url: e.target.value }))}
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
                                {isVideoUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload />}
                            </Button>

                            {/* Botón para abrir álbum */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t('open_uploads_history')}
                                onClick={() => {
                                    setMediaMode('video');
                                    setIsMediaDialogOpen(true);
                                }}
                            >
                                <History />
                            </Button>

                            {/* Input oculto */}
                            <input ref={videoFileInputRef} type="file" accept="video/mp4,video/webm" hidden onChange={onVideoFileSelected} />
                        </div>

                        {/* Ancho / alto */}
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min="0"
                                placeholder={t('width')}
                                value={videoData.width}
                                onChange={(e) =>
                                    setVideoData((p) => ({
                                        ...p,
                                        width: e.target.value,
                                    }))
                                }
                                className={noSpinButtonClassName}
                            />

                            <Input
                                type="number"
                                min="0"
                                placeholder={t('height')}
                                value={videoData.height}
                                onChange={(e) =>
                                    setVideoData((p) => ({
                                        ...p,
                                        height: e.target.value,
                                    }))
                                }
                                className={noSpinButtonClassName}
                            />
                        </div>

                        <Button size="sm" type="submit" className="mt-2">
                            <SquarePlay className="mr-2 h-4 w-4" /> {t('insert_video')}
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6" />

            {/* Emoji */}
            <Popover open={isEmojiPopoverOpen} onOpenChange={setIsEmojiPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" title={t('insert_emoji')} className="data-[state=open]:bg-accent h-8 w-8">
                        <Smile />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                    <EmojiPicker onSelect={onEmojiSelect} />
                </PopoverContent>
            </Popover>

            <MediaDialog
                open={isMediaDialogOpen}
                user={user}
                type={mediaMode || 'image'}
                onClose={() => {
                    setIsMediaDialogOpen(false);

                    if (mediaMode === 'image') {
                        setIsImagePopoverOpen(true);
                    }

                    if (mediaMode === 'video') {
                        setIsVideoPopoverOpen(true);
                    }

                    setMediaMode(null);
                }}
                onSelect={(url) => {
                    if (mediaMode === 'image') {
                        setImageData((prev) => ({
                            ...prev,
                            url,
                        }));
                        setIsImagePopoverOpen(true);
                    }

                    if (mediaMode === 'video') {
                        setVideoData((prev) => ({
                            ...prev,
                            url,
                        }));
                        setIsVideoPopoverOpen(true);
                    }
                }}
            />
        </div>
    );
}
