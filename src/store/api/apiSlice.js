import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_CONFIG from '../../config/api.js';

// Base URL without /api suffix for auth endpoints
const baseServerURL = API_CONFIG.SERVER_URL;

// 🔒 Wrapper pour gérer les erreurs d'authentification automatiquement
const baseQueryWithAuth = (baseQuery) => async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // 🚨 Gestion des erreurs d'authentification
  if (result.error) {
    const status = result.error.status;

    // 401 = Token invalide/expiré, 403 = Accès interdit
    if (status === 401) {
      // Seulement pour les erreurs 401 (token invalide/expiré)
      const currentPath = window.location.pathname;

      // Ne pas rediriger si on est déjà sur la page de login
      if (currentPath !== '/login') {
        console.warn(`🔒 Token invalide/expiré (401): Déconnexion automatique`);

        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Forcer la redirection vers login
        window.location.href = '/login';
      }
    }
    // Pour les erreurs 403, juste logger sans déconnecter
    // (l'utilisateur est connecté mais n'a pas accès à cette ressource)
    else if (status === 403) {
      console.warn(`⚠️ Accès refusé (403) pour la ressource:`, args);
    }
  }

  return result;
};

// Create separate base queries for different endpoint types
const authBaseQuery = baseQueryWithAuth(fetchBaseQuery({
  baseUrl: baseServerURL,
  prepareHeaders: (headers, { getState }) => {
    // Ajout du token d'authentification
    const token = localStorage.getItem('token') || getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
}));

export const apiBaseQuery = baseQueryWithAuth(fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Ajout du token d'authentification
    const token = localStorage.getItem('token') || getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
}));

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