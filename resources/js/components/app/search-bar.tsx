import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchType, SearchTypes } from '@/types';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SearchBarProps {
    type: SearchType; // Tipo de búsqueda inicial (publicación o usuario).
    query: string; // Consulta inicial de búsqueda.
    onSubmit: (type: SearchType, query: string) => void; //Función que se llama al realizar una búsqueda.
}

/**
 * Muestra una barra de búsqueda y permite buscar publicaciones o usuarios.
 */
export default function SearchBar({ type, query, onSubmit }: SearchBarProps) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Lista de tipos de búsqueda disponibles con etiquetas legibles para el usuario.
    const searchTypes: SearchTypes[] = [
        { label: t('posts'), value: 'post' },
        { label: t('users'), value: 'user' },
    ];

    // Tipo de búsqueda por defecto basado en las propiedades iniciales.
    const defaultType: SearchTypes = searchTypes.find((i) => i.value === type) || searchTypes[0];

    // Estado local del tipo de búsqueda actual.
    const [searchType, setSearchType] = useState(defaultType);

    // Estado local del texto ingresado por el usuario.
    const [searchQuery, setSearchQuery] = useState(query);

    /**
     * Envía los datos de la búsqueda al componente padre.
     */
    const handleSearch = () => {
        onSubmit(searchType.value, searchQuery);
    };

    return (
        <div className="flex items-center space-x-2">
            <Select value={searchType.value} onValueChange={(val) => setSearchType(searchTypes.find((s) => s.value === val)!)}>
                <SelectTrigger className="w-50">
                    <SelectValue placeholder={defaultType.label} />
                </SelectTrigger>
                <SelectContent>
                    {searchTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                placeholder={t('searchPlaceholder', { type: searchType.label.toLowerCase() })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
            />

            <Button onClick={handleSearch} aria-label="Buscar" variant="default">
                <Search />
            </Button>
        </div>
    );
}
