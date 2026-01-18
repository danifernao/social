import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface FormErrorsProps {
    // Conjunto de errores del formulario, indexados por nombre de campo.
    errors: Record<string, string>;
}

/**
 * Listado de errores producidos durante la validación de un formulario.
 */
export default function FormErrors({ errors }: FormErrorsProps) {
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
