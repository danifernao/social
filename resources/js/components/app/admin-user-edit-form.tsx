import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminActionForm } from '@/hooks/app/use-admin-action-form';
import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '../ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import ConfirmActionDialog from './admin-confirm-action-dialog';
import FormErrors from './form-errors';

interface AdminUserEditFormProps {
    user: User;
}

/**
 * Muestra el formulario para la gestión del usuario.
 */
export default function AdminUserEditForm({ user }: AdminUserEditFormProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Captura el usuario autenticado proporcionado por Inertia.
    const { auth } = usePage<{ auth: Auth }>().props;

    // Estado que refleja si el usuario está habilitado o no.
    const [isActive, setIsActive] = useState(user.is_active);

    // Envía los datos del formulario.
    const { form, handleAction, confirmAction, isDialogOpen, closeDialog } = useAdminActionForm({
        initialData: {
            new_username: user.username,
            new_email: user.email,
            new_role: user.role,
            email_verification_link: false,
            random_password: false,
        },
        route: () => route('admin.user.update', user.id),
        onSuccess: (action, page) => {
            switch (action) {
                case 'toggle_account_status':
                    setIsActive((prev) => !prev);
                    break;
                case 'change_username':
                    const typedPage = page as unknown as { props: { user: User } };
                    form.setData((prev) => ({ ...prev, new_username: typedPage.props.user.username }));
                    break;
            }
        },
    });

    return (
        <form className="space-y-8">
            {/* Rol */}
            {auth.user.is_admin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.user.edit.role.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.data.action === 'change_role' && <FormErrors errors={form.errors} />}

                        <Select
                            value={form.data.new_role}
                            onValueChange={(value: 'user' | 'mod' | 'admin') => form.setData('new_role', value)}
                            disabled={form.processing && form.data.action === 'change_role'}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('admin.user.edit.role.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">{t('userRoles.admin.long')}</SelectItem>
                                <SelectItem value="mod">{t('userRoles.mod.long')}</SelectItem>
                                <SelectItem value="user">{t('userRoles.user.long')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <dl className="text-muted-foreground grid grid-cols-[min-content_1fr] gap-2 text-sm">
                            {Object.entries(t('admin.user.edit.role.description', { returnObjects: true })).map(([role, description]) => (
                                <Fragment key={role}>
                                    <dt className="font-semibold">{role}:</dt>
                                    <dd>{description}</dd>
                                </Fragment>
                            ))}
                        </dl>

                        <Button
                            type="button"
                            onClick={() => handleAction('change_role')}
                            disabled={form.processing && form.data.action === 'change_role'}
                        >
                            {form.processing && form.data.action === 'change_role' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('common.change')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Avatar */}
            {user.avatar_url && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.user.edit.avatar.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.data.action === 'delete_avatar' && <FormErrors errors={form.errors} />}
                        <div className="flex items-center gap-4">
                            <img src={user.avatar_url} alt={t('common.avatar')} className="h-24 w-24 rounded-sm bg-neutral-200 object-cover" />
                            <Button
                                type="button"
                                onClick={() => handleAction('delete_avatar')}
                                disabled={form.processing && form.data.action === 'delete_avatar'}
                            >
                                {form.processing && form.data.action === 'delete_avatar' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                {t('common.delete')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Nombre de usuario */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.user.edit.username.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.data.action === 'change_username' && <FormErrors errors={form.errors} />}
                    <Input
                        placeholder={t('common.username')}
                        value={form.data.new_username}
                        onChange={(e) => form.setData('new_username', e.target.value)}
                        disabled={form.processing && form.data.action === 'change_username'}
                    />
                    <p className="text-muted-foreground text-sm italic">{t('admin.user.edit.username.notice')}</p>
                    <Button
                        type="button"
                        onClick={() => handleAction('change_username')}
                        disabled={form.processing && form.data.action === 'change_username'}
                    >
                        {form.processing && form.data.action === 'change_username' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.change')}
                    </Button>
                </CardContent>
            </Card>

            {/* Correo */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.user.edit.email.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.data.action === 'change_email' && <FormErrors errors={form.errors} />}

                    <Input
                        placeholder={t('common.newEmail')}
                        value={form.data.new_email}
                        onChange={(e) => form.setData('new_email', e.target.value)}
                        disabled={form.processing && form.data.action === 'change_email'}
                    />

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="email-verification-link"
                            checked={form.data.email_verification_link}
                            onCheckedChange={(checked) => form.setData('email_verification_link', !!checked)}
                            disabled={form.processing && form.data.action === 'change_email'}
                        />
                        <label htmlFor="email-verification-link">{t('admin.user.edit.email.sendVerificationEmail')}</label>
                    </div>

                    <Button
                        type="button"
                        onClick={() => handleAction('change_email')}
                        disabled={form.processing && form.data.action === 'change_email'}
                    >
                        {form.processing && form.data.action === 'change_email' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.change')}
                    </Button>
                </CardContent>
            </Card>

            {/* Contraseña */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.user.edit.resetPassword.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.data.action === 'reset_password' && <FormErrors errors={form.errors} />}
                    <p>{t('admin.user.edit.resetPassword.description')}</p>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reset-password"
                            checked={form.data.random_password}
                            onCheckedChange={(checked) => form.setData('random_password', !!checked)}
                            disabled={form.processing && form.data.action === 'reset_password'}
                        />
                        <label htmlFor="reset-password">{t('admin.user.edit.resetPassword.useRandomPass')}</label>
                    </div>
                    <Button
                        type="button"
                        onClick={() => handleAction('reset_password')}
                        disabled={form.processing && form.data.action === 'reset_password'}
                    >
                        {form.processing && form.data.action === 'reset_password' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('common.reset')}
                    </Button>
                </CardContent>
            </Card>

            {/* Habilitación / Inhabilitación de la cuenta */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.user.edit.status.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.data.action === 'toggle_account_status' && <FormErrors errors={form.errors} />}
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={String(isActive)}
                            onValueChange={(value) => {
                                if (value) {
                                    handleAction('toggle_account_status');
                                }
                            }}
                            variant="outline"
                            disabled={form.processing && form.data.action === 'toggle_account_status'}
                        >
                            <ToggleGroupItem value="true">{t('common.enabled')}</ToggleGroupItem>
                            <ToggleGroupItem value="false">{t('common.disabled')}</ToggleGroupItem>
                        </ToggleGroup>
                        {form.processing && form.data.action === 'toggle_account_status' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className="text-muted-foreground text-sm italic">{t('admin.user.edit.status.notice')}</p>
                </CardContent>
            </Card>

            {/* Eliminación de cuenta */}
            {auth.user.is_admin && !user.is_admin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin.user.edit.deleteAccount.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.data.action === 'delete_account' && <FormErrors errors={form.errors} />}
                        <p>{t('admin.user.edit.deleteAccount.description')}</p>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleAction('delete_account')}
                            disabled={form.processing && form.data.action === 'delete_account'}
                        >
                            {form.processing && form.data.action === 'delete_account' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {t('common.delete')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Confirmación de la acción */}
            <ConfirmActionDialog
                open={isDialogOpen}
                onOpenChange={closeDialog}
                password={form.data.privileged_password}
                onPasswordChange={(value) => form.setData('privileged_password', value)}
                onConfirm={confirmAction}
            />
        </form>
    );
}
