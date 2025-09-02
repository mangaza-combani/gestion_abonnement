import { apiSlice } from './apiSlice.js';

export const lineReservationQuotaSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Créer une réservation de quota
    createLineReservationQuota: builder.mutation({
      query: (data) => ({
        url: '/line-reservation-quotas',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LineReservationQuota', 'Line'],
    }),

    // Récupérer les réservations en attente
    getPendingReservations: builder.query({
      query: () => '/line-reservation-quotas/pending',
      providesTags: ['LineReservationQuota'],
    }),

    // Récupérer les réservations d'un compte RED
    getRedAccountReservations: builder.query({
      query: (redAccountId) => `/line-reservation-quotas/red-account/${redAccountId}`,
      providesTags: (result, error, redAccountId) => [
        { type: 'LineReservationQuota', id: `RED_ACCOUNT_${redAccountId}` }
      ],
    }),

    // Obtenir la prochaine réservation à traiter
    getNextReservation: builder.query({
      query: (redAccountId) => `/line-reservation-quotas/red-account/${redAccountId}/next`,
      providesTags: (result, error, redAccountId) => [
        { type: 'LineReservationQuota', id: `NEXT_${redAccountId}` }
      ],
    }),

    // Annuler une réservation
    cancelLineReservationQuota: builder.mutation({
      query: (id) => ({
        url: `/line-reservation-quotas/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LineReservationQuota'],
    }),
  }),
});

export const {
  useCreateLineReservationQuotaMutation,
  useGetPendingReservationsQuery,
  useGetRedAccountReservationsQuery,
  useGetNextReservationQuery,
  useCancelLineReservationQuotaMutation,
} = lineReservationQuotaSlice;