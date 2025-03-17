import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Création de l'API de base sans endpoints spécifiques
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:7002/',
    prepareHeaders: (headers, { getState }) => {
      // Ajout du token d'authentification
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Agency', 'Client', 'RedAccount', 
    'Line', 'SimCard', 'Invoice', 'Payment'
  ],
  endpoints: () => ({}), 
});