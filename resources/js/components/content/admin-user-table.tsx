import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Auth, User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
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
    // Accede al URL de la página y al usuario autenticado proporcionados por Inertia.
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
                <Input placeholder="Buscar por username o ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </form>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="[&_button]:px-0 [&_th]:px-4">
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('id')}>
                                    ID <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Avatar</TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('username')}>
                                    Username <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('email_verified_at')}>
                                    Verificado <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('is_active')}>
                                    Habilitado <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('role')}>
                                    Rol <ArrowUpDown className="ml-1 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="link" onClick={() => handleSort('created_at')}>
                                    Registrado <ArrowUpDown className="ml-1 h-4 w-4" />
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
                                    <TableCell className={addTextColor(user.email_verified_at)}>{user.email_verified_at ? 'Sí' : 'No'}</TableCell>
                                    <TableCell className={addTextColor(user.is_active)}>{user.is_active ? 'Sí' : 'No'}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                    <TableCell>
                                        {canActOnUser(user) && (
                                            <Button variant="outline" asChild>
                                                <Link href={user.id.toString()}>Administrar</Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-4 text-center">
                                    No se encontraron resultados.
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
                        <Link href={previous}>Anterior</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Anterior
                    </Button>
                )}

                {next ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={next}>Siguiente</Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        Siguiente
                    </Button>
                )}
            </div>
        </div>
    );
}
