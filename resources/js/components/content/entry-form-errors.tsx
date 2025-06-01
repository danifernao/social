import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface EntryFormErrorsProps {
    errors: Record<string, string>;
}

/**
 * Lista los errores presentados al diligenciar un formulario.
 */
export default function EntryFormErrors({ errors }: EntryFormErrorsProps) {
    return (
        <>
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>¡Ups!</AlertTitle>
                    <AlertDescription>
                        <ul>
                            {Object.entries(errors).map(([key, message]) => (
                                <li key={key}>{message as string}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}
