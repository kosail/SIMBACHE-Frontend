import {Box, Button, Snackbar, Stack, Typography} from "@mui/material";
import {CheckCircleRounded, ErrorRounded} from '@mui/icons-material';
import {useState} from "react";
import ErrorDisplayDialog from "./ErrorDisplayDialog.tsx"
import useTheme from "../../hooks/useTheme.tsx";


interface ResultSnackbarProps {
    snackbarOpen: boolean;
    onClose: () => void;
    isSuccess: boolean;
    message?: string;
    autoHideDuration: number;
}

export default function ShowResults({
                                        snackbarOpen,
                                        onClose,
                                        isSuccess,
                                        message,
                                        autoHideDuration
}: ResultSnackbarProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const {isDarkMode} = useTheme();

    const bgColor: string = isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)';
    const textColor: string = isDarkMode ? '#f1f1f1' : '#101010';

    const msg: string = message ?
        message :
        isSuccess ? "La operación se realizó exitosamente" : "Ha ocurrido un error inesperado";

    // This wrapper handles closing the dialog AND the snackbar
    const handleCloseDialog = () => {
        setDialogOpen(false); // Close the dialog
        onClose();                  // Call the provider's close fn to reset everything
    }

    return (
        <>
            <Box sx={{width: 500}}>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={snackbarOpen}
                    onClose={onClose}
                    sx={{ mb: 4 }}
                    key={'feedback-bottom-center'}
                    autoHideDuration={isSuccess ? autoHideDuration : null}
                    slotProps={{
                        content: {
                            sx: {
                                backgroundColor: bgColor,
                                backdropFilter: 'blur(25px)',
                                color: textColor
                            }
                        }
                    }}
                    message={
                        <>
                            <Stack
                                direction={'row'}
                                spacing={2}
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                { isSuccess ?
                                    <>
                                        <CheckCircleRounded color={'success'} />
                                        <Typography variant={'h6'}>{msg}</Typography>
                                    </> :
                                    <>
                                        <ErrorRounded color={'error'} />
                                        <Typography variant={'h6'}>{msg}</Typography>
                                        <Button
                                            variant={'contained'}
                                            color={'error'}
                                            onClick={() => { setDialogOpen(true) }}
                                        >
                                            Ver detalles
                                        </Button>
                                    </>
                                }
                            </Stack>
                        </>
                    }
                />
            </Box>

            { message &&
                <ErrorDisplayDialog
                error={message}
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                />
            }
        </>
    );
}