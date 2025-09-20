import { apiSlice } from '../api/apiSlice';

// Extension de l'API avec les endpoints pour les réservations de lignes
export const lineReservationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer les lignes disponibles pour réservation
    getAvailableLines: builder.query({
      query: (redAccountId) => 
        redAccountId 
          ? `/api/line-reservations/available/${redAccountId}` 
          : '/api/line-reservations/available',
      providesTags: (result) =>
        result?.data 
          ? [
              ...result.data.map(({ id }) => ({ type: 'LineReservation', id })),
              { type: 'LineReservation', id: 'AVAILABLE' }
            ]
          : [{ type: 'LineReservation', id: 'AVAILABLE' }]
    }),
    
    // Récupérer les réservations de l'agence
    getReservations: builder.query({
      query: () => '/api/line-reservations/reservations',
      providesTags: (result) =>
        result?.data 
          ? [
              ...result.data.map(({ id }) => ({ type: 'LineReservation', id })),
              { type: 'LineReservation', id: 'RESERVED' }
            ]
          : [{ type: 'LineReservation', id: 'RESERVED' }]
    }),

    // Créer une nouvelle demande de ligne (CAS 2: sans ICCID)
    reserveLine: builder.mutation({
      query: ({ redAccountId, clientId, notes }) => ({
        url: '/line-requests',
        method: 'POST',
        body: { redAccountId, clientId, notes }
      }),
      invalidatesTags: (result, error, { redAccountId, clientId }) => {
        console.log('🗑️ Invalidation tags pour reserveLine:', { result, error, redAccountId, clientId });
        return [
          { type: 'LineReservation', id: 'AVAILABLE' },
          { type: 'LineReservation', id: 'RESERVED' },
          { type: 'RedAccount', id: redAccountId },
          { type: 'RedAccount', id: 'LIST' },
          { type: 'Phone', id: 'LIST' },
          { type: 'Client', id: clientId },
          { type: 'Client', id: 'LIST' },
          'LineReservation', // Invalider toutes les réservations
          'Phone' // Invalider tous les téléphones
        ];
      }
    }),

    // Réserver une place pour une demande existante (superviseur transforme ligne fantôme)
    reserveExistingLine: builder.mutation({
      query: ({ lineRequestId }) => ({
        url: '/api/line-reservations/reserve-existing',
        method: 'POST',
        body: { lineRequestId }
      }),
      invalidatesTags: [
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'RedAccount', id: 'LIST' },
        { type: 'Phone', id: 'LIST' }, 
        { type: 'Client', id: 'LIST' }
      ]
    }),

    // Annuler une réservation
    cancelReservation: builder.mutation({
      query: (phoneId) => ({
        url: `/api/line-reservations/reservations/${phoneId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'RedAccount', id: 'LIST' },
        { type: 'Phone', id: 'LIST' },
        { type: 'Client', id: 'LIST' } // Invalider le cache des clients
      ]
    }),

    // Vérifier le paiement avant demande d'activation
    checkPaymentBeforeActivation: builder.mutation({
      query: ({ phoneId, clientId }) => ({
        url: '/api/line-reservations/check-payment-before-activation',
        method: 'POST',
        body: { phoneId, clientId }
      })
    }),

    // Activer une ligne avec une carte SIM
    activateWithSim: builder.mutation({
      query: ({ phoneId, iccid, clientId }) => ({
        url: '/api/line-reservations/activate',
        method: 'POST',
        body: { phoneId, iccid, clientId }
      }),
      invalidatesTags: (result, error, { phoneId, clientId }) => {
        console.log('🗑️ Invalidation tags pour activateWithSim:', { result, error, phoneId, clientId });
        return [
          { type: 'LineReservation', id: 'RESERVED' },
          { type: 'LineReservation', id: 'AVAILABLE' },
          { type: 'RedAccount', id: 'LIST' },
          { type: 'Phone', id: phoneId }, // Invalider la ligne spécifique
          { type: 'Phone', id: 'LIST' },
          { type: 'PhoneToActivate', id: 'LIST' }, // ✅ IMPORTANT: Invalider l'onglet À ACTIVER
          { type: 'SimCard', id: 'LIST' },
          { type: 'Client', id: clientId }, // Invalider le client spécifique
          { type: 'Client', id: 'LIST' },
          'Phone', // Invalider tous les téléphones
          'PhoneToActivate', // ✅ Invalider toutes les données d'activation
          'ClientToOrder', // Invalider les clients à commander
          'LineReservation', // Invalider toutes les réservations
          'RedAccount', // Invalider tous les comptes RED
          'Agency' // ✅ Invalider les données d'agence pour mettre à jour le stock SIM
        ];
      }
    }),

    // Récupérer les demandes de ligne en attente
    getPendingLineRequests: builder.query({
      query: (agencyId) => 
        agencyId 
          ? `/line-requests?agencyId=${agencyId}`
          : '/line-requests',
      providesTags: (result) =>
        result?.data 
          ? [
              ...result.data.map(({ id }) => ({ type: 'LineRequest', id })),
              { type: 'LineRequest', id: 'LIST' }
            ]
          : [{ type: 'LineRequest', id: 'LIST' }]
    }),

    // Réserver une demande existante (superviseur transforme ligne fantôme)
    reserveExistingLineRequest: builder.mutation({
      query: ({ lineRequestId }) => ({
        url: '/api/line-reservations/reserve-existing',
        method: 'POST',
        body: { lineRequestId }
      }),
      invalidatesTags: (result, error, { lineRequestId }) => {
        console.log('🗑️ Invalidation tags pour reserveExistingLineRequest:', { result, error, lineRequestId });
        return [
          { type: 'LineReservation', id: 'AVAILABLE' },
          { type: 'LineReservation', id: 'RESERVED' },
          { type: 'LineRequest', id: 'LIST' },
          { type: 'RedAccount', id: 'LIST' },
          { type: 'Phone', id: 'LIST' },
          { type: 'Client', id: 'LIST' },
          'Phone', // Invalider tous les téléphones
          'ClientToOrder', // Invalider les clients à commander
          'LineReservation' // Invalider toutes les réservations
        ];
      }
    }),

    // Analyser ICCID pour aide superviseur
    analyzeIccidForSupervisor: builder.query({
      query: (iccid) => ({
        url: '/api/line-reservations/analyze-iccid',
        method: 'POST',
        body: { iccid }
      }),
      // Ne pas utiliser le cache pour cette query car les données peuvent changer
      keepUnusedDataFor: 0
    }),

    // Récupérer les cartes SIM disponibles avec vérification des ICCID
    getAvailableSimCards: builder.query({
      query: () => '/api/line-reservations/available-sim-cards',
      providesTags: [{ type: 'SimCard', id: 'AVAILABLE' }]
    }),
    
    // Récupérer tous les numéros valides d'une agence pour autocomplete
    getValidNumbersForAgency: builder.query({
      query: (agencyId) => `/api/line-reservations/valid-numbers-for-agency?agencyId=${agencyId}`,
      providesTags: [{ type: 'Phone', id: 'AGENCY_NUMBERS' }]
    }),

    // Attribuer une SIM à une ligne de remplacement (agence)
    assignSimToReplacement: builder.mutation({
      query: ({ phoneId, simCardId, notes }) => ({
        url: '/api/line-reservations/assign-sim-replacement',
        method: 'POST',
        body: { phoneId, simCardId, notes }
      }),
      invalidatesTags: (result, error, { phoneId, simCardId }) => {
        console.log('🗑️ Invalidation tags pour assignSimToReplacement:', { result, error, phoneId, simCardId });
        return [
          { type: 'Phone', id: phoneId }, // Invalider la ligne spécifique
          { type: 'Phone', id: 'LIST' },
          { type: 'SimCard', id: simCardId }, // Invalider la SIM spécifique
          { type: 'SimCard', id: 'LIST' },
          { type: 'SimCard', id: 'AVAILABLE' },
          { type: 'LineReservation', id: 'RESERVED' },
          'Phone', // Invalider tous les téléphones
          'SimCard' // Invalider toutes les SIM
        ];
      }
    }),

    // 💰 Traiter le paiement d'une facture générée pour activation
    processInvoicePayment: builder.mutation({
      query: ({ phoneId, paymentAmount, paymentMethod, invoiceId, iccid }) => ({
        url: '/api/line-reservations/process-invoice-payment',
        method: 'POST',
        body: { phoneId, paymentAmount, paymentMethod, invoiceId, iccid }
      }),
      invalidatesTags: (result, error, { phoneId }) => {
        console.log('🗑️ Cache invalidation après paiement pour phoneId:', phoneId);
        return [
          { type: 'Phone', id: phoneId },
          { type: 'Phone', id: 'LIST' },
          { type: 'LinePayment', id: phoneId },
          { type: 'LineReservation', id: 'AVAILABLE' },
          { type: 'LineReservation', id: 'RESERVED' },
          'Phone',
          'LinePayment',
          'LineReservation'
        ];
      }
    }),

    // 📱 Récupérer toutes les lignes d'un client spécifique
    getClientLines: builder.query({
      query: (clientId) => `/api/phones/client/${clientId}/lines`,
      providesTags: (result, error, clientId) => [
        { type: 'Phone', id: 'CLIENT_LINES' },
        { type: 'Client', id: clientId }
      ]
    }),

    // 💰 Récupérer tous les paiements d'un client spécifique
    getClientPayments: builder.query({
      query: (clientId) => `/api/phones/client/${clientId}/payments`,
      providesTags: (result, error, clientId) => [
        { type: 'LinePayment', id: 'CLIENT_PAYMENTS' },
        { type: 'Client', id: clientId }
      ]
    }),

    // ✏️ Mettre à jour les informations d'un client
    updateClient: builder.mutation({
      query: ({ clientId, updateData }) => ({
        url: `/api/clients/${clientId}`,
        method: 'PUT',
        body: updateData
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' }
      ]
    })
  })
});

// Export des hooks générés automatiquement
export const {
  useGetAvailableLinesQuery,
  useGetReservationsQuery,
  useReserveLineMutation,
  useReserveExistingLineMutation,
  useCancelReservationMutation,
  useCheckPaymentBeforeActivationMutation, // 🆕 Vérification paiement
  useActivateWithSimMutation,
  useGetPendingLineRequestsQuery,
  useReserveExistingLineRequestMutation,
  useAnalyzeIccidForSupervisorQuery,
  useGetAvailableSimCardsQuery,
  useGetValidNumbersForAgencyQuery,
  useAssignSimToReplacementMutation,
  useProcessInvoicePaymentMutation,
  useGetClientLinesQuery, // 🆕 Récupérer les lignes d'un client
  useGetClientPaymentsQuery, // 🆕 Récupérer les paiements d'un client
  useUpdateClientMutation // 🆕 Mettre à jour les informations d'un client
} = lineReservationsApiSlice;