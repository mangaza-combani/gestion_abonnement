import { createSlice } from '@reduxjs/toolkit';
import { apiSlice, apiSliceWithPrefix } from '../api/apiSlice';

// RTK Query API endpoints pour les clients (auth routes)
export const clientsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query({
      query: (id) => ({
        url: `/agencies/${id}/users`,
      }),
      providesTags: (result, error, id) => [
        { type: 'Client', id: `LIST_${id}` },
        { type: 'Client', id: 'LIST' }
      ],
    }),
    associateClient: builder.mutation({
      query: ({ clientId, agencyId, simCardInfo, paymentInfo, needsLine, subscriptionId, notes }) => ({
        url: '/clients/associate',
        method: 'POST',
        body: { clientId, agencyId, simCardInfo, paymentInfo, needsLine, subscriptionId, notes },
      }),
      invalidatesTags: (result, error, { clientId, agencyId }) => [
        { type: 'Client', id: 'LIST' },
        { type: 'Client', id: `LIST_${agencyId}` },
        { type: 'Client', id: clientId },
        'ClientToOrder', // Pour mettre à jour les listes "À COMMANDER"
        'Phone' // Pour mettre à jour les listes de lignes
      ],
    }),
    updateClient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/auth/user/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }],
    }),
  }),
});

// RTK Query API endpoints pour les clients (routes avec /api prefix)
export const clientsApiSliceWithPrefix = apiSliceWithPrefix.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
        query: () => '/auth/get-users',
        providesTags: (result) =>
            result ? [...result.map(({ id }) => ({ type: 'Client', id })), { type: 'Client', id: 'LIST' }] : [{ type: 'Client', id: 'LIST' }],
    }),
    getClientById: builder.query({
      query: (id) => `/auth/get-user/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation({
      query: (client) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: (result, error, client) => [
        { type: 'Client', id: 'LIST' },
        { type: 'Client', id: `LIST_${client.agencyId}` },
        'ClientToOrder'
      ],
    }),
    getClientsToOrder: builder.query({
      query: () => `/clients-to-order?_t=${Date.now()}`, // Ajouter timestamp pour éviter le cache
      providesTags: ['ClientToOrder'],
      keepUnusedDataFor: 0, // Ne pas garder les données en cache
    }),

    // Confirmer commande SIM avec date
    confirmSimOrder: builder.mutation({
      query: ({ lineRequestId, orderDate, quantity = 1 }) => ({
        url: `/line-requests/${lineRequestId}/confirm-sim-order`,
        method: 'POST',
        body: { orderDate, quantity },
      }),
      invalidatesTags: ['ClientToOrder'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useAssociateClientMutation,
  useUpdateClientMutation,
} = clientsApiSlice;

// Export des hooks pour les endpoints avec prefix
export const {
  useGetAllUsersQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useGetClientsToOrderQuery,
  useConfirmSimOrderMutation,
} = clientsApiSliceWithPrefix;

// Slice Redux pour la gestion d'état locale des clients
const initialState = {
  selectedClient: null,
  selectedStatus: 'ALL',
  searchTerm: '',
  currentTab: 'list',
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
  },
});

export const {
  setSelectedClient,
  clearSelectedClient,
  setSelectedStatus,
  setSearchTerm,
  setCurrentTab,
} = clientsSlice.actions;

export default clientsSlice.reducer;