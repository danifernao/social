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
    // Función que se ejecuta al enviar la búsqueda.
    onSubmit: (type: SearchType, query: string) => void;
}

/**
 * Barra de búsqueda que permite filtrar publicaciones o usuarios.
 */
export default function SearchBar({ type, query, onSubmit }: SearchBarProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Tipos de búsqueda disponibles con su etiqueta visible.
    const searchTypes: SearchTypes[] = [
        { label: t('common.posts'), value: 'post' },
        { label: t('common.users'), value: 'user' },
    ];

    // Tipo de búsqueda inicial basado en las propiedades recibidas.
    const defaultType: SearchTypes = searchTypes.find((i) => i.value === type) || searchTypes[0];

    // Estado local del tipo de búsqueda seleccionado.
    const [searchType, setSearchType] = useState(defaultType);

    // Estado local del texto de búsqueda.
    const [searchQuery, setSearchQuery] = useState(query);

    // Ejecuta la búsqueda con los valores actuales.
    const handleSearch = () => {
        onSubmit(searchType.value, searchQuery);
    };

    return (
        <div className="flex items-center space-x-2">
            {/* Selector del tipo de búsqueda */}
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

            {/* Campo de texto para la búsqueda */}
            <Input
                placeholder={t('common.searchPlaceholder', { type: searchType.label.toLowerCase() })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
            />

            {/* Botón de enviar */}
            <Button onClick={handleSearch} aria-label="Buscar" variant="default">
                <Search />
            </Button>
        </div>
    );
}
