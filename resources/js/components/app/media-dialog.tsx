import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User } from '@/types';
import { Media } from '@/types/modules/media';
import MediaDialogAlbum from './media-dialog-album';

interface MediaDialogProps {
    open: boolean;
    user: User;
    type: 'image' | 'video';
    onClose: () => void;
    onSelect: (url: string) => void;
}

/**
 * Diálogo que muestra el álbum multimedia de un usuario.
 */
export default function MediaDialog({ open, user, type, onClose, onSelect }: MediaDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Archivos</DialogTitle>
                </DialogHeader>

                <MediaDialogAlbum
                    user={user}
                    type={type}
                    onSelect={(media: Media) => {
                        onSelect?.(media.url);
                        onClose();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
