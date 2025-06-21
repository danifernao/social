import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchType, SearchTypes } from '@/types';
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('common');

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

    // Estado que controla si el menú del tipo de búsqueda está abierto.
    const [open, setOpen] = useState(false);

    /**
     * Envía los datos de la búsqueda al componente padre.
     */
    const handleSearch = () => {
        onSubmit(searchType.value, searchQuery);
    };

    return (
        <div className="flex items-center space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40 justify-between">
                        {searchType.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-0">
                    <Command>
                        <CommandGroup>
                            {searchTypes.map((type) => (
                                <CommandItem
                                    key={type.value}
                                    onSelect={() => {
                                        setSearchType(type);
                                        setOpen(false);
                                    }}
                                >
                                    {type.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

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
