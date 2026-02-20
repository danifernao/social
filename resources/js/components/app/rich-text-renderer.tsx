import remarkCustomDirectives from '@/lib/remark-custom-directives';
import remarkHashtag from '@/lib/remark-hashtag';
import remarkMention from '@/lib/remark-mention';
import { cn } from '@/lib/utils';
import { EntryType } from '@/types';
import { Link } from '@inertiajs/react';
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';
import { Button } from '../ui/button';

interface RichTextRendererProps {
    // Tipo de entrada que define el contexto de menciones y hashtags.
    // Puede ser "post", "comment" o "page".
    entryType: EntryType | 'page';

    // Contenido de texto que será procesado y renderizado.
    text: string;

    // Fuerza que el contenido se muestre completamente expandido.
    alwaysExpanded?: boolean;

    // Inhabilita la navegación al hacer clic en enlaces.
    disableLinks?: boolean;
}

// Extiende los componentes de react-markdown para permitir directivas personalizadas.
type ExtendedComponents = Components & {
    [key: string]: React.ComponentType<any>;
};

/**
 * Componente encargado de renderizar texto enriquecido.
 *
 * - Interpreta Markdown limitado a ciertos elementos.
 * - Convierte menciones (@usuario) y hashtags (#tema) en enlaces.
 * - Interpreta directivas personalizadas.
 * - Limita la altura del contenido y muestra un botón "Leer más" si es necesario.
 */
