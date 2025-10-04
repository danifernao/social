import remarkCustomDirectives from '@/lib/remark-custom-directives';
import remarkHashtag from '@/lib/remark-hashtag';
import remarkMention from '@/lib/remark-mention';
import { cn } from '@/lib/utils';
import { EntryType } from '@/types';
import { Link } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';
import { Button } from '../ui/button';

interface Props {
    entryType: EntryType; // Puede ser "post" o "comment".
    text: string; // El texto que será formateado y mostrado.
}

// Define un tipo que extienda Components permitiendo claves extra (como "youtube").
type ExtendedComponents = Components & {
    [key: string]: React.ComponentType<any>;
};

/**
 * Muestra un texto formateado:
 * - Interpreta Markdown limitado a ciertos elementos.
 * - Convierte menciones (@usuario), etiquetas (#tema) y direcciones web en enlaces.
 * - Muestra botón "Leer más" si el contenido excede 300px de alto para expandirlo.
 */
export default function FormattedText({ entryType, text }: Props) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Referencia al contenedor que envuelve al texto.
    const contentRef = useRef<HTMLDivElement>(null);

    // Estado para controlar si el contenido está expandido o contraído.
    const [expanded, setExpanded] = useState(false);

    // Estado para mostrar u ocultar el botón de "Leer más".
    const [showExpandButton, setShowExpandButton] = useState(false);

    // Se activa cuando el usuario abre un contenido oculto,
    // esto se hace para evitar conflictos con "Leer más".
    const forceExpanded = useRef(false);

    // Clase base para el contenedor.
    const baseClass = 'overflow-hidden transition-all duration-300';

    // Define los componentes personalizados para la representación de Markdown.
    const components: ExtendedComponents = {
        p: ({ node, children }) => <p className="mb-4 last:mb-0">{children}</p>,
        a: ({ href, node, children }) => {
            if (!href) return <>{children}</>;
            if (href.startsWith('/')) {
                return (
                    <Link href={href ?? '#'} className="text-blue-600 hover:underline">
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
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
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
        img: ({ src, alt }) => (
            <img src={src ?? ''} alt={alt ?? ''} loading="lazy" className="mb-4 aspect-[4/3] h-auto max-w-full rounded last:mb-0" />
        ),
        iframe: ({ node, ...props }) => {
            const src = node?.properties?.src;
            return (
                <iframe
                    {...props}
                    src={typeof src === 'string' ? src : undefined}
                    allowFullScreen
                    loading="lazy"
                    className="mb-4 aspect-video h-full w-full rounded border-0 last:mb-0"
                />
            );
        },
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
                            {show ? t('hideContent') : t('showContent')}
                        </button>
                        {show && <div>{children}</div>}
                    </div>
                );
            }

            return <>{children}</>;
        },
    };

    /**
     * Observa cambios en el tamaño del contenedor para decidir si mostrar el botón "Leer más".
     * Si la altura del contenedor es mayor a 300px, se activa el botón.
     */
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        // Crea un observador para detectar cambios en el tamaño del contenedor.
        const observer = new ResizeObserver(() => {
            if (!forceExpanded.current) {
                if (el.scrollHeight > 300) {
                    setShowExpandButton(true);
                } else {
                    setShowExpandButton(false);
                }
            }
        });

        observer.observe(el);

        // Limpia el observador al desmontar el componente para evitar fugas de memoria.
        return () => observer.disconnect();
    }, [text]);

    return (
        <div className="relative">
            <div ref={contentRef} className={cn(baseClass, expanded || forceExpanded.current ? 'max-h-full' : 'max-h-[300px]')}>
                <Markdown
                    remarkPlugins={[remarkBreaks, remarkDirective, remarkCustomDirectives, remarkMention, [remarkHashtag, { entryType }]]}
                    allowedElements={[
                        'p',
                        'a',
                        'span',
                        'br',
                        'strong',
                        'em',
                        'blockquote',
                        'code',
                        'pre',
                        'ul',
                        'ol',
                        'li',
                        'img',
                        'hidden',
                        'iframe',
                    ]}
                    components={components}
                >
                    {text}
                </Markdown>
            </div>

            {!expanded && showExpandButton && (
                <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-black to-transparent p-4">
                    <Button variant="link" onClick={() => setExpanded(true)} className="mt-2 text-sm">
                        {t('readMore')}
                    </Button>
                </div>
            )}
        </div>
    );
}
