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
      invalidatesTags: [
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'RedAccount', id: 'LIST' },
        { type: 'Phone', id: 'LIST' }, 
        { type: 'Client', id: 'LIST' }
      ]
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

    // Activer une ligne avec une carte SIM
    activateWithSim: builder.mutation({
      query: ({ phoneId, iccid }) => ({
        url: '/api/line-reservations/activate',
        method: 'POST',
        body: { phoneId, iccid }
      }),
      invalidatesTags: [
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'RedAccount', id: 'LIST' },
        { type: 'Phone', id: 'LIST' },
        { type: 'SimCard', id: 'LIST' },
        { type: 'Client', id: 'LIST' } // Invalider le cache des clients
      ]
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
      invalidatesTags: [
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'LineRequest', id: 'LIST' },
        { type: 'RedAccount', id: 'LIST' },
        { type: 'Phone', id: 'LIST' }, 
        { type: 'Client', id: 'LIST' }
      ]
    }),

    // Analyser ICCID pour aide superviseur
    analyzeIccidForSupervisor: builder.query({
      query: (iccid) => ({
        url: '/api/line-reservations/analyze-iccid',
        method: 'POST',
        body: { iccid }
      })
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
  useActivateWithSimMutation,
  useGetPendingLineRequestsQuery,
  useReserveExistingLineRequestMutation,
  useAnalyzeIccidForSupervisorQuery,
  useGetAvailableSimCardsQuery,
  useGetValidNumbersForAgencyQuery
} = lineReservationsApiSlice;