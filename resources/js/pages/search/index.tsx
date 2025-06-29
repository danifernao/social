import ListLoadMore from '@/components/content/list-load-more';
import SearchBar from '@/components/content/search-bar';
import SearchSearchResults from '@/components/content/search-results';
import { EntryListUpdateContext } from '@/contexts/entry-list-update-context';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import AppLayout from '@/layouts/app-layout';
import { AppContentLayout } from '@/layouts/app/app-content-layout';
import type { BreadcrumbItem, Post, SearchResults, SearchType, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PageProps {
    type: SearchType; // Tipo de búsqueda (publicación o usuario).
    query: string; // Término de búsqueda.
    results: SearchResults; // Resultados de la búsqueda.
    isHashtag: boolean; // Indica si la búsqueda es por etiqueta (hashtag).
    [key: string]: any;
}

/**
 * Muestra la página de resultados de una búsqueda o de una etiqueta.
 */
export default function Search() {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation('common');

    // Captura las propiedades de la página proporcionadas por Inertia.
    const { props } = usePage<PageProps>();

    // Estado local para el tipo de búsqueda ('post' o 'user') y el término de búsqueda.
    const [type, setType] = useState<SearchType>(props.type);
    const [query, setQuery] = useState(props.query);

    // Referencia para indicar cuándo se deben reiniciar los datos paginados al cambiar la búsqueda.
    const shouldReset = useRef(false);

    const {
        items: results, // Lista de los resultados.
        cursor, // Cursor para la siguiente página de resultados.
        processing, // Indica si se está cargando más resultados.
        loadMore, // Función para cargar más resultados.
        handleEntryChanges, // Función para actualizar la lista de publicaciones.
        resetProps, // Función para restablecer la lista y el cursor a sus valores iniciales.
    } = usePaginatedData<Post | User>({
        initialItems: props.results.data, // Lista inicial de resultados.
        initialCursor: props.results.meta.next_cursor, // Cursor inicial.
        fetchUrl: route('search.show', { type, query }), // Ruta para solicitar más resultados.
        propKey: 'results', // Nombre de la propiedad que devuelve Inertia con los datos a usar.
    });

    // Indica si la búsqueda es por etiqueta (hashtag).
    const isHashtag = props.isHashtag;

    // Ruta de navegación actual usada como migas de pan.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: isHashtag ? t('hashtag') : t('search'),
            href: route('search.show'),
        },
    ];

    // Función que se ejecuta al enviar una nueva búsqueda, actualizando tipo y consulta.
    const onSubmit = (newType: SearchType, newQuery: string) => {
        setType(newType);
        setQuery(newQuery);

        shouldReset.current = true;

        router.get(
            route('search.show'),
            { type: newType, query: newQuery },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['results'],
            },
        );
    };

    // Detecta cuándo se deben reiniciar los resultados paginados tras cambiar la búsqueda.
    useEffect(() => {
        if (shouldReset.current) {
            resetProps();
            shouldReset.current = false;
        }
    }, [props.results.data, props.results.meta.next_cursor]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buscar" />
            <AppContentLayout>
                {!isHashtag ? <SearchBar type={type} query={query} onSubmit={onSubmit} /> : <h2 className="text-2xl">#{query}</h2>}
                <EntryListUpdateContext.Provider value={handleEntryChanges}>
                    <SearchSearchResults results={type === 'post' ? (results as Post[]) : (results as User[])} />
                </EntryListUpdateContext.Provider>
                <ListLoadMore type="post" cursor={cursor} isProcessing={processing} onClick={loadMore} />
            </AppContentLayout>
        </AppLayout>
    );
}
