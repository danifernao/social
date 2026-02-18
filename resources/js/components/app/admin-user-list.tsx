import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCanActOnUser } from '@/hooks/app/use-auth';
import { formatDate } from '@/lib/utils';
import { User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SubmitEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminTablePagination from './admin-table-pagination';
import UserAvatar from './user-avatar';

interface Props {
    users: User[]; // Lista de usuarios.
    previous: string | null; // URL de la página anterior para la paginación.
    next: string | null; // URL de la página siguiente para la paginación.
}

/**
 * Listado de usuarios registrados para su administración.
 */
export default function AdminUserList({ users, previous, next }: Props) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Captura la URL actual proporcionada por Inertia.
    const { url } = usePage();

    // Obtiene los parámetros de la consulta actual (por ejemplo: ?query=user&orderBy=id)
    const queryParams = new URLSearchParams(url.split('?')[1]);

    // Nombre de la columna usada para el ordenamiento actual.
    const orderBy = queryParams.get('orderBy') || 'id';

    // Dirección actual de ordenamiento: ascendente o descendente.
    const orderDirection = queryParams.get('orderDirection') || 'desc';

    // Estado local para el término de búsqueda.
    const [query, setQuery] = useState(queryParams.get('query') || '');

    // Mapa de nombres legibles para cada rol de usuario.
    const roles = {
        admin: t('administrator'),
        mod: t('moderator'),
        user: t('user'),
    };

    // Gestiona el formulario de búsqueda.
    const handleSearch: SubmitEventHandler<HTMLFormElement> = (e) => {
        const params = new URLSearchParams();

        // Si hay texto de búsqueda, se incluye como parámetro.
        if (query) {
            params.set('query', query);
        }

        // Actualiza la URL y ejecuta una nueva visita con Inertia.
        router.visit(`?${params.toString()}`);

        e.preventDefault();
    };

    // Gestiona el orden de la columna.
    const handleSort = (field: string) => {
        // Invierte la dirección si se hace clic en la misma columna.
        const newDirection = orderBy === field && orderDirection === 'asc' ? 'desc' : 'asc';

        const params = new URLSearchParams();

        // Conserva el término de búsqueda activo si existe.
        if (query) {
            params.set('query', query);
        }

        // Define la columna de ordenamiento y la dirección.
        params.set('orderBy', field);
        params.set('orderDirection', newDirection);

        // Actualiza la URL y realiza la nueva solicitud.
        router.visit(`?${params.toString()}`);
    };

    // Devuelve el icono de orden según la columna activa y la dirección actual.
    const renderSortIcon = (field: string) => {
        if (orderBy !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4 opacity-20" />;
        }

        return orderDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />;
    };

    // Devuelve una clase de color si "value" tiene contenido.
    // Verde si el valor tiene contenido, rojo si no lo tiene.
    const addTextColor = (value: any = null) => {
        return !!value ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="w-full space-y-4">
            {/* Buscador de usuarios */}
            <form onSubmit={handleSearch}>
                <Input placeholder={t('search_by_username_or_id')} value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>

            {/* Tabla de usuarios */}
            <div className="rounded-md border">
                <Table>
                    {/* Cabecera de la tabla */}
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            {/* ID */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('id')}>
                                    {t('id')} {renderSortIcon('id')}
                                </Button>
                            </TableHead>

                            {/* Avatar */}
                            <TableHead>{t('avatar')}</TableHead>

                            {/* Nombre de usuario */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('username')}>
                                    {t('username')} {renderSortIcon('username')}
                                </Button>
                            </TableHead>

                            {/* Estado de verificación del correo */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('email_verified_at')}>
                                    {t('verified')} {renderSortIcon('email_verified_at')}
                                </Button>
                            </TableHead>

                            {/* Estado de la cuenta */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('is_active')}>
                                    {t('enabled')} {renderSortIcon('is_active')}
                                </Button>
                            </TableHead>

                            {/* Rol */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('role')}>
                                    {t('role')} {renderSortIcon('role')}
                                </Button>
                            </TableHead>

                            {/* Fecha de registro */}
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('created_at')}>
                                    {t('registered')} {renderSortIcon('created_at')}
                                </Button>
                            </TableHead>
                            {/* Acciones */}
                            <TableHead className="text-center">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id} className="[&_td]:px-4">
                                    {/* ID */}
                                    <TableCell>{user.id}</TableCell>

                                    {/* Avatar */}
                                    <TableCell>
                                        <UserAvatar user={user} />
                                    </TableCell>

                                    {/* Perfil del usuario */}
                                    <TableCell>
                                        <Link href={route('profile.show', user.id)}>{user.username}</Link>
                                    </TableCell>

                                    {/* Estado de verificación del correo */}
                                    <TableCell className={addTextColor(user.email_verified_at)}>
                                        {user.email_verified_at ? t('yes') : t('no')}
                                    </TableCell>

                                    {/* Estado de la cuenta */}
                                    <TableCell className={addTextColor(user.is_active)}>{user.is_active ? t('yes') : t('no')}</TableCell>

                                    {/* Rol */}
                                    <TableCell>{roles[user.role]}</TableCell>

                                    {/* Fecha de registro */}
                                    <TableCell>{formatDate(user.created_at)}</TableCell>

                                    {/* Acciones */}
                                    <TableCell className="text-center">
                                        {useCanActOnUser(user) ? (
                                            <Button variant="outline" asChild>
                                                <Link href={route('admin.user.edit', user.id)}>{t('manage')}</Link>
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">{t('no_permissions')}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="py-4 text-center">
                                    {t('no_results_found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <AdminTablePagination previous={previous} next={next} />
        </div>
    );
}
