import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend ka address
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Har request me Token chipka do
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Token nikalo
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;