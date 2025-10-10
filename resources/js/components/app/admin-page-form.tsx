import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Page } from '@/types/modules/page';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder={t('pageTitle')} />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2 py-4">
                        <Label htmlFor="slug" className="block text-sm font-medium">
                            {t('slug')}
                        </Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder={t('pageSlug')} />
                        {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                    </div>

                    <div className="space-y-2 py-4">
                        <Label htmlFor="content" className="block text-sm font-medium">
                            {t('content')}
                        </Label>
                        <Textarea
                            id="content"
                            value={data.content ?? ''}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder={t('pageContent')}
                            rows={8}
                        />
                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    </div>

                    <Button type="submit" className="mt-4 flex items-center justify-center gap-2" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {isEditing ? t('save') : t('create')}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
