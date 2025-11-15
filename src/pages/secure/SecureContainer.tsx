import {Box, Container, Typography} from "@mui/material";
import useAuth from "../../hooks/useAuth.ts";

export default function SecureContainer() {
    const auth = useAuth();

    if (!auth.loginData) return (
        <Container maxWidth={false} disableGutters>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100vh'} width={'100vw'}>
                <Typography variant={'h1'} color={'error'} textAlign={'center'}>Acceso no autorizado</Typography>
            </Box>
        </Container>
    );

    return (
        <Container maxWidth={false} disableGutters>
            {/*<Stack direction={'column'} spacing={0}>*/}

            {/*    <Box display={'flex'}>*/}
            {/*    </Box>*/}
            {/*</Stack>*/}
        </Container>
    );
}