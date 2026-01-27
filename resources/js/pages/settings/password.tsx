import InputError from '@/components/kit/input-error';
import SettingsLayout from '@/layouts/app/settings/layout';
import AppLayout from '@/layouts/kit/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/kit/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

/**
 * Vista de configuración que permite al usuario cambiar su contraseña.
 */
export default function Password() {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Referencias a los campos de contraseña para control de foco en errores.
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Inicializa el formulario para la actualización de la contraseña.
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Envía la solicitud para actualizar la contraseña del usuario.
    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                // Si hay error en la nueva contraseña, limpia los campos y enfoca el input.
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                // Si hay error en la contraseña actual, limpia el campo y enfoca el input.
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    // Migas de pan de la vista actual.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('password_settings'),
            href: '/settings/password',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Título del documento */}
            <Head title={t('password_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Encabezado descriptivo de la sección */}
                    <HeadingSmall title={t('password_settings')} description={t('use_strong_random_password')} />

                    {/* Formulario para cambiar la contraseña */}
                    <form onSubmit={updatePassword} className="space-y-6">
                        {/* Campo de contraseña actual */}
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">{t('current_password')}</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder={t('current_password')}
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        {/* Campo de contraseña nueva */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('new_password')}</Label>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder={t('new_password')}
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Campo de confirmación de contraseña nueva */}
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">{t('confirm_password')}</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder={t('confirm_password')}
                            />

                            <InputError message={errors.password_confirmation} />
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
            </SettingsLayout>
        </AppLayout>
    );
}
