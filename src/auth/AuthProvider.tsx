import {createContext, type ReactNode, useState} from "react";
import type {AuthContextType, LoginPayload, LoginResponse} from '../types/Login.ts';
import {api} from "../utils/api.ts";
import type {AxiosResponse} from "axios";

export const AuthContext = createContext<AuthContextType | null>(null);

export const STORAGE_KEY = 'auth';

export function AuthProvider({children} : {children: ReactNode}) {
    // Para llevar saber si el proceso de login está procesándose o ya ha terminado
    const [loading, setLoading] = useState<boolean>(false);

    // Intentar cargar desde localStorage el token de sesión del usuario y si no existe, redirigir al login
    const [loginData, setLoginData] = useState<LoginResponse | null>(
        () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) as LoginResponse : null;
            } catch {
                return null;
            }
    });

    const login = async (payload: LoginPayload) => {
        setLoading(true);

        try {
            const response = await api.post<LoginPayload, AxiosResponse<LoginResponse>>('/api/auth/login', payload)
            setLoginData(response.data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
            return response;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (!loginData) return;

        await api.post('/api/auth/logout');
        setLoginData(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const value: AuthContextType = {
        loginData,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}