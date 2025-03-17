import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// RTK Query API endpoints pour les clients
export const clientsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query({
      query: (params) => ({
        url: '/clients',
        params,
      }),
      providesTags: ['Client'],
    }),
    getClientById: builder.query({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation({
      query: (client) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),
    updateClient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/clients/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
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