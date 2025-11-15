import {createTheme} from '@mui/material/styles';
import type {Theme} from "@mui/material";

export const darkTheme: Theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#606C38',
            light: '#606C3844',
            contrastText: '#FEFAE0',
        },
        secondary: {
            main: '#DDA15E',
            light: '#DDA15E44',
            contrastText: '#FEFAE0',
        },
        tertiary: {
            main: '#BC6C25',
            light: '#BC6C2544',
            contrastText: '#FEFAE0',
        },

        error: {
            main: '#CF6679',
            contrastText: '#FEFAE0',
        },
        warning: {
            main: '#FFB74D',
            contrastText: '#283618',
        },
        info: {
            main: '#64B5F6',
            contrastText: '#283618',
        },
        success: {
            main: '#81C784',
            contrastText: '#283618',
        },

        background: {
            default: '#243116',
            paper: '#303D1E',
        },

        text: {
            primary: '#FEFAE0',
            secondary: '#DDA15E',
            disabled: 'rgba(254, 250, 224, 0.5)',
        },

        divider: 'rgba(254, 250, 224, 0.12)',
    },
});
