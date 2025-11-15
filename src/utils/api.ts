import axios from 'axios';
import {STORAGE_KEY} from "../auth/AuthProvider.tsx";

export const api = axios.create({
    baseURL: 'http://localhost:31234',
    timeout: 3000,
});


api.interceptors.request.use(config => {
    const loginInfo: string | null = localStorage.getItem(STORAGE_KEY);
    const token: string = loginInfo ? JSON.parse(loginInfo).token : null;

    if (token) {
        config.headers['X-Auth-Token'] = token;
    }

    return config;
});