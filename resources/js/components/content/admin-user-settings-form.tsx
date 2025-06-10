import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Auth, User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    // Accede al usuario autenticado proporcionado por Inertia.
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
        pass_reset_link: false as boolean,
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
        patch(route('admin.user.update', user.username), {
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
                        <CardTitle>Cambiar rol</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Establece si el usuario es administrador, moderador o un usuario regular.</p>
                        <Select
                            value={data.new_role}
                            onValueChange={(value: 'user' | 'mod' | 'admin') => setData('new_role', value)}
                            disabled={processing}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="mod">Moderador</SelectItem>
                                <SelectItem value="user">Usuario</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="button" onClick={() => handleAction('change_role')} disabled={processing}>
                            {processing && data.action === 'change_role' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Cambiar
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Información */}
            <Card>
                <CardHeader>
                    <CardTitle>Restablecer información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Elimina el avatar actual y reemplaza el nombre de usuario por uno aleatorio.</p>
                    <Button type="button" onClick={() => handleAction('reset_info')} disabled={processing}>
                        {processing && data.action === 'reset_info' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Restablecer
                    </Button>
                </CardContent>
            </Card>

            {/* Correo */}
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar correo electrónico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Nuevo correo electrónico"
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
                        <label htmlFor="email-verification-link">Enviar correo electrónico de verificación de cuenta.</label>
                    </div>
                    <Button type="button" onClick={() => handleAction('change_email')} disabled={processing}>
                        {processing && data.action === 'change_email' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Cambiar
                    </Button>
                </CardContent>
            </Card>

            {/* Contraseña */}
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Cambia la contraseña por una aleatoria y cierra todas las sesiones.</p>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="pass-reset-link"
                            checked={data.pass_reset_link}
                            onCheckedChange={(checked) => setData('pass_reset_link', !!checked)}
                            disabled={processing}
                        />
                        <label htmlFor="pass-reset-link">Enviar correo electrónico de restablecimiento de contraseña.</label>
                    </div>
                    <Button type="button" onClick={() => handleAction('reset_password')} disabled={processing}>
                        {processing && data.action === 'reset_password' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Cambiar
                    </Button>
                </CardContent>
            </Card>

            {/* Habilitación / Inhabilitación de inicio de sesión */}
            <Card>
                <CardHeader>
                    <CardTitle>{isActive ? 'Inhabilitar' : 'Habilitar'} cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        {isActive ? 'Inhabilita el inicio de sesión y borra las sesiones existentes' : 'Habilita el inicio de sesión'} de la cuenta de
                        usuario.
                    </p>
                    <Button type="button" onClick={() => handleAction('toggle_account_status')} disabled={processing}>
                        {processing && data.action === 'toggle_account_status' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {isActive ? 'Inhabilitar' : 'Habilitar'}
                    </Button>
                </CardContent>
            </Card>

            {/* Eliminación de cuenta */}
            {auth.user.is_admin && !user.is_admin && (
                <Card>
                    <CardHeader>
                        <CardTitle>Eliminar cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Elimina la cuenta de usuario y todos los datos asociados a ella.</p>
                        <Button type="button" variant="destructive" onClick={() => handleAction('delete_account')} disabled={processing}>
                            {processing && data.action === 'delete_account' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Eliminar
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar acción</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Para continuar, ingresa tu contraseña de administrador.</p>
                        <Input type="password" placeholder="Contraseña" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmAction} disabled={!adminPassword.trim()}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
