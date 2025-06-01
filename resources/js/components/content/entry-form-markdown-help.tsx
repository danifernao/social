import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
                            <th className="pr-4 pb-2 text-left font-medium">Sintaxis</th>
                            <th className="pb-2 text-left font-medium">Ejemplo</th>
                        </tr>
                    </thead>
                    <tbody className="[&_td]:py-1 [&_td]:pr-4 [&_td]:align-top">
                        <tr>
                            <td>
                                <code>**negrita**</code>
                            </td>
                            <td>
                                <strong>negrita</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>*cursiva*</code>
                            </td>
                            <td>
                                <em>cursiva</em>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>&gt; cita</code>
                            </td>
                            <td>
                                <blockquote className="text-muted-foreground border-l-2 pl-2 italic">cita</blockquote>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>`código`</code>
                            </td>
                            <td>
                                <code className="bg-muted rounded px-1">código</code>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>```bloque```</code>
                            </td>
                            <td>
                                <pre className="bg-muted rounded p-1 text-sm">bloque</pre>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>1. Lista numerada</code>
                            </td>
                            <td>
                                <ol className="list-inside list-decimal pl-4">
                                    <li>Elemento</li>
                                </ol>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>- Lista sin orden</code>
                            </td>
                            <td>
                                <ul className="list-inside list-disc pl-4">
                                    <li>Elemento</li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <code>![alt](url)</code>
                            </td>
                            <td>
                                <img src="https://placehold.co/100x40" alt="Ejemplo" className="max-w-[100px] rounded" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </PopoverContent>
        </Popover>
    );
}
