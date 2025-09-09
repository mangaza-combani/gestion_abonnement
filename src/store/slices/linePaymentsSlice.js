import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../api/apiSlice';

export const linePaymentsApi = createApi({
  reducerPath: 'linePaymentsApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['LinePayment', 'LineBalance', 'ClientOverview', 'UnpaidInvoices'],
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

    // === NOUVEAUX ENDPOINTS CLIENT-CENTRIQUES ===
    
    // Récupérer vue d'ensemble complète du client
    getClientOverview: builder.query({
      query: (clientId) => `/line-payments/client/${clientId}/overview`,
      providesTags: (result, error, clientId) => [
        { type: 'ClientOverview', id: clientId },
        { type: 'LineBalance', id: 'LIST' },
        { type: 'UnpaidInvoices', id: clientId }
      ],
    }),

    // Récupérer toutes les factures impayées d'un client
    getClientUnpaidInvoices: builder.query({
      query: (clientId) => `/line-payments/client/${clientId}/unpaid-invoices`,
      providesTags: (result, error, clientId) => [
        { type: 'UnpaidInvoices', id: clientId }
      ],
    }),

    // Paiement groupé pour un client
    processGroupPayment: builder.mutation({
      query: (paymentData) => ({
        url: `/line-payments/client/${paymentData.clientId}/group-payment`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'ClientOverview', id: clientId },
        { type: 'UnpaidInvoices', id: clientId },
        { type: 'LinePayment', id: 'LIST' },
        { type: 'LineBalance', id: 'LIST' }
      ],
    }),

    // Paiement d'une facture spécifique
    paySpecificInvoice: builder.mutation({
      query: (paymentData) => ({
        url: `/line-payments/invoice/${paymentData.invoiceId}/pay`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { invoiceId, clientId }) => [
        { type: 'ClientOverview', id: clientId },
        { type: 'UnpaidInvoices', id: clientId },
        { type: 'LinePayment', id: invoiceId },
        { type: 'LineBalance', id: 'LIST' }
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
  // Nouveaux hooks client-centriques
  useGetClientOverviewQuery,
  useGetClientUnpaidInvoicesQuery,
  useProcessGroupPaymentMutation,
  usePaySpecificInvoiceMutation,
} = linePaymentsApi;