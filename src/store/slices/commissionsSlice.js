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
    })
  })
});

// Export des hooks générés
export const {
  useGetAllCommissionsQuery,
  useGetCommissionsByAgencyQuery,
  useUpsertCommissionMutation,
  useDeleteCommissionMutation
} = commissionsApiSlice;

// Sélecteurs
export const selectSelectedAgency = (state) => state.commissions.selectedAgency;

// Export du reducer
export default commissionsSlice.reducer;
