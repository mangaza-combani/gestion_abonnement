import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/index.js';

// Base URL without /api suffix for auth endpoints
const baseServerURL = config.api.baseURL.replace('/api', '');

// Create separate base queries for different endpoint types
const authBaseQuery = fetchBaseQuery({ 
  baseUrl: baseServerURL,
  prepareHeaders: (headers, { getState }) => {
    // Ajout du token d'authentification
    const token = localStorage.getItem('token') || getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiBaseQuery = fetchBaseQuery({ 
  baseUrl: config.api.baseURL,
  prepareHeaders: (headers, { getState }) => {
    // Ajout du token d'authentification
    const token = localStorage.getItem('token') || getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Création de l'API de base sans endpoints spécifiques (for auth endpoints)
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: authBaseQuery,
  tagTypes: [
    'User', 'Agency', 'Client', 'RedAccount', 
    'Line', 'SimCard', 'Invoice', 'Payment', 'LineReservationQuota'
  ],
  endpoints: () => ({}), 
});