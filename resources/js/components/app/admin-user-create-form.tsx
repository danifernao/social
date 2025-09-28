import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FormErrors from './form-errors';

/**
 * Muestra el formulario para la creación de un nuevo usuario.
 */
export default function AdminUserCreateForm() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    const form = useForm({
        email: '',
        privileged_password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        form.post(route('admin.user.store'));
        e.preventDefault();
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <Card className="gap-4">
                <CardHeader>
                    <CardTitle>{t('createUser')}</CardTitle>
                    <CardDescription>{t('createUserDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormErrors errors={form.errors} />

                    <div className="space-y-2 py-4">
                        <label className="block text-sm font-medium">{t('email')}</label>
                        <Input
                            type="email"
                            placeholder={t('email')}
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            disabled={form.processing}
                        />
                        <p className="text-muted-foreground text-sm italic">{t('userPasswordSetupNotice')}</p>
                    </div>

                    <div className="space-y-2 py-4">
                        <label className="block text-sm font-medium">{t('confirmAction')}</label>
                        <Input
                            type="password"
                            placeholder={t('password')}
                            value={form.data.privileged_password}
                            onChange={(e) => form.setData('privileged_password', e.target.value)}
                            disabled={form.processing}
                        />
                        <p className="text-muted-foreground text-sm italic">{t('confirmActionDescription')}</p>
                    </div>

                    <Button type="submit" disabled={form.processing} className="mt-4 flex items-center justify-center gap-2">
                        {form.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('createUser')}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
