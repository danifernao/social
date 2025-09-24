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
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
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
        new_username: user.username,
        new_email: user.email,
        new_role: user.role,
        email_verification_link: false as boolean,
        random_password: false as boolean,
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
            onSuccess: (page) => {
                switch (data.action) {
                    case 'toggle_account_status':
                        setIsActive((prev) => !prev);
                        break;
                    case 'change_username':
                        const typedPage = page as unknown as { props: { user: User } };
                        setData('new_username', typedPage.props.user.username);
                        break;
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

            {/* Avatar */}
            {user.avatar_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('deleteAvatar')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <img src={user.avatar_url} alt="Avatar" className="h-24 w-24 rounded-sm bg-neutral-200 object-cover" />
                        <Button type="button" onClick={() => handleAction('delete_avatar')} disabled={processing}>
                            {processing && data.action === 'delete_avatar' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('delete')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Nombre de usuario */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('changeUsername')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder={t('username')}
                        value={data.new_username}
                        onChange={(e) => setData('new_username', e.target.value)}
                        disabled={processing}
                    />
                    <p className="text-muted-foreground text-sm italic">{t('changeUsernameDescription')}</p>
                    <Button type="button" onClick={() => handleAction('change_username')} disabled={processing}>
                        {processing && data.action === 'change_username' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('change')}
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
                        value={data.new_email}
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
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reset-pasaword"
                            checked={data.random_password}
                            onCheckedChange={(checked) => setData('random_password', !!checked)}
                            disabled={processing}
                        />
                        <label htmlFor="reset-password">{t('useRandomPassword')}</label>
                    </div>
                    <Button type="button" onClick={() => handleAction('reset_password')} disabled={processing}>
                        {processing && data.action === 'reset_password' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('reset')}
                    </Button>
                </CardContent>
            </Card>

            {/* Habilitación / Inhabilitación de la cuenta */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accountStatus')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={isActive ? 'true' : 'false'}
                            onValueChange={() => handleAction('toggle_account_status')}
                            aria-label="Status"
                            variant="outline"
                        >
                            <ToggleGroupItem value="true" aria-label="Habilitado">
                                Habilitado
                            </ToggleGroupItem>
                            <ToggleGroupItem value="false" aria-label="Inhabilitado">
                                Inhabilitado
                            </ToggleGroupItem>
                        </ToggleGroup>
                        {processing && data.action === 'toggle_account_status' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className="text-muted-foreground text-sm italic">{t('accountStatusDescription')}</p>
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
