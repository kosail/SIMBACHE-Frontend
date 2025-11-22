import {Box, Button, Drawer, Stack, Typography} from "@mui/material";
import {AccountCircleRounded} from '@mui/icons-material';
import useAuth from "../../hooks/auth/useAuth.ts";
import {useLocation, useNavigate} from "react-router-dom";

export default function Sidebar({ drawerWidth }: { drawerWidth: number }) {
    const navigate = useNavigate();
    const {loginData: user, logout} = useAuth();
    const location: string = useLocation().pathname;
    const activePage: string = location.slice(location.lastIndexOf('/') + 1);

    return (
        <Drawer
            variant={'permanent'}
            open={true}
            sx={{
                width: drawerWidth,
                maxWidth: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    maxWidth: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Stack direction={'column'} spacing={2} alignItems={'center'} sx={{ mb: 2, fontSize: 100, pt: 4 }}>
                <AccountCircleRounded fontSize={'inherit'} />
                <Typography variant={'h6'}>Bienvenido<br/>{`${user?.firstName} ${user?.lastName}`}</Typography>
            </Stack>

            <Stack direction={'column'} flexGrow={1} spacing={2} sx={{ px: 2, py: 2 }}>
                <Button
                    variant={'contained'}
                    color={activePage === 'home' ? 'secondary' : 'primary'}
                    onClick={() => navigate('/secure/home')}
                >
                    <Typography variant={'h6'}>Principal</Typography>
                </Button>

                <Button
                    variant={'contained'}
                    color={activePage === 'potholes' ? 'secondary' : 'primary'}
                    onClick={() => navigate('/secure/potholes')}
                >
                    <Typography variant={'h6'}>Baches</Typography>
                </Button>

                <Button
                    variant={'contained'}
                    color={activePage === 'settings' ? 'secondary' : 'primary'}
                    onClick={() => navigate('/secure/settings')}
                >
                    <Typography variant={'h6'}>Ajustes</Typography>
                </Button>

                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexGrow={1} />

                <Button variant={'contained'} onClick={() => logout()}>
                    <Typography variant={'h6'}>Cerrar sesion</Typography>
                </Button>
            </Stack>
        </Drawer>
    );
}