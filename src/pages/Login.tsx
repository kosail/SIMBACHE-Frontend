import {Alert, Box, Button, Container, InputAdornment, Paper, Stack, TextField, Typography} from "@mui/material";
import {LockRounded, Person3Rounded} from '@mui/icons-material';
import bgImage from '../assets/mikahil_nilov_pexels.webp';
import logo from '../assets/favicon.webp'
import {type FormEvent, useState} from "react";
import useAuth from "../hooks/useAuth.ts";
import type {LoginPayload} from "../types/Login.ts";
import {sha256} from "js-sha256";
import {useLocation, useNavigate} from "react-router-dom";
import useTheme from "../hooks/useTheme.tsx";

export default function Login() {
    const auth = useAuth();
    const {isDarkMode} = useTheme();
    const glassColor: string = isDarkMode ? '#00000080' : '#ffffff80';

    const navigate = useNavigate();
    const location = useLocation();
    const from: string = location.state?.from || '/secure/home';

    const [user, setUser] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            const hashedPassword = sha256(password);
            const payload: LoginPayload = {
                username: user,
                passwordHash: hashedPassword
            };

            await auth.login(payload)
            navigate(from, { replace: true });

        } catch(error: Error | any) {
            setError(error?.message ?? 'Inicio de sesión fallido. Contacta al administrador para más detalles.')
        }
    }

    return (
        <Container
            maxWidth={false}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}
            disableGutters
        >
            <Box
                component={'img'}
                src={bgImage}
                alt={"Background image"}
                width={'100%'}
                height={'100%'}
                sx={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />

            <Paper
                elevation={3}
                sx={{
                    minWidth: 700,
                    padding: 6,
                    backgroundColor: glassColor,
                    backdropFilter: 'blur(25px)',
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Stack
                    spacing={4}
                    direction={'column'}
                    alignItems={'center'}
                    useFlexGap
                >
                    <Stack direction={'row'} spacing={1} alignItems={'center'}>
                        <Box component={'img'} src={logo} width={150} />
                        <Typography variant={'h2'} align={'center'} color={'primary'}>
                            SIMBACHE
                        </Typography>
                    </Stack>


                    <Stack spacing={4} component={'form'} onSubmit={handleSubmit} sx={{ width: '80%' }}>
                        <TextField
                            variant={'standard'}
                            placeholder={'Nombre de usuario'}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position={'start'}>
                                            <Person3Rounded />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            value={user}
                            onChange={(e) => setUser(e.target.value.trim())}
                            autoFocus
                            required
                        />

                        <TextField
                            variant={'standard'}
                            placeholder={'Contraseña'}
                            type={'password'}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position={'start'}>
                                            <LockRounded />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            variant={'contained'}
                            sx={{ height: 55, borderRadius: 2 }}
                            disabled={user.length == 0 || password.length == 0 || auth.loading}
                            type={'submit'}
                        >
                            <Typography variant={'body1'} letterSpacing={3}>
                                { auth.loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN' }
                            </Typography>
                        </Button>
                    </Stack>

                    <Typography
                        variant={'caption'}
                        textAlign={'center'}
                    >
                        Todos los derechos reservados, 2025.
                        Con amor, desde Saltillo.
                    </Typography>
                </Stack>

                {error && <Alert severity={'error'} sx={{ mb: 2 }}>{error}</Alert> }
            </Paper>
        </Container>
    );
}