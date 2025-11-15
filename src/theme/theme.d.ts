import '@mui/material/styles';

// Este archivo existe solamente para extender MUI y hacer que permita tener 3 colores principales, en lugar de 2.

declare module '@mui/material/styles' {
    interface Palette {
        tertiary: Palette['primary'];
    }

    interface PaletteOptions {
        tertiary?: PaletteOptions['primary'];
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        tertiary: true;
    }
}