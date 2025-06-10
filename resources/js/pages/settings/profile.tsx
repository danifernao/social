import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/app/delete-user';
import HeadingSmall from '@/components/app/heading-small';
import InputError from '@/components/app/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración del perfil',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    username: string;
    email: string;
    avatar: File | null;
    remove_avatar: boolean;
    _method: 'PATCH';
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const avatarUrl = auth.user.avatar_url;
    const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        username: auth.user.username,
        email: auth.user.email,
        avatar: null,
        remove_avatar: false,
        _method: 'PATCH',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });

        console.log(errors);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setData('remove_avatar', false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        setData('avatar', null);
        setData('remove_avatar', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getInitial = () => auth.user.username.charAt(0).toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración del perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Información del perfil" description="Actualiza tu nombre de usuario y dirección de correo electrónico" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-4xl font-bold text-black dark:bg-neutral-700 dark:text-white">
                                    {previewUrl ? <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" /> : getInitial()}
                                </div>

                                {previewUrl && avatarUrl && !data.remove_avatar && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-red-600"
                                        title="Quitar avatar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <Input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} ref={fileInputRef} />
                                <p className="text-muted-foreground text-sm">Tamaño máximo: 2MB. Solo PNG o JPG.</p>
                                <InputError className="mt-2" message={errors.avatar} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">Nombre de usuario</Label>

                            <Input
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Nombre de usuario"
                            />

                            <InputError className="mt-2" message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Dirección de correo electrónico</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="Dirección de correo electrónico"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Tu dirección de correo electrónico no está verificada.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Haz clic aquí para reenviar el correo de verificación.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Guardar</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Guardado</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {!auth.user.is_admin && <DeleteUser />}
            </SettingsLayout>
        </AppLayout>
    );
}
