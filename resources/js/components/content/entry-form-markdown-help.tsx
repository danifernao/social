import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Muestra una ayuda contextual con las reglas básicas y ejemplos para
 * formatear texto utilizando Markdown en las publicaciones y comentarios.
 */
export function MarkdownHelp() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" className="text-muted-foreground p-0 text-sm">
                    ¿Cómo usar Markdown?
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] text-sm">
                <p className="mb-4">
                    Puedes usar <strong>Markdown</strong> para dar formato a tu texto:
                </p>
                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="pr-4 pb-2 text-left font-medium">Descripción</th>
                            <th className="pb-2 text-left font-medium">Ejemplo</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        <tr>
                            <td>Negrita:</td>
                            <td>
                                <code>**negrita**</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Cursiva:</td>
                            <td>
                                <code>*cursiva*</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Enlace:</td>
                            <td>
                                <code>[Descripción](URL)</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Cita:</td>
                            <td>
                                <code>&gt; cita</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Código en línea:</td>
                            <td>
                                <code>`código`</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Bloque de código:</td>
                            <td>
                                <code>```bloque```</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Lista enumerada:</td>
                            <td>
                                <code>1. Primer ítem</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Lista sin orden:</td>
                            <td>
                                <code>- Primer ítem</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Imagen:</td>
                            <td>
                                <code>![Descripción](URL)</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Video de YouTube:</td>
                            <td>
                                <code>[youtube:URL]</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
