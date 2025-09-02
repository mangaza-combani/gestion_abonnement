import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/index.js';

// Création de l'API de base sans endpoints spécifiques
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: config.api.baseURL,
    prepareHeaders: (headers, { getState }) => {
      // Ajout du token d'authentification
      const token = localStorage.getItem('token') || getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Agency', 'Client', 'RedAccount', 
    'Line', 'SimCard', 'Invoice', 'Payment', 'LineReservationQuota'
  ],
  endpoints: () => ({}), 
});