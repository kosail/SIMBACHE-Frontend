import { PaletteOptions } from "@mui/material";

export const darkTheme: PaletteOptions = {
    mode: "dark",

    primary: {
        main: "#A7C080",        // Green
        light: "#A7C08033",
        contrastText: "#2D353B",
    },

    secondary: {
        main: "#D9BB80",        // Yellow
        light: "#D9BB8033",
        contrastText: "#2D353B",
    },

    tertiary: {
        main: "#E69875",        // Orange
        light: "#E6987533",
        contrastText: "#2D353B",
    },

    error: {
        main: "#E67E80",        // Red
        contrastText: "#2D353B",
    },

    warning: {
        main: "#DBBC7F",        // Yellow-ish warning variant
        contrastText: "#2D353B",
    },

    info: {
        main: "#7FBBB3",        // Aqua
        contrastText: "#2D353B",
    },

    success: {
        main: "#A7C080",        // Green (same as primary)
        contrastText: "#2D353B",
    },

    background: {
        default: "#2D353B",     // Main background
        paper: "#343F44",       // Raised surfaces
    },

    text: {
        primary:   "#D3C6AA",   // Foreground
        secondary: "#A7C080",   // Accent
        disabled:  "rgba(211, 198, 170, 0.5)",
    },

    divider: "rgba(211, 198, 170, 0.12)",
};
