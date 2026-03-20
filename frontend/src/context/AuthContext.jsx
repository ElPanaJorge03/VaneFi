import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // En producción el frontend se sirve desde el mismo servidor que la API
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBaseURL = isDev
        ? `http://${window.location.hostname}:8000`
        : window.location.origin;

    const api = axios.create({
        baseURL: apiBaseURL,
    });

    api.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        // Ideally we would have a /users/me endpoint to fetch current user
        // For now, if we have a token, we consider the user logged in
        if (token) {
            setCurrentUser({ token });
        } else {
            setCurrentUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
        }
    };

    const register = async (nombre, email, password) => {
        try {
            await api.post('/auth/register', { nombre, email, password });
            return await login(email, password);
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Error al registrarse');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        api,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
