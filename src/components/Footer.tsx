import {Paper, Typography} from "@mui/material";

export function Footer() {
    return (
        <Paper
            component={'footer'}
            sx={{
                width: '100vw',
                maxWidth: '100%',
                height: 50,
                mt: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'flex-end',
            }}
        >
            <Typography variant={'body1'} color={'textDisabled'}>
                © {new Date().getFullYear()} Sistema Mexicano de Bacheo y Conservación de Calles [SIMBACHE]. Todos los derechos reservados.
            </Typography>
        </Paper>
    );
}