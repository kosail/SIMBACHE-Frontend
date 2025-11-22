import { PaletteOptions } from "@mui/material";

export const lightTheme: PaletteOptions = {
    mode: "light",

    primary: {
        main: "#93B259",        // Green
        light: "#93B25933",
        contrastText: "#F3EFDF",
    },

    secondary: {
        main: "#D3A05A",        // Yellow
        light: "#D3A05A33",
        contrastText: "#F3EFDF",
    },

    tertiary: {
        main: "#E69875",        // Orange
        light: "#E6987533",
        contrastText: "#F3EFDF",
    },

    error: {
        main: "#F85552",        // Red
        contrastText: "#F3EFDF",
    },

    warning: {
        main: "#D3A05A",        // Soft yellow
        contrastText: "#F3EFDF",
    },

    info: {
        main: "#56949F",        // Aqua
        contrastText: "#F3EFDF",
    },

    success: {
        main: "#93B259",        // Green
        contrastText: "#F3EFDF",
    },

    background: {
        default: "#F3EFDF",     // Main Everforest light background
        paper:   "#EDEAD5",     // Slightly darker layer
    },

    text: {
        primary:   "#5C6A72",   // Main foreground gray
        secondary: "#93B259",   // Accent green
        disabled:  "rgba(92, 106, 114, 0.5)",
    },

    divider: "rgba(92, 106, 114, 0.12)",
};
