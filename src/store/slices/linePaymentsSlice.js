import { apiSliceWithPrefix } from '../api/apiSlice';

export const linePaymentsApi = apiSliceWithPrefix.injectEndpoints({
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

    // 🆕 NOUVEAU : Récupérer TOUTES les factures d'une ligne spécifique (payées + impayées)
    getLineAllInvoices: builder.query({
      query: (phoneId) => `/line-payments/phone/${phoneId}/all-invoices`,
      providesTags: (result, error, phoneId) => [
        { type: 'LineInvoices', id: phoneId },
        { type: 'LinePayment', id: phoneId }
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

    // Ajouter du solde au client (paiement d'avance) - DEPRECATED
    addClientBalance: builder.mutation({
      query: (balanceData) => ({
        url: '/balances/add',
        method: 'POST',
        body: balanceData,
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'ClientOverview', id: clientId },
        { type: 'LineBalance', id: 'LIST' }
      ],
    }),

    // 🎯 NOUVEAU : Ajouter du solde à une ligne spécifique (nouveau système)
    addLineBalance: builder.mutation({
      query: (balanceData) => ({
        url: `/phones/${balanceData.phoneId}/add-balance`, // URL simplifiée
        method: 'POST',
        body: {
          amount: balanceData.amount,
          reason: balanceData.reason || 'Paiement d\'avance'
        },
      }),
      invalidatesTags: (result, error, { phoneId, clientId }) => [
        { type: 'ClientOverview', id: clientId },
        { type: 'LineBalance', id: phoneId },
        { type: 'LineBalance', id: 'LIST' },
        { type: 'LinePayment', id: phoneId }, // 🔄 Rafraîchir l'historique
        { type: 'LinePayment', id: 'LIST' },
        // 🎯 FORCER invalidation cross-slice
        { type: 'Phone', id: `history-${phoneId}` },
        { type: 'Phone', id: phoneId },
        { type: 'Phone', id: 'LIST' }
      ],
    }),

    // 🧠 NOUVEAU : Calculer montant de paiement intelligent
    calculatePaymentAmount: builder.mutation({
      query: (paymentData) => ({
        url: '/line-payments/calculate-payment',
        method: 'POST',
        body: paymentData,
      }),
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
  // 🆕 NOUVEAU : Hook pour récupérer toutes les factures d'une ligne
  useGetLineAllInvoicesQuery,
  useProcessGroupPaymentMutation,
  usePaySpecificInvoiceMutation,
  // Hook pour ajouter du solde
  useAddClientBalanceMutation, // DEPRECATED
  useAddLineBalanceMutation, // NOUVEAU système par ligne
  // Hook pour calculer montant intelligent
  useCalculatePaymentAmountMutation,
} = linePaymentsApi;