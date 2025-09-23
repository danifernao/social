import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Auth, User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import FormErrors from './form-errors';

interface AdminUserSettingsFormProps {
    user: User;
}

/**
 * Muestra el formulario para la gestión del usuario.
 */
export default function AdminUserSettingsForm({ user }: AdminUserSettingsFormProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Estado para controlar si el diálogo de confirmación está abierto.
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Estado para recordar qué acción está pendiente de confirmación.
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    // Estado para la contraseña del administrador que confirma la acción.
    const [adminPassword, setAdminPassword] = useState('');

    // Estado que refleja si el usuario está habilitado o no.
    const [isActive, setIsActive] = useState(user.is_active);

    const { data, setData, patch, errors, processing } = useForm({
        action: '',
        new_email: user.email,
        new_role: user.role,
        email_verification_link: false as boolean,
        pass_confirmation: '',
    });

    // Guarda temporalmente la acción solicitada y abre el diálogo de confirmación.
    const handleAction = (action: string) => {
        setPendingAction(action);
        setIsDialogOpen(true);
    };

    // Prepara los datos que se van a enviar y restablece estados por defecto.
    const confirmAction = () => {
        setData('pass_confirmation', adminPassword);
        setData('action', pendingAction ?? '');
        setIsDialogOpen(false);
        setAdminPassword('');
        setPendingAction(null);
    };

    // Envía los datos del formulario.
    const sendData = () => {
        patch(route('admin.user.update', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (data.action === 'toggle_account_status') {
                    setIsActive((prev) => !prev);
                }
                toast('¡Cambios guardados!');
            },
            onError: () => {
                document.documentElement.scrollIntoView();
            },
            onFinish: () => {
                setData('action', '');
            },
        });
    };

    // Envía los datos del formulario automáticamente cuando registra un cambio en la acción solicitada.
    useEffect(() => {
        if (data.action) {
            sendData();
        }
    }, [data.action]);

    return (
        <form className="space-y-8">
            <FormErrors errors={errors} />

            {/* Rol */}
            {auth.user.is_admin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('changeRole')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{t('changeRoleDescription')}</p>
                        <Select
                            value={data.new_role}
                            onValueChange={(value: 'user' | 'mod' | 'admin') => setData('new_role', value)}
                            disabled={processing}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">{t('administrator')}</SelectItem>
                                <SelectItem value="mod">{t('moderator')}</SelectItem>
                                <SelectItem value="user">{t('user')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="button" onClick={() => handleAction('change_role')} disabled={processing}>
                            {processing && data.action === 'change_role' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('change')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Información */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('resetInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t('resetInfoDescription')}</p>
                    <Button type="button" onClick={() => handleAction('reset_info')} disabled={processing}>
                        {processing && data.action === 'reset_info' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('reset')}
                    </Button>
                </CardContent>
            </Card>

            {/* Correo */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('changeEmail')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder={t('newEmail')}
                        value={data.new_email ?? ''}
                        onChange={(e) => setData('new_email', e.target.value)}
                        disabled={processing}
                    />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="email-verification-link"
                            checked={data.email_verification_link}
                            onCheckedChange={(checked) => setData('email_verification_link', !!checked)}
                            disabled={processing}
                        />
                        <label htmlFor="email-verification-link">{t('sendVerificationEmail')}</label>
                    </div>
                    <Button type="button" onClick={() => handleAction('change_email')} disabled={processing}>
                        {processing && data.action === 'change_email' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('change')}
                    </Button>
                </CardContent>
            </Card>

            {/* Contraseña */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('resetPassword')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t('resetUserPasswordDescription')}</p>
                    <Button type="button" onClick={() => handleAction('reset_password')} disabled={processing}>
                        {processing && data.action === 'reset_password' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('reset')}
                    </Button>
                </CardContent>
            </Card>

            {/* Habilitación / Inhabilitación de inicio de sesión */}
            <Card>
                <CardHeader>
                    <CardTitle>{isActive ? t('deactivateAccount') : t('activateAccount')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{isActive ? t('deactivateAccountDescription') : t('activateAccountDescription')}</p>
                    <Button type="button" onClick={() => handleAction('toggle_account_status')} disabled={processing}>
                        {processing && data.action === 'toggle_account_status' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {isActive ? t('deactivate') : t('activate')}
                    </Button>
                </CardContent>
            </Card>

            {/* Eliminación de cuenta */}
            {auth.user.is_admin && !user.is_admin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('deleteAccount')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{t('deleteUserAccountDescription')}</p>
                        <Button type="button" variant="destructive" onClick={() => handleAction('delete_account')} disabled={processing}>
                            {processing && data.action === 'delete_account' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('delete')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('confirmAction')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>{t('confirmActionDescription')}</p>
                        <Input type="password" placeholder="Contraseña" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={confirmAction} disabled={!adminPassword.trim()}>
                            {t('confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
