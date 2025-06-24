import { EntryAction } from '@/types';
import { createContext } from 'react';

// Crea un contexto llamado "EntryListUpdateContext" que se usará para propagar
// una función encargada de manejar cambios en una lista de entradas (publicaciones, comentarios, etc.).
export const EntryListUpdateContext = createContext<((action: EntryAction, entry: any) => void) | null>(null);
