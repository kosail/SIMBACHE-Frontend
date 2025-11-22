import type {JSX} from "react";
import Contact from "./Contact.tsx";
import Main from "./Main.tsx";

export interface LandingPage {
    name: 'Inicio' | 'Contratistas' | 'Contáctanos',
    Element: () => JSX.Element,
}

export const AllLandingPages: LandingPage[] = [
    {
        name: "Inicio",
        Element: Main
    },
    // {
    //     name: "Contratistas",
    //     Element: Contractors
    // },
    {
        name: "Contáctanos",
        Element: Contact
    }
] as const;
