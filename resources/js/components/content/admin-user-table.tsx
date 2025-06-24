import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Auth, User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserAvatar from './user-avatar';

interface Props {
    users: User[]; // Lista de usuarios a mostrar.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Lista a todos los usuarios registrados en la red para su administración.
 */
export default function AdminUserTable({ users, previous, next }: Props) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    // Captura la URL de la página y el usuario autenticado proporcionados por Inertia.
    const {
        url,
        props: { auth },
    } = usePage<{ auth: Auth }>();

    // Obtiene los parámetros de la consulta actual (por ejemplo, ?query=user&orderBy=id).
    const queryParams = new URLSearchParams(url.split('?')[1]);

    // Nombre de la columna usada para el ordenamiento actual.
    const orderBy = queryParams.get('orderBy') || 'username';

    // Dirección actual de ordenamiento: ascendente o descendente.
    const orderDirection = queryParams.get('orderDirection') || 'asc';

    // Estado local para el término de búsqueda.
    const [query, setQuery] = useState(queryParams.get('query') || '');

    // Nombres para cada rol de usuario.
    const roles = {
        admin: t('administrator'),
        mod: t('moderator'),
        user: t('user'),
    };

    // Gestiona el formulario de búsqueda.
    const handleSearch = (e: React.FormEvent) => {
        const params = new URLSearchParams();

        // Si hay texto de búsqueda, se incluye como parámetro.
        if (query) {
            params.set('query', query);
        }

        // Se actualiza la URL y se realiza una nueva solicitud Inertia.
        router.visit(`?${params.toString()}`);

        e.preventDefault();
    };

    // Gestiona el orden de la columna.
    const handleSort = (field: string) => {
        // Se invierte la dirección actual si la columna no ha cambiado.
        const newDirection = orderBy === field && orderDirection === 'asc' ? 'desc' : 'asc';

        const params = new URLSearchParams();

        // Si hay término de búsqueda activo, se conserva.
        if (query) {
            params.set('query', query);
        }

        // Se agrega el campo por el cual se ordena y la nueva dirección.
        params.set('orderBy', field);
        params.set('orderDirection', newDirection);

        // Se actualiza la URL y se realiza una nueva solicitud Inertia.
        router.visit(`?${params.toString()}`);
    };

    // Convierte una fecha ISO en formato corto y legible.
    const formatDate = (date: string) => {
        return format(parseISO(date), 'dd/MM/yyyy h:mm a');
    };

    // Determina si el usuario autenticado puede administrar al usuario especificado.
    // No permite la acción en los siguientes casos:
    //    - Es el mismo usuario.
    //    - El usuario especificado es administrador, pero el autenticado no.
    const canActOnUser = (user: User) => {
        const isAllowed = auth.user.id !== user.id && (auth.user.is_admin || !user.is_admin);
        return isAllowed;
    };

    // Devuelve una clase de color si "value" tiene contenido.
    // Verde si el valor tiene contenido, rojo si no lo tiene.
    const addTextColor = (value: any = null) => {
        return !!value ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="w-full space-y-4">
            {/* Buscador */}
            <form onSubmit={handleSearch}>
                <Input placeholder={t('searchUserPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('id')}>
                                    {t('id')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>{t('avatar')}</TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('username')}>
                                    {t('username')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('email_verified_at')}>
                                    {t('verified')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('is_active')}>
                                    {t('enabled')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('role')}>
                                    {t('role')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('created_at')}>
                                    {t('registered')} <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id} className="[&_td]:px-4">
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>
                                        <UserAvatar user={user} />
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell className={addTextColor(user.email_verified_at)}>
                                        {user.email_verified_at ? t('yes') : t('no')}
                                    </TableCell>
                                    <TableCell className={addTextColor(user.is_active)}>{user.is_active ? t('yes') : t('no')}</TableCell>
                                    <TableCell>{roles[user.role]}</TableCell>
                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                    <TableCell>
                                        {canActOnUser(user) && (
                                            <Button variant="outline" asChild>
                                                <Link href={user.id.toString()}>{t('manage')}</Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-4 text-center">
                                    {t('noResults')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex justify-end gap-2">
                {previous ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={previous}>{t('previous')}</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        {t('previous')}
                    </Button>
                )}

                {next ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={next}>{t('next')}</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        {t('next')}
                    </Button>
                )}
            </div>
        </div>
    );
}
