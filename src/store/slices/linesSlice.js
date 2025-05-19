import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// RTK Query API endpoints pour les phone
export const phoneApiSlice = apiSlice.injectEndpoints({
        endpoints: (builder) => ({
                getPhones: builder.query({
                        query: (id) => ({
                                url: `/agencies/${id}/users`,
                        }),
                        providesTags: ['Phone'],
                        invalidatesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                getPhoneById: builder.query({
                        query: (id) => `/auth/get-user/${id}`,
                        providesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                createPhone: builder.mutation({
                        query: (client) => ({
                                url: '/auth/register',
                                method: 'POST',
                                body: client,
                        }),
                        invalidatesTags: ['Phone'],
                }),
                updatePhone: builder.mutation({
                        query: ({ id, ...patch }) => ({
                                url: `/auth/user/${id}`,
                                method: 'PATCH',
                                body: patch,
                        }),
                        invalidatesTags: (result, error, { id }) => [{ type: 'Phone', id }],
                }),
        }),
});

export const {
        useGetPhonesQuery,
        useGetPhoneByIdQuery,
        useCreatePhoneMutation,
        useUpdatePhoneMutation,
} = phoneApiSlice;

// Slice Redux pour la gestion d'état locale des phone
const initialState = {
        selectedPhone: null,
        selectedStatus: 'ALL',
        searchTerm: '',
        currentTab: 'list',
};

const phoneSlice = createSlice({
        name: 'phone',
        initialState,
        reducers: {
                setSelectedPhone: (state, action) => {
                        state.selectedPhone = action.payload;
                },
                clearSelectedPhone: (state) => {
                        state.selectedPhone = null;
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
        setSelectedPhone,
        clearSelectedPhone,
        setSelectedStatus,
        setSearchTerm,
        setCurrentTab,
} = phoneSlice.actions;

export default phoneSlice.reducer;