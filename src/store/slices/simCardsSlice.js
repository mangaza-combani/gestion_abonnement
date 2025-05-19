import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// RTK Query API endpoints pour les sim_cards
export const sim_cardsApiSlice = apiSlice.injectEndpoints({
        endpoints: (builder) => ({
                getSimCards: builder.query({
                        query: (id) => ({
                                url: `/agencies/${id}/users`,
                        }),
                        providesTags: ['SimCard'],
                        invalidatesTags: (result, error, id) => [{ type: 'SimCard', id }],
                }),
                getSimCardById: builder.query({
                        query: (id) => `/auth/get-user/${id}`,
                        providesTags: (result, error, id) => [{ type: 'SimCard', id }],
                }),
                createSimCard: builder.mutation({
                        query: (client) => ({
                                url: '/auth/register',
                                method: 'POST',
                                body: client,
                        }),
                        invalidatesTags: ['SimCard'],
                }),
                updateSimCard: builder.mutation({
                        query: ({ id, ...patch }) => ({
                                url: `/auth/user/${id}`,
                                method: 'PATCH',
                                body: patch,
                        }),
                        invalidatesTags: (result, error, { id }) => [{ type: 'SimCard', id }],
                }),
        }),
});

export const {
        useGetSimCardsQuery,
        useGetSimCardByIdQuery,
        useCreateSimCardMutation,
        useUpdateSimCardMutation,
} = sim_cardsApiSlice;

// Slice Redux pour la gestion d'état locale des sim_cards
const initialState = {
        selectedSimCard: null,
        selectedStatus: 'ALL',
        searchTerm: '',
        currentTab: 'list',
};

const sim_cardsSlice = createSlice({
        name: 'sim_cards',
        initialState,
        reducers: {
                setSelectedSimCard: (state, action) => {
                        state.selectedSimCard = action.payload;
                },
                clearSelectedSimCard: (state) => {
                        state.selectedSimCard = null;
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
        setSelectedSimCard,
        clearSelectedSimCard,
        setSelectedStatus,
        setSearchTerm,
        setCurrentTab,
} = sim_cardsSlice.actions;

export default sim_cardsSlice.reducer;