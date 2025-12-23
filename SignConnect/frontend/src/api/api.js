import axios from 'axios';

// Create an axios instance with the backend URL
const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

// Automatically add the token to every request if it exists
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// Export API functions
export const signup = (formData) => API.post('/auth/signup', formData);
export const login = (formData) => API.post('/auth/login', formData);
export const predictSign = (formData) => API.post('/predict/sign', formData);

// Text to Sign API
export const textToSign = (data) => API.post('/text-to-sign', data);