import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL as API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use centralized config
    const API_URL = `${API_BASE}/users`;

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            if (res.data) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
            }
            return res.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(API_URL, { name, email, password });
            if (res.data) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
            }
            return res.data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
