import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_CONFIG from '../../config/api.js';

// Base URL without /api suffix for auth endpoints
const baseServerURL = API_CONFIG.SERVER_URL;

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
  baseUrl: API_CONFIG.BASE_URL,
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

// API slice for endpoints that need the /api prefix
export const apiSliceWithPrefix = createApi({
  reducerPath: 'apiWithPrefix',
  baseQuery: apiBaseQuery,
  tagTypes: [
    'Phone', 'LinePayment', 'Balance', 'ClientOverview', 'LineBalance', 'UnpaidInvoices'
  ],
  endpoints: () => ({}), 
});