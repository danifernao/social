import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/kit/delete-user';
import HeadingSmall from '@/components/kit/heading-small';
import InputError from '@/components/kit/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/app/settings/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ProfileForm = {
    username: string;
    email: string;
    avatar: File | null;
    remove_avatar: boolean;
    _method: 'PATCH';
};

/**
 * Vista de configuración que permite al usuario autenticado
 * editar su perfil.
 */
export default function Profile() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura los datos compartidos del usuario autenticado desde Inertia.
    const { auth } = usePage<SharedData>().props;

    // URL actual del avatar del usuario.
    const avatarUrl = auth.user.avatar_url;

    // Estado local para previsualizar el avatar seleccionado.
    const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);

    // Referencia al campo de archivo para poder resetearlo manualmente.
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inicializa el formulario para la actualización de los datos del perfil.
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        username: auth.user.username,
        email: auth.user.email,
        avatar: null,
        remove_avatar: false,
        _method: 'PATCH',
    });

    // Gestiona el envío del formulario de edición de perfil.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });

        console.log(errors);
    };

    // Gestiona la selección de un nuevo archivo de avatar.
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Guarda el archivo en el estado del formulario.
            setData('avatar', file);
            setData('remove_avatar', false);

            // Genera una vista previa del avatar seleccionado.
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Marca el avatar actual para ser eliminado.
    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        setData('avatar', null);
        setData('remove_avatar', true);

        // Limpia manualmente el campo de archivo.
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Obtiene la inicial del nombre de usuario para mostrarla como avatar fallback.
    const getInitial = () => auth.user.username.charAt(0).toUpperCase();

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('profile_settings'),
            href: '/settings/profile',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('profile_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Encabezado descriptivo de la sección */}
                    <HeadingSmall title={t('profile_information')} description={t('update_profile_info')} />

                    {/* Formulario de edición del perfil */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Sección del avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-4xl font-bold text-black dark:bg-neutral-700 dark:text-white">
                                    {previewUrl ? <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" /> : getInitial()}
                                </div>

                                {/* Botón para eliminar el avatar existente */}
                                {previewUrl && avatarUrl && !data.remove_avatar && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-red-600"
                                        title={t('remove_avatar')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <Input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} ref={fileInputRef} />
                                <p className="text-muted-foreground text-sm">{t('avatar_file_requirements')}</p>
                                <InputError className="mt-2" message={errors.avatar} />
                            </div>
                        </div>

                        {/* Campo de nombre de usuario */}
                        <div className="grid gap-2">
                            <Label htmlFor="username">{t('username')}</Label>

                            <Input
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={t('username')}
                            />

                            <InputError className="mt-2" message={errors.username} />
                        </div>

                        {/* Campo de correo electrónico */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email_address')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder={t('email_address')}
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Botón para guardar los cambios */}
                            <Button disabled={processing}>{t('save')}</Button>

                            {/* Indicador visual de guardado exitoso */}
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">{t('changes_saved')}</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* Sección para eliminar la cuenta */}
                {!auth.user.is_admin && <DeleteUser />}
            </SettingsLayout>
        </AppLayout>
    );
}
