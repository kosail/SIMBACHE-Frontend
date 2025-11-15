import {createContext, type ReactNode, useState} from "react";
import {CssBaseline, type Theme, ThemeProvider} from "@mui/material";
import {darkTheme} from "./darkTheme.ts";
import {lightTheme} from "./lightTheme.ts";
import {createTheme} from "@mui/material/styles";
import themeComponents from "./themeComponents.ts";

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | null>(null);

export function ThemeContextProvider({children}: {children: ReactNode}) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const theme: Theme = createTheme({
        palette: isDarkMode ? {...darkTheme} : {...lightTheme},
        typography: { fontFamily: `'Plus Jakarta Sans', Noto Sans, sans-serif` },
        components: themeComponents
    });

    return (
        <ThemeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}