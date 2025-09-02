import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// RTK Query API endpoints pour les clients
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
    getAllUsers: builder.query({
        query: () => '/auth/get-users',
        providesTags: (result) =>
            result ? [...result.map(({ id }) => ({ type: 'Client', id })), { type: 'Client', id: 'LIST' }] : [{ type: 'Client', id: 'LIST' }],
    }),
    getClientById: builder.query({
      query: (id) => `/auth/get-user/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    getClientsToOrder: builder.query({
      query: () => `/clients-to-order?_t=${Date.now()}`, // Ajouter timestamp pour éviter le cache
      providesTags: ['ClientToOrder'],
      keepUnusedDataFor: 0, // Ne pas garder les données en cache
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
    associateClient: builder.mutation({
      query: ({ clientId, agencyId }) => ({
        url: '/clients/associate',
        method: 'POST',
        body: { clientId },
      }),
      invalidatesTags: (result, error, { clientId, agencyId }) => [
        { type: 'Client', id: 'LIST' },
        { type: 'Client', id: `LIST_${agencyId}` },
        { type: 'Client', id: clientId }
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

export const {
  useGetClientsQuery,
  useGetAllUsersQuery,
  useGetClientByIdQuery,
  useGetClientsToOrderQuery,
  useCreateClientMutation,
  useAssociateClientMutation,
  useUpdateClientMutation,
} = clientsApiSlice;

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