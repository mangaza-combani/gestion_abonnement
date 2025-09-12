import { createSlice } from '@reduxjs/toolkit';
import { apiSliceWithPrefix } from '../api/apiSlice';

const initialState = {
  agencies: [],
  selectedAgency: null,
  loading: false,
  error: null,
  stats: {
    totalAgencies: 0,
    activeAgencies: 0,
    totalClients: 0,
    totalRevenue: 0
  },
  filters: {
    status: 'all',
    search: '',
    sortBy: 'name',
    sortDirection: 'asc'
  }
};

const agencySlice = createSlice({
  name: 'agency',
  initialState,
  reducers: {
    setSelectedAgency: (state, action) => {
      state.selectedAgency = action.payload;
    },
    clearSelectedAgency: (state) => {
      state.selectedAgency = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        search: '',
        sortBy: 'name',
        sortDirection: 'asc'
      };
    }
  }
});

// Exporter les actions
export const { 
  setSelectedAgency, 
  clearSelectedAgency, 
  setFilters, 
  resetFilters 
} = agencySlice.actions;

// Extension de apiSliceWithPrefix avec les endpoints d'agence
export const agencyApiSlice = apiSliceWithPrefix.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer toutes les agences
    getAgencies: builder.query({
      query: () => '/agencies',
      providesTags: ['Agencies']
    }),
    
    // Récupérer une agence par ID
    getAgencyById: builder.query({
      query: (id) => `/agencies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Agencies', id }]
    }),
    
    // Créer une nouvelle agence
    createAgency: builder.mutation({
      query: (agencyData) => ({
        url: '/agencies',
        method: 'POST',
        body: agencyData
      }),
      invalidatesTags: ['Agencies']
    }),
    
    // Mettre à jour une agence
    updateAgency: builder.mutation({
      query: ({ id, ...agencyData }) => ({
        url: `/agencies/${id}`,
        method: 'PUT',
        body: agencyData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Agencies', id }]
    }),
    
    // Mettre à jour le statut d'une agence
    updateAgencyStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/agencies/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Agencies', id }]
    }),
    
    // Récupérer les commissions d'une agence
    getAgencyCommissions: builder.query({
      query: (id) => `/agencies/${id}/commission`,
      transformResponse: (response) => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'AgencyCommissions', id }]
    }),
    
    // Récupérer les demandes de retrait d'une agence
    getAgencyWithdrawalRequests: builder.query({
      query: (id) => `/agencies/${id}/withdrawal-requests`,
      transformResponse: (response) => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'WithdrawalRequests', id }]
    }),
    
    // Créer une demande de retrait pour une agence
    createWithdrawalRequest: builder.mutation({
      query: ({ id, ...requestData }) => ({
        url: `/agencies/${id}/withdrawal-request`,
        method: 'POST',
        body: requestData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'WithdrawalRequests', id },
        { type: 'AgencyCommissions', id }
      ]
    }),
    
    // Mettre à jour une demande de retrait
    updateWithdrawalRequest: builder.mutation({
      query: ({ requestId, ...requestData }) => ({
        url: `/agencies/withdrawal-request/${requestId}`,
        method: 'PATCH',
        body: requestData
      }),
      invalidatesTags: ['WithdrawalRequests']
    }),
    
    // Récupérer l'inventaire des cartes SIM d'une agence
    getAgencySimCards: builder.query({
      query: (id) => `/agencies/${id}/sim_cards`,
      providesTags: (result, error, id) => [{ type: 'SimCards', id }]
    }),
    // Récupérer les commandes SIM d'une agence
    getAgencySimCardsOrder: builder.query({
      query: (agencyId) => {
        console.log('🔍 RTK Query getAgencySimCardsOrder appelée avec agencyId:', agencyId);
        return `/sim-card-orders?agencyId=${agencyId}`;
      },
      providesTags: (result, error, id) => [{ type: 'SimCardsOrders', id }]
    }),

    // Récupérer l'inventaire des cartes SIM d'une agence
    getAgencySimCardsReceipt: builder.query({
      query: (id) => `/sim-card-receipt`,
      providesTags: (result, error, id) => [{ type: 'SimCardsReceipt', id }]
    }),
    
    // Créer une commande de carte SIM pour une agence
    createSimCardOrder: builder.mutation({
      query: ({ id, ...orderData }) => ({
        url: `/sim-card-orders`,
        method: 'POST',
        body: orderData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SimCards', id }]
    }),

    createSimCard: builder.mutation({
        query: (simCardData) => ({
            url: '/sim-card',
            method: 'POST',
            body: simCardData
        }),
        invalidatesTags: ['SimCards']
    }),
    
    // Déclarer la réception d'une carte SIM
    receiveSimCard: builder.mutation({
      query: (receptionData) => {
        console.log('🔥 RTK Query receiveSimCard - Envoi vers API:', receptionData);
        return {
          url: `/sim-card-receipt`,
          method: 'POST',
          body: receptionData
        };
      },
      transformResponse: (response) => {
        console.log('🔥 RTK Query receiveSimCard - Réponse API:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ RTK Query receiveSimCard - Erreur API:', error);
        return error;
      },
      invalidatesTags: ['SimCards', 'Agencies', 'SimCardsReceipt']
    }),

    // Récupérer les demandes de ligne d'une agence
    getLineRequests: builder.query({
      query: (agencyId) => {
        console.log('🔍 RTK Query getLineRequests appelée avec agencyId:', agencyId);
        return `/line-requests${agencyId ? `?agencyId=${agencyId}` : ''}`;
      },
      providesTags: (result, error, id) => [{ type: 'LineRequests', id }]
    }),

    // Créer une demande de ligne
    createLineRequest: builder.mutation({
      query: (requestData) => ({
        url: '/line-requests',
        method: 'POST',
        body: requestData
      }),
      invalidatesTags: ['LineRequests', 'SimCards']
    }),

    // Annuler une demande de ligne
    cancelLineRequest: builder.mutation({
      query: (requestId) => ({
        url: `/line-requests/${requestId}/cancel`,
        method: 'PATCH'
      }),
      invalidatesTags: ['LineRequests']
    })
  }),
});

// Export des hooks générés
export const {
  useGetAgenciesQuery,
  useGetAgencyByIdQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
    useCreateSimCardMutation,
  useUpdateAgencyStatusMutation,
  useGetAgencyCommissionsQuery,
  useGetAgencyWithdrawalRequestsQuery,
  useCreateWithdrawalRequestMutation,
  useUpdateWithdrawalRequestMutation,
  useGetAgencySimCardsQuery,
    useGetAgencySimCardsOrderQuery,
    useGetAgencySimCardsReceiptQuery,
  useCreateSimCardOrderMutation,
  useReceiveSimCardMutation,
  useGetLineRequestsQuery,
  useCreateLineRequestMutation,
  useCancelLineRequestMutation
} = agencyApiSlice;

// Sélecteurs
export const selectAgencies = (state) => state.agency.agencies;
export const selectSelectedAgency = (state) => state.agency.selectedAgency;
export const selectAgencyFilters = (state) => state.agency.filters;
export const selectAgencyStats = (state) => state.agency.stats;

// Export du reducer
export default agencySlice.reducer;