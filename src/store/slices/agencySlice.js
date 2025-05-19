import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

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

// Extension de apiSlice avec les endpoints d'agence
export const agencyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer toutes les agences
    getAgencies: builder.query({
      query: () => '/agencies',
      transformResponse: (response) => {
        return response.data;
      },
      providesTags: ['Agencies']
    }),
    
    // Récupérer une agence par ID
    getAgencyById: builder.query({
      query: (id) => `/agencies/${id}`,
      transformResponse: (response) => {
        return response.data;
      },
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
    // Récupérer l'inventaire des cartes SIM d'une agence
    getAgencySimCardsOrder: builder.query({
      query: (id) => `/sim-card-orders`,
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
      query: ({ id, ...receptionData }) => ({
        url: `/sim-card-receipt`,
        method: 'POST',
        body: receptionData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SimCards', id }]
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
  useReceiveSimCardMutation
} = agencyApiSlice;

// Sélecteurs
export const selectAgencies = (state) => state.agency.agencies;
export const selectSelectedAgency = (state) => state.agency.selectedAgency;
export const selectAgencyFilters = (state) => state.agency.filters;
export const selectAgencyStats = (state) => state.agency.stats;

// Export du reducer
export default agencySlice.reducer;