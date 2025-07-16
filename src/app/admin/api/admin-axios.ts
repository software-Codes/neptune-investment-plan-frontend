import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";


const API_BASE_URL = 'http://localhost:4000';
const ADMIN_TOKEN_KEY = 'admin-auth-token';

export const adminAxios = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/admin`,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
})


adminAxios.interceptors.request.use((config) => {
    const token = Cookies.get(ADMIN_TOKEN_KEY);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
})

adminAxios.interceptors.response.use(
    (r) => r,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove(ADMIN_TOKEN_KEY);
            toast.error('Session expired - please login again');
            window.location.href = '/admin/auth/login';
        }
        return Promise.reject(error);
    },
);