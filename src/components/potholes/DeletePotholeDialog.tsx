import {useState} from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {api} from '../../utils/api';
import {useFeedbackStore} from "../../hooks/feedback/feedbackStore.ts";
import {AxiosError} from "axios";

interface DeletePotholeDialogProps {
    open: boolean;
    onClose: () => void;
    id: number;
}

function DeletePotholeDialog ({open, onClose, id}: DeletePotholeDialogProps) {
    const feedback = useFeedbackStore();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/potholes/delete/${id}`);

            feedback.successMsg('Reporte de bache eliminado correctamente.');
            navigate(-1);
            onClose();
        } catch (error: unknown) {
            feedback.errorMsg(error instanceof AxiosError?
                error.message :
                'Error al eliminar el reporte de bache. Inténtalo de nuevo más tarde.');
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="delete-pothole-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="delete-pothole-dialog-title">
                ¿Eliminar bache #{id}?
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1">
                    ¿Está realmente seguro de querer eliminar este reporte de bache?
                </Typography>

                <Typography variant="h5" component={"p"} sx={{mt: 2}} align="center" fontWeight="bold">
                    Esta acción es irreversible.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Stack direction="row" spacing={4} sx={{width: '100%', px: 4, py: 2}}>
                    <Button
                        variant={"contained"}
                        onClick={onClose}
                        disabled={isDeleting}
                        color="secondary"
                        fullWidth
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        color="error"
                        variant="contained"
                        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
                        fullWidth
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

export default DeletePotholeDialog;