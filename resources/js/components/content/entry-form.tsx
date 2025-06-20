import { Button } from '@/components/ui/button';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import type { Comment, Entry, Post } from '@/types';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { MarkdownHelp } from './entry-form-markdown-help';
import FormErrors from './form-errors';

interface EntryFormProps {
    entry?: Entry; // Una entrada existente, la cual puede ser una publicación o un comentario.
    postId?: number; // ID de una publicación, necesario si se desea crear un comentario.
    onSubmit?: () => void; // Función que se llama tras el envío exitoso del formulario.
}

/**
 * Muestra un formulario para la creación o edición de una entrada.
 */
export default function EntryForm({ entry, postId, onSubmit }: EntryFormProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    // Determina si el formulario es para una publicación o un comentario.
    const formType = entry ? (entry.type === 'post' ? 'post' : 'comment') : postId ? 'comment' : 'post';

    // Almacena temporalmente la entrada que retorna el envío del formulario.
    const [entryFromResponse, setEntryFromResponse] = useState<Entry>();

    // Hook de Inertia para gestionar datos del formulario, errores y estados.
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        content: '',
    });

    // Permite que otros componentes reflejen la creación o actualización de una entrada en su lista.
    const updateEntryList = useContext(EntryListUpdateContext);

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        // Decide si se debe hacer POST (crear) o PATCH (actualizar).
        // Si el componente recibe una entrada, se interpreta como edición; de lo contrario, como creación.
        const action = entry ? patch : post;

        /* Genera la ruta adecuada.
           Si se proporcionó una entrada:
              Se accede a la propiedad "type" para determinar su naturaleza y se interpreta como edición.
           De lo contrario:
              Si se proporciona el ID de una publicación:
                  Se interpreta como creación de un comentario.
              De lo contrario:
                  Se interpreta como creación de una publicación.
        */
        const url = entry
            ? route(entry.type === 'post' ? 'post.update' : 'comment.update', entry.type === 'post' ? { post: entry.id } : { comment: entry.id })
            : route(postId ? 'comment.create' : 'post.create', postId ? { post: postId } : undefined);

        action(url, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Obtiene la entrada nueva o actualizada.
                const pageProp = formType === 'post' ? (page.props.post as Post) : (page.props.comment as Comment);

                // Actualiza el estado local con la entrada obtenida.
                setEntryFromResponse(pageProp);

                // Limpia el contenido del formulario.
                setData('content', '');
            },
            onError: (errors) => {
                toast(t('error'));
                console.error(errors);
            },
        });

        e.preventDefault();
    };

    // Detecta si se recibió una nueva entrada tras el envío exitoso del formulario.
    useEffect(() => {
        if (entryFromResponse) {
            const action = entry ? 'update' : 'create';

            // Notifica al contexto que se ha creado o actualizado una entrada.
            updateEntryList?.(action, entryFromResponse);

            // Ejecuta el callback de confirmación, si existe.
            onSubmit?.();
        }
    }, [entryFromResponse]);

    // Si el componente recibe una entrada, carga su contenido.
    useEffect(() => {
        if (entry) {
            setData('content', entry.content);
        }
    }, [entry]);

    return (
        <form onSubmit={submitForm} className="space-y-3">
            <FormErrors errors={errors} />

            <TextareaAutosize
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                minRows={1}
                maxRows={10}
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                disabled={processing}
                placeholder={t('whatsOnYourMind')}
                maxLength={3000}
            />

            <div className="flex items-center gap-4">
                <MarkdownHelp />
                <Button type="submit" className="ml-auto" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {formType === 'post' ? t('createPost') : t('comment')}
                </Button>
            </div>
        </form>
    );
}
