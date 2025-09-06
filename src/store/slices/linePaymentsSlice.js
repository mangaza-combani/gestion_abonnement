import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/index.js';

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.api.baseURL}api/line-payments`,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const linePaymentsApi = createApi({
  reducerPath: 'linePaymentsApi',
  baseQuery,
  tagTypes: ['LinePayment', 'LineBalance'],
  endpoints: (builder) => ({
    // Récupérer l'historique des paiements d'une ligne
    getLinePaymentHistory: builder.query({
      query: (phoneId) => `/phone/${phoneId}/history`,
      providesTags: (result, error, phoneId) => [
        { type: 'LinePayment', id: phoneId }
      ],
    }),

    // Calculer le solde d'une ligne
    getLineBalance: builder.query({
      query: (phoneId) => `/phone/${phoneId}/balance`,
      providesTags: (result, error, phoneId) => [
        { type: 'LineBalance', id: phoneId }
      ],
    }),

    // Récupérer la prochaine date de facturation
    getNextBillingDate: builder.query({
      query: (phoneId) => `/phone/${phoneId}/next-billing`,
      providesTags: (result, error, phoneId) => [
        { type: 'LinePayment', id: `billing-${phoneId}` }
      ],
    }),

    // Créer un paiement d'avance
    createAdvancePayment: builder.mutation({
      query: (paymentData) => ({
        url: '/advance-payment',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { phoneId }) => [
        { type: 'LinePayment', id: phoneId },
        { type: 'LineBalance', id: phoneId },
        { type: 'LinePayment', id: `billing-${phoneId}` }
      ],
    }),

    // Récupérer les détails d'un paiement
    getPaymentDetails: builder.query({
      query: (paymentId) => `/${paymentId}`,
      providesTags: (result, error, paymentId) => [
        { type: 'LinePayment', id: paymentId }
      ],
    }),

    // Mettre à jour le statut d'un paiement
    updatePaymentStatus: builder.mutation({
      query: ({ paymentId, ...statusData }) => ({
        url: `/${paymentId}/status`,
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: (result, error, { paymentId, phoneId }) => [
        { type: 'LinePayment', id: paymentId },
        { type: 'LineBalance', id: phoneId },
        { type: 'LinePayment', id: phoneId }
      ],
    }),

    // Créer des données de test
    createTestData: builder.mutation({
      query: (phoneId) => ({
        url: '/create-test-data',
        method: 'POST',
        body: { phoneId },
      }),
      invalidatesTags: (result, error, phoneId) => [
        { type: 'LinePayment', id: phoneId },
        { type: 'LineBalance', id: phoneId }
      ],
    }),
  }),
});

export const {
  useGetLinePaymentHistoryQuery,
  useGetLineBalanceQuery,
  useGetNextBillingDateQuery,
  useCreateAdvancePaymentMutation,
  useGetPaymentDetailsQuery,
  useUpdatePaymentStatusMutation,
  useCreateTestDataMutation,
} = linePaymentsApi;