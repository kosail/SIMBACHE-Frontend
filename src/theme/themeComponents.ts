import jakartaFont from '../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf';
import jakartaItalicFont from '../assets/fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf';
import type {Components} from "@mui/material";

const themeComponents: Components = {
    MuiCssBaseline: {
        styleOverrides: `
            @font-face {
                font-family: 'Plus Jakarta Sans';
                font-style: normal;
                font-weight: 100 900;
                font-display: swap;
                src: local('Plus Jakarta Sans'), url(${jakartaFont}) format('truetype');
            }
            
            @font-face {
                font-family: 'Plus Jakarta Sans';
                font-style: italic;
                font-weight: 100 900;
                font-display: swap;
                src: local('Plus Jakarta Sans Italic'), url(${jakartaItalicFont}) format('truetype');
            }
        `
    }
};

export default themeComponents;