import { createSlice } from '@reduxjs/toolkit';
import { apiSliceWithPrefix } from '../api/apiSlice';

const initialState = {
  selectedAgency: null,
  loading: false,
  error: null
};

const commissionsSlice = createSlice({
  name: 'commissions',
  initialState,
  reducers: {
    setSelectedAgency: (state, action) => {
      state.selectedAgency = action.payload;
    },
    clearSelectedAgency: (state) => {
      state.selectedAgency = null;
    }
  }
});

// Exporter les actions
export const {
  setSelectedAgency,
  clearSelectedAgency
} = commissionsSlice.actions;

// Extension de apiSliceWithPrefix avec les endpoints de commissions
export const commissionsApiSlice = apiSliceWithPrefix.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer toutes les commissions avec agences et abonnements
    getAllCommissions: builder.query({
      query: () => '/commissions',
      transformResponse: (response) => response.data,
      providesTags: ['Commissions']
    }),

    // Récupérer les commissions d'une agence spécifique
    getCommissionsByAgency: builder.query({
      query: (agencyId) => `/commissions/agency/${agencyId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, agencyId) => [
        { type: 'Commissions', id: agencyId }
      ]
    }),

    // Créer ou mettre à jour une commission (montant)
    upsertCommission: builder.mutation({
      query: (commissionData) => ({
        url: '/commissions',
        method: 'POST',
        body: commissionData
      }),
      invalidatesTags: (result, error, { agencyId }) => [
        'Commissions',
        { type: 'Commissions', id: agencyId }
      ]
    }),

    // Supprimer une commission
    deleteCommission: builder.mutation({
      query: (id) => ({
        url: `/commissions/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Commissions']
    }),

    // ========== Calcul des commissions ==========

    // Obtenir les commissions du mois courant pour toutes les agences (superviseur)
    getCurrentMonthAllAgencies: builder.query({
      query: (month) => {
        const url = '/commissions/current-month/all';
        return month ? `${url}?month=${month}` : url;
      },
      transformResponse: (response) => response.data,
      providesTags: ['CommissionsCalculation']
    }),

    // Obtenir les commissions du mois courant pour une agence spécifique
    getCurrentMonthByAgency: builder.query({
      query: ({ agencyId, month }) => {
        const url = `/commissions/current-month/agency/${agencyId}`;
        return month ? `${url}?month=${month}` : url;
      },
      transformResponse: (response) => response.data,
      providesTags: (result, error, { agencyId }) => [
        { type: 'CommissionsCalculation', id: `current-${agencyId}` }
      ]
    }),

    // Obtenir l'historique des commissions d'une agence
    getCommissionHistory: builder.query({
      query: ({ agencyId, periods = 12 }) =>
        `/commissions/history/agency/${agencyId}?periods=${periods}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, { agencyId }) => [
        { type: 'CommissionsCalculation', id: `history-${agencyId}` }
      ]
    }),

    // ========== Gestion des paiements ==========

    // Déclarer un paiement de commission (Agence)
    declarePayment: builder.mutation({
      query: (month) => ({
        url: '/commissions/payments/declare',
        method: 'POST',
        body: { month }
      }),
      invalidatesTags: ['CommissionsCalculation']
    }),

    // Confirmer un paiement de commission (Superviseur)
    confirmPayment: builder.mutation({
      query: (paymentId) => ({
        url: `/commissions/payments/${paymentId}/confirm`,
        method: 'POST'
      }),
      invalidatesTags: ['CommissionsCalculation']
    })
  })
});

// Export des hooks générés
export const {
  useGetAllCommissionsQuery,
  useGetCommissionsByAgencyQuery,
  useUpsertCommissionMutation,
  useDeleteCommissionMutation,
  useGetCurrentMonthAllAgenciesQuery,
  useGetCurrentMonthByAgencyQuery,
  useGetCommissionHistoryQuery,
  useDeclarePaymentMutation,
  useConfirmPaymentMutation
} = commissionsApiSlice;

// Sélecteurs
export const selectSelectedAgency = (state) => state.commissions.selectedAgency;

// Export du reducer
export default commissionsSlice.reducer;