export default function RichTextRenderer({ entryType, text, alwaysExpanded = false, disableLinks = false }: RichTextRendererProps) {
    // Función para traducir los textos de la interfaz.
    const { t } = useTranslation();

    // Referencia al contenedor del contenido renderizado.
    const contentRef = useRef<HTMLDivElement>(null);

    // Controla si el contenido se muestra expandido o contraído.
    const [expanded, setExpanded] = useState(false);

    // Determina si se debe mostrar el botón "Leer más".
    const [showExpandButton, setShowExpandButton] = useState(false);

    // Bandera mutable que indica que el contenido fue expandido
    // manualmente (por ejemplo, al mostrar contenido oculto),
    // evitando conflictos con el control automático de altura.
    const forceExpanded = useRef(false);

    // Clase base compartida por el contenedor del contenido.
    const baseClass = 'overflow-hidden transition-all duration-300';

    // Definición de componentes personalizados utilizados por react-markdown.
    const components: ExtendedComponents = {
        p: ({ node, children }) => <p className="mb-4 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        del: ({ children }) => <del className="line-through">{children}</del>,
        h1: ({ children }) => <h1 className="mb-4 text-xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-4 text-lg font-bold">{children}</h2>,

        // Renderiza enlaces internos con Inertia y enlaces externos
        // usando etiquetas <a> estándar.
        a: ({ href, node, children }) => {
            if (!href) return <>{children}</>;

            const handleClick: MouseEventHandler<Element> = (e) => {
                if (disableLinks) e.preventDefault();
            };

            if (href.startsWith('/')) {
                return (
                    <Link href={href ?? '#'} onClick={handleClick} className="text-blue-600 hover:underline">
                        {children}
                    </Link>
                );
            }
            return (
                <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        },

        // Renderiza imágenes optimizadas con carga diferida.
        img: ({ src, alt }) => (
            <img src={src ?? ''} alt={alt ?? ''} loading="lazy" className="mb-4 aspect-[4/3] h-auto max-w-full rounded last:mb-0" />
        ),

        hr: () => <hr className="my-4 border-t" />,

        blockquote: ({ children }) => <blockquote className="text-muted-foreground mb-4 border-l-4 pl-4 italic last:mb-0">{children}</blockquote>,

        pre({ children }) {
            return <pre className="bg-muted mb-4 overflow-x-auto rounded p-2 text-sm last:mb-0">{children}</pre>;
        },

        code({ children }) {
            return <code className="bg-muted rounded px-1 text-sm">{children}</code>;
        },

        ul: ({ children }) => <ul className="mb-4 list-inside list-disc pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-inside list-decimal pl-4 last:mb-0">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,

        // Maneja bloques de contenido oculto definidos mediante directivas.
        hidden: ({ type, children }) => {
            const [show, setShow] = useState(false);

            if (type === 'inline') {
                return (
                    <span
                        onClick={() => setShow(!show)}
                        className="cursor-pointer rounded bg-gray-800 px-1 transition-colors duration-300"
                        style={{ color: show ? undefined : '#1f2937' }}
                    >
                        {children}
                    </span>
                );
            }

            if (type === 'block') {
                return (
                    <div className="mb-4 last:mb-0">
                        <button
                            onClick={() => {
                                setShow(!show);
                                forceExpanded.current = true;
                            }}
                            className="text-blue-600 hover:underline"
                        >
                            {show ? t('hide_content') : t('show_hidden_content')}
                        </button>

                        {show && <div>{children}</div>}
                    </div>
                );
            }

            return <>{children}</>;
        },

        // Renderiza iframes embebidos (por ejemplo YouTube).
        iframe: ({ node, ...props }) => {
            const properties = node?.properties ?? {};
            const service = node?.properties?.['data-service'] || 'generic';

            const src = typeof properties.src === 'string' ? properties.src : undefined;
            const width = typeof properties.width === 'string' || typeof properties.width === 'number' ? properties.width : undefined;
            const height = typeof properties.height === 'string' || typeof properties.height === 'number' ? properties.height : undefined;

            return (
                <iframe
                    {...props}
                    src={src}
                    width={width ?? '100%'}
                    height={height ?? '315'}
                    allowFullScreen
                    loading="lazy"
                    className={cn('mb-4 aspect-video h-full w-full rounded border-0 last:mb-0', service === 'youtube' && 'bg-muted')}
                />
            );
        },
    };

    /**
     * Observa el tamaño del contenedor para determinar
     * si el contenido excede el límite visual permitido.
     * En ese caso, habilita el botón "Leer más".
     */
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        // Si se indicó explícitamente, fuerza la expansión completa.
        if (alwaysExpanded) {
            forceExpanded.current = true;
            setExpanded(true);
            return;
        }

        // Crea un observador para detectar cambios en el tamaño del contenedor.
        const observer = new ResizeObserver(() => {
            if (!forceExpanded.current) {
                if (el.scrollHeight > 600) {
                    setShowExpandButton(true);
                } else {
                    setShowExpandButton(false);
                }
            }
        });

        observer.observe(el);

        // Limpia el observador al desmontar el componente.
        return () => observer.disconnect();
    }, [text]);

    return (
        <div className="relative">
            {/* Contenedor del contenido con altura controlada */}
            <div ref={contentRef} className={cn(baseClass, expanded || forceExpanded.current ? 'max-h-full' : 'max-h-[600px]')}>
                <Markdown
                    remarkPlugins={[remarkBreaks, remarkDirective, remarkCustomDirectives, remarkMention, [remarkHashtag, { entryType }]]}
                    allowedElements={[
                        'p',
                        'span',
                        'br',
                        'strong',
                        'em',
                        'h1',
                        'h2',
                        'hr',
                        'a',
                        'img',
                        'blockquote',
                        'code',
                        'pre',
                        'ul',
                        'ol',
                        'li',
                        'hidden',
                        'iframe',
                        'video',
                    ]}
                    components={components}
                >
                    {text}
                </Markdown>
            </div>

            {/* Botón de expansión del contenido */}
            {!expanded && showExpandButton && (
                <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-black to-transparent p-4">
                    <Button variant="link" onClick={() => setExpanded(true)} className="mt-2 text-sm">
                        {t('read_more')}
                    </Button>
                </div>
            )}
        </div>
    );
}
