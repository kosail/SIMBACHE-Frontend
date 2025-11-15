import {useContext} from "react";
import {AuthContext} from "../auth/AuthProvider.tsx";

export default function useAuth() {
    const loginContext = useContext(AuthContext);

    if (!loginContext) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }

    return loginContext;
}