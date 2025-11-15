import {Dialog, DialogContent, DialogTitle, Divider, type SxProps, Typography} from "@mui/material";

interface ErrorDisplayDialogProps {
    error: string;
    isOpen: boolean;
    onClose: () => void;
    sx?: SxProps;
}

export default function ErrorDisplayDialog({error, isOpen, onClose, sx}: ErrorDisplayDialogProps) {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            sx={{ backdropFilter: 'blur(5px)', ...sx }}
        >
            <DialogTitle  sx={{ textAlign: 'center', fontSize: '1.5rem' }} >
                Información detallada del error
            </DialogTitle>

            <DialogContent>
                <Divider sx={{ mb: 3 }} />

                <Typography
                    variant={'body1'}
                    sx={{ textAlign: 'center', mb: 2 }}
                >
                    Toma captura de pantalla de este error y envíalo al administrador del sistema.
                </Typography>

                <Typography variant={'caption'} sx={{ textAlign: 'center', mb: 2 }}>
                    Clic afuera para cerrar este mensaje
                </Typography>

                <Typography
                    variant={'body1'}
                    align={'center'}
                    sx={{ p: 1, backgroundColor: 'error.light'}}
                >
                    {error}
                </Typography>

            </DialogContent>

        </Dialog>
    );
}