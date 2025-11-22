import { Box, CircularProgress, Typography, Stack } from "@mui/material";

export default function Loading() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Stack direction={'column'} spacing={2}>
                <CircularProgress />
                <Typography variant={'h6'}>Cargando...</Typography>
            </Stack>
        </Box>
    );
}