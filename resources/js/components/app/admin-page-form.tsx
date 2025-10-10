import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Page } from '@/types/modules/page';
import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import FormattedText from './formatted-text';
import FormattingToolbar from './formatting-toolbar';

interface Props {
    page?: Page; // Página opcional, si existe el formulario se usa en modo edición.
}

/**
 * Formulario para crear o editar una página informativa.
 * Si recibe una página, precarga los campos y ajusta la petición para actualizar.
 * Si no recibe una página, el formulario crea una nueva.
 */
export default function AdminPageForm({ page }: Props) {
    // Obtiene las traducciones de la aplicación.
    const { t } = useTranslation();

    // Referencia al elemento textarea del formulario.
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Estado para alternar vista previa.
    const [previewMode, setPreviewMode] = useState(false);

    // Determina si el formulario está en modo edición.
    const isEditing = !!page;

    // Inicializa el estado del formulario usando el hook de Inertia.
    const { data, setData, post, patch, processing, errors } = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        content: page?.content ?? '',
    });

    /**
     * Gestiona el envío del formulario, enviando la petición adecuada según el modo.
     */
    const handleSubmit = (e: React.FormEvent) => {
        if (isEditing) {
            patch(route('admin.page.edit', page!.id));
        } else {
            post(route('admin.page.create'));
        }

        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? t('editPage') : t('createPage')}</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="title" className="block text-sm font-medium">
                            {t('title')}
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('pageTitle')}
                            disabled={processing}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2 py-4">
                        <Label htmlFor="slug" className="block text-sm font-medium">
                            {t('slug')}
                        </Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            placeholder={t('pageSlug')}
                            disabled={processing}
                        />
                        {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                    </div>

                    <div className="space-y-2 py-4">
                        <Label htmlFor="content" className="block text-sm font-medium">
                            {t('content')}
                        </Label>

                        {previewMode ? (
                            <div className="space-y-4">
                                <div className="bg-card text-card-foreground gap-6 rounded-xl border px-6 py-6 shadow-sm">
                                    <FormattedText entryType="page" text={data.content} alwaysExpanded={true} disableLinks={true} />
                                </div>
                                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                                    {t('backToEdit')}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <FormattingToolbar text={data.content} onChange={(val) => setData('content', val)} textareaRef={textareaRef} />

                                <TextareaAutosize
                                    ref={textareaRef}
                                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    minRows={1}
                                    value={data.content ?? ''}
                                    onChange={(e) => setData('content', e.target.value)}
                                    disabled={processing}
                                    placeholder={t('pageContent')}
                                />

                                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}

                                <div className="flex items-center gap-4 py-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        {isEditing ? t('save') : t('create')}
                                    </Button>

                                    {data.content.trim().length > 0 && (
                                        <Button type="button" variant="outline" onClick={() => setPreviewMode(true)}>
                                            {t('preview')}
                                        </Button>
                                    )}

                                    <Button variant="ghost" size="sm" className="ml-auto" asChild>
                                        <Link href={route('admin.page.index')}>{t('cancel')}</Link>
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
