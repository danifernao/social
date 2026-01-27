import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Auth } from '@/types';
import { Locale } from '@/types/modules/locale';
import { Page, PageType, SpecialPages } from '@/types/modules/page';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import FormattedText from './formatted-text';
import FormattingToolbar from './formatting-toolbar';

interface Props {
    page?: Page; // Página opcional, si existe el formulario se usa en modo edición.
}

/**
 * Formulario para crear o editar una página estática.
 * Si recibe una página, precarga los campos y ajusta la petición para actualizar.
 * Si no recibe una página, el formulario crea una nueva.
 */
export default function AdminPageForm({ page }: Props) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la lista de idiomas, el usuario autenticado
    // y las páginas especiales proporcionados por Inertia.
    const { locales, auth, specialPages } = usePage<{ locales: Locale[]; auth: Auth; specialPages: SpecialPages }>().props;

    // Obtiene el código de idioma pasado como consulta por URL.
    const queryLang = new URLSearchParams(window.location.search).get('lang') ?? undefined;

    // Determina si el idioma obtenido desde la URL es válido.
    const isValidLang = queryLang ? locales.some(({ lang }) => lang === queryLang) : false;

    // Referencia al textarea del formulario.
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Estado para alternar entre edición y vista previa del contenido.
    const [previewMode, setPreviewMode] = useState(false);

    // Determina si el formulario está en modo edición.
    const isEditing = !!page;

    // Inicializa el estado del formulario usando el hook de Inertia.
    const { data, setData, post, patch, processing, errors } = useForm({
        language: page?.language ?? (isValidLang ? queryLang : auth.user.language),
        type: page?.type ?? 'normal',
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        content: page?.content ?? '',
    });

    // Gestiona el envío del formulario según el modo (creación o edición).
    const handleSubmit = (e: React.FormEvent) => {
        if (isEditing) {
            patch(route('admin.page.edit', page!.id), { preserveScroll: true });
        } else {
            post(route('admin.page.create'), { preserveScroll: true });
        }
        e.preventDefault();
    };

    // Actualiza el idioma seleccionado y sincroniza el parámetro en la URL.
    const handleLanguageChange = (lang: string) => {
        setData('language', lang);
        router.replace({
            url: `${window.location.pathname}?lang=${lang}`,
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    {/* Título del formulario */}
                    <CardTitle>{isEditing ? t('edit_page') : t('create_page')}</CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Selector de idioma */}
                    <div className="space-y-2 py-4">
                        <Label htmlFor="language" className="block text-sm font-medium">
                            {t('language')}
                        </Label>
                        <Select disabled={isEditing || processing} value={data.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger id="language" className="w-max">
                                <SelectValue placeholder={t('select_language')} />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map(({ lang, label }) => (
                                    <SelectItem key={lang} value={lang}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-sm italic">{t('language_cannot_be_changed')}</p>
                        {errors.language && <p className="text-sm text-red-500">{errors.language}</p>}
                    </div>

                    {/* Selector de tipo de página */}
                    <div className="space-y-2 py-4">
                        <Label htmlFor="type" className="block text-sm font-medium">
                            {t('type')}
                        </Label>
                        <Select disabled={processing} value={data.type} onValueChange={(value: PageType) => setData('type', value)}>
                            <SelectTrigger id="type" className="w-max">
                                <SelectValue placeholder={t('select_page_type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="normal">{t('normal_static_page')}</SelectItem>
                                <SelectItem value="about" disabled={!!specialPages[data.language!].about}>
                                    {t('about_us')}
                                </SelectItem>
                                <SelectItem value="terms" disabled={!!specialPages[data.language!].terms}>
                                    {t('terms_and_conditions')}
                                </SelectItem>
                                <SelectItem value="policy" disabled={!!specialPages[data.language!].policy}>
                                    {t('privacy_policy')}
                                </SelectItem>
                                <SelectItem value="guidelines" disabled={!!specialPages[data.language!].guidelines}>
                                    {t('community_guidelines')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-sm italic">{t('single_special_page_per_language')}</p>
                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>

                    {/* Campo de título */}
                    <div className="space-y-2 py-4">
                        <Label htmlFor="title" className="block text-sm font-medium">
                            {t('title')}
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('page_title')}
                            disabled={processing}
                            className="w-full max-w-xl"
                            required
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Campo de slug de URL */}
                    <div className="space-y-2 py-4">
                        <Label htmlFor="slug" className="block text-sm font-medium">
                            {t('slug')}
                        </Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            placeholder={t('page_url_slug')}
                            disabled={processing}
                            className="w-full max-w-xl"
                        />
                        <p className="text-muted-foreground text-sm italic">{t('empty_field_random_slug')}</p>
                        {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                    </div>

                    {/* Contenido de la página */}
                    <div className="space-y-2 py-4">
                        <Label htmlFor="content" className="block text-sm font-medium">
                            {t('content')}
                        </Label>

                        {previewMode ? (
                            // Modo previsualización
                            <div className="space-y-4">
                                {/* Vista previa del contenido formateado */}
                                <div className="bg-card text-card-foreground gap-6 rounded-xl border px-6 py-6 shadow-sm">
                                    <FormattedText entryType="page" text={data.content} alwaysExpanded={true} disableLinks={true} />
                                </div>

                                {/* Botón para volver al modo edición */}
                                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                                    {t('back_to_edit')}
                                </Button>
                            </div>
                        ) : (
                            // Modo creación o edición
                            <>
                                {/* Barra de herramientas de formato */}
                                <FormattingToolbar text={data.content} onChange={(val) => setData('content', val)} textareaRef={textareaRef} />

                                {/* Campo de texto principal */}
                                <TextareaAutosize
                                    ref={textareaRef}
                                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    minRows={1}
                                    value={data.content ?? ''}
                                    onChange={(e) => setData('content', e.target.value)}
                                    disabled={processing}
                                    placeholder={t('page_content')}
                                />

                                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}

                                {/* Acciones del formulario */}
                                <div className="flex items-center gap-4 py-4">
                                    {/* Botón de envío */}
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        {isEditing ? t('save') : t('create')}
                                    </Button>

                                    {/* Botón vista previa */}
                                    {data.content.trim().length > 0 && (
                                        <Button type="button" variant="outline" onClick={() => setPreviewMode(true)}>
                                            {t('preview')}
                                        </Button>
                                    )}

                                    {/* Botón cancelar */}
                                    <Button variant="ghost" size="sm" className="ml-auto" asChild>
                                        <Link href={route('admin.page.index', { lang: data.language })}>{t('cancel')}</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
