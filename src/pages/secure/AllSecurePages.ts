import type {JSX} from "react";
import Home from "./Home.tsx";

export interface SecurePages {
    name: string;
    Element: () => JSX.Element;
}

export const AllSecurePages: SecurePages[] = [
    {
        name: 'Inicio',
        Element: Home
    },
    {
        name: 'Baches',
        Element: Home
    },
    {
        name: 'Reportes',
        Element: Home
    },
    {
        name: 'Administración',
        Element: Home
    }
] as const;