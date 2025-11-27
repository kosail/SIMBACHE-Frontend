// Este es el objeto que vamos a enviar al backend para crear un inicio de sesión.
import type {AxiosResponse} from "axios";

export interface LoginPayload {
    username: string;
    passwordHash: string;
}

// Este es el objeto que vamos a guardar durante la sesión del usuario, para tener sus datos a la mano.
export interface LoginResponse {
    token: string;
    firstName: string;
    lastName: string;
    admin: boolean;
}

/* Este es el objeto que vamos a guardar en memoria al hacer login, y el mismo al que vamos a poder acceder desde toda la app.
* Vamos a tener el usuario, y funciones para iniciar y cerra sesión.
* */
export interface AuthContextType {
    loginData: LoginResponse | null;
    loading: boolean;
    login: (payload: LoginPayload) => Promise<AxiosResponse<LoginResponse>>;
    logout: () => void;
};