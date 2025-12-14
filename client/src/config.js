const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Fallback to localhost if no env var (Development)
    return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
