import remarkYoutube from '@/lib/remark-youtube';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import * as hashtag from 'linkify-plugin-hashtag';
import * as mention from 'linkify-plugin-mention';
import Linkify from 'linkify-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Button } from '../ui/button';

interface Props {
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
export default function FormattedText({ text }: Props) {
    // Obtiene las traducciones de la página.
    const { t } = useTranslation();

    // Referencia al contenedor que envuelve al texto.
    const contentRef = useRef<HTMLDivElement>(null);

    // Estado para controlar si el contenido está expandido o contraído.
    const [expanded, setExpanded] = useState(false);

    // Estado para mostrar u ocultar el botón de "Leer más".
    const [showExpand, setShowExpand] = useState(false);

    // Clase base para el contenedor.
    const baseClass = 'overflow-hidden transition-all duration-300';

    // Clase para los enlaces.
    const linkClass = 'text-blue-600 hover:underline';

    // Renderiza enlaces internos (menciones y etiquetas) usando el componente Link de Inertia.
    const renderInertiaLink = ({ attributes, content }: { attributes: any; content: React.ReactNode }) => {
        return (
            <Link href={attributes.href} className={linkClass}>
                {content}
            </Link>
        );
    };

    // Renderiza enlaces externos para abrir en una pestaña nueva.
    const renderExternalLink = ({ attributes, content }: { attributes: any; content: React.ReactNode }) => {
        return (
            <a href={attributes.href} className={linkClass} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    };

    // Opciones de configuración para Linkify.
    const options = {
        defaultProtocol: 'https', // Protocolo por defecto para URLs sin uno explícito.
        plugins: [mention, hashtag], // Plugins para detectar menciones y etiquetas.
        render: {
            mention: renderInertiaLink, // Menciones usan enlace interno.
            hashtag: renderInertiaLink, // Etiquetas usan enlace interno.
        },
        // Convierte el "href" según el tipo de enlace para generar rutas internas amigables.
        formatHref: (href: string, type: string) => {
            if (type === 'mention') return `/user/${href.substring(1)}`; // Quita el "@" y crea ruta a usuario.
            if (type === 'hashtag') return `/hashtag/${href.substring(1)}`; // Quita el "#" y crea ruta a etiqueta.
            return href; // Para URLs normales no cambia.
        },
    };

    // Define los componentes personalizados para la representación de Markdown.
    const components: ExtendedComponents = {
        p: ({ node, children }) => (
            <p className="mb-4 last:mb-0">
                <Linkify options={options}>{children}</Linkify>
            </p>
        ),
        a: ({ href, children }) => (
            <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
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
        youtube: ({ id }) => {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    allowFullScreen
                    loading="lazy"
                    className="mb-4 aspect-video h-full w-full rounded border-0 last:mb-0"
                />
            );
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
            if (el.scrollHeight > 300) {
                setShowExpand(true);
            } else {
                setShowExpand(false);
            }
        });

        observer.observe(el);

        // Limpia el observador al desmontar el componente para evitar fugas de memoria.
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            <div ref={contentRef} className={cn(baseClass, expanded ? 'max-h-full' : 'max-h-[300px]')}>
                <Markdown
                    remarkPlugins={[remarkBreaks, remarkYoutube]}
                    allowedElements={['p', 'a', 'br', 'strong', 'em', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'img', 'youtube']}
                    components={components}
                >
                    {text}
                </Markdown>
            </div>

            {!expanded && showExpand && (
                <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-black to-transparent p-4">
                    <Button variant="link" onClick={() => setExpanded(true)} className="mt-2 text-sm">
                        {t('readMore')}
                    </Button>
                </div>
            )}
        </div>
    );
}
