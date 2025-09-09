import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../api/apiSlice';

export const linePaymentsApi = createApi({
  reducerPath: 'linePaymentsApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['LinePayment', 'LineBalance'],
  endpoints: (builder) => ({
    // Récupérer l'historique des paiements d'une ligne
    getLinePaymentHistory: builder.query({
      query: (phoneId) => `/line-payments/phone/${phoneId}/history`,
      providesTags: (result, error, phoneId) => [
        { type: 'LinePayment', id: phoneId }
      ],
    }),

    // Calculer le solde d'une ligne
    getLineBalance: builder.query({
      query: (phoneId) => `/line-payments/phone/${phoneId}/balance`,
      providesTags: (result, error, phoneId) => [
        { type: 'LineBalance', id: phoneId }
      ],
    }),

    // Récupérer la prochaine date de facturation
    getNextBillingDate: builder.query({
      query: (phoneId) => `/line-payments/phone/${phoneId}/next-billing`,
      providesTags: (result, error, phoneId) => [
        { type: 'LinePayment', id: `billing-${phoneId}` }
      ],
    }),

    // Créer un paiement d'avance
    createAdvancePayment: builder.mutation({
      query: (paymentData) => ({
        url: '/line-payments/advance-payment',
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
      query: (paymentId) => `/line-payments/${paymentId}`,
      providesTags: (result, error, paymentId) => [
        { type: 'LinePayment', id: paymentId }
      ],
    }),

    // Mettre à jour le statut d'un paiement
    updatePaymentStatus: builder.mutation({
      query: ({ paymentId, ...statusData }) => ({
        url: `/line-payments/${paymentId}/status`,
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
        url: '/line-payments/create-test-data',
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