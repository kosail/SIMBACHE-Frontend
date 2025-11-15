import {PaletteOptions} from '@mui/material';

export const lightTheme: PaletteOptions = {
    mode: 'light',
    primary: {
        main: '#606C38',
        light: '#606C3844',
        contrastText: '#FEFAE0',
    },
    secondary: {
        main: '#DDA15E',
        light: '#DDA15E44',
        contrastText: '#283618',
    },
    tertiary: {
        main: '#BC6C25',
        light: '#BC6C2544',
        contrastText: '#FEFAE0',
    },

    error: {
        main: '#D32F2F',
        contrastText: '#FEFAE0',
    },
    warning: {
        main: '#ED6C02',
        contrastText: '#FEFAE0',
    },
    info: {
        main: '#0288D1',
        contrastText: '#FEFAE0',
    },
    success: {
        main: '#2E7D32',
        contrastText: '#FEFAE0',
    },

    background: {
        default: '#FEFAE0',
        paper: '#F5F1D6',
    },

    text: {
        primary: '#283618',
        secondary: '#606C38',
        disabled: 'rgba(40, 54, 24, 0.5)',
    },

    divider: 'rgba(40, 54, 24, 0.12)',
};