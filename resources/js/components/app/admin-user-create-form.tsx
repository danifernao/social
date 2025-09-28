import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FormErrors from './form-errors';

/**
 * Este componente representa un formulario para que un administrador
 * cree un nuevo usuario. Envía el correo electrónico del nuevo usuario
 * y la contraseña del administrador como confirmación.
 */
export default function AdminUserCreateForm() {
    // Se obtiene la función de traducción para internacionalización
    const { t } = useTranslation();

    // Se inicializa el formulario con los campos necesarios
    const form = useForm({
        email: '', // Correo electrónico del nuevo usuario
        admin_password: '', // Contraseña del administrador
    });

    // Función que se ejecuta al enviar el formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Se envía la información a la ruta nombrada en Laravel
        form.post(route('admin.user.store'));
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    {/* Se muestra el título del formulario traducido */}
                    <CardTitle>{t('createUser')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Se muestran los errores de validación */}
                    <FormErrors errors={form.errors} />

                    {/* Campo para ingresar el correo electrónico del nuevo usuario */}
                    <Input
                        type="email"
                        placeholder={t('email')}
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        disabled={form.processing}
                    />

                    <p className="text-muted-foreground text-sm italic">{t('createUserDescription')}</p>

                    {/* Campo para ingresar la contraseña del administrador */}
                    <p>{t('confirmActionDescription')}</p>

                    <Input
                        type="password"
                        placeholder={t('password')}
                        value={form.data.admin_password}
                        onChange={(e) => form.setData('admin_password', e.target.value)}
                        disabled={form.processing}
                    />

                    {/* Botón de acción */}
                    <Button type="submit" disabled={form.processing}>
                        {form.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('createUser')}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
