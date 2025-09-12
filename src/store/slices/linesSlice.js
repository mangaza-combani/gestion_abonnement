import { createSlice } from '@reduxjs/toolkit';
import { apiSliceWithPrefix } from '../api/apiSlice';

// RTK Query API endpoints pour les phone
export const phoneApiSlice = apiSliceWithPrefix.injectEndpoints({
        endpoints: (builder) => ({
                getPhones: builder.query({
                        query: (id) => {
                                // Récupérer les informations utilisateur pour déterminer le scope
                                const userData = localStorage.getItem('user');
                                let isSupervisor = false;
                                
                                try {
                                        const parsedUser = JSON.parse(userData);
                                        isSupervisor = parsedUser?.role === 'SUPERVISOR';
                                } catch (error) {
                                        console.warn('Erreur lors du parsing des données utilisateur:', error);
                                }
                                
                                // Si superviseur, récupérer toutes les agences, sinon seulement l'agence de l'utilisateur
                                const queryParams = isSupervisor ? 'all_agencies=true' : '';
                                const url = `/phones?${queryParams}&_t=${Date.now()}`;
                                
                                
                                return { url };
                        },
                        providesTags: (result, error, id) => {
                                return result
                                        ? [
                                                ...result.map(({ id }) => ({ type: 'Phone', id })),
                                                { type: 'Phone', id: 'LIST' },
                                        ]
                                        : [{ type: 'Phone', id: 'LIST' }];
                        },
                        invalidatesTags: (result, error, id) => [{ type: 'Phone', id }],
                        keepUnusedDataFor: 0, // Ne pas garder les données en cache
                }),
                getPhoneById: builder.query({
                        query: (id) => `/phones/${id}`,
                        providesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                createPhone: builder.mutation({
                        query: (client) => ({
                                url: '/phones',
                                method: 'POST',
                                body: client,
                        }),
                        invalidatesTags: [
                                'Phone', 
                                'ClientToOrder', 
                                { type: 'Client', id: 'LIST' },
                                { type: 'Phone', id: 'LIST' }
                        ],
                }),
                updatePhone: builder.mutation({
                        query: ({ id, ...patch }) => ({
                                url: `/phones/${id}`,
                                method: 'PATCH',
                                body: patch,
                        }),
                        invalidatesTags: (result, error, { id }) => [
                                { type: 'Phone', id },
                                'Phone', 
                                'ClientToOrder', 
                                { type: 'Client', id: 'LIST' },
                                { type: 'Phone', id: 'LIST' }
                        ],
                }),
                deletePhone: builder.mutation({
                        query: (id) => ({
                                url: `/phones/${id}`,
                                method: 'DELETE',
                        }),
                        invalidatesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                blockPhone: builder.mutation({
                        query: (payload) => {
                                // Support pour les anciennes et nouvelles signatures
                                const isOldFormat = typeof payload === 'number' || typeof payload === 'string';
                                const phoneId = isOldFormat ? payload : payload.phoneId || payload.id;
                                const body = isOldFormat ? {} : {
                                        reason: payload.reason,
                                        notes: payload.notes
                                };
                                
                                return {
                                        url: `/phones/${phoneId}/block`,
                                        method: 'POST',
                                        body: body
                                };
                        },
                        invalidatesTags: (result, error, payload) => {
                                const phoneId = typeof payload === 'number' ? payload : (payload.phoneId || payload.id);
                                return [
                                        { type: 'Phone', id: phoneId },
                                        { type: 'Phone', id: 'LIST' }
                                ];
                        },
                }),
                unblockPhone: builder.mutation({
                        query: (id) => ({
                                url: `/phones/${id}/unblock`,
                                method: 'POST',
                        }),
                        invalidatesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                deactivatePhone: builder.mutation({
                        query: (id) => ({
                                url: `/phones/${id}/deactivate`,
                                method: 'POST',
                        }),
                        invalidatesTags: (result, error, id) => [{ type: 'Phone', id }],
                }),
                getPhoneWithPaymentStatus: builder.query({
                        query: () => '/phones/lines/with-payment-status',
                        providesTags: ['Phone']
                }),
                getPhonesToBlock: builder.query({
                        query: () => '/phones/lines/to-block',
                        providesTags: ['Phone']
                }),
                getPhonesOverdue: builder.query({
                        query: () => '/phones/lines/overdue',
                        providesTags: ['Phone']
                }),
                getPhonesToActivate: builder.query({
                        query: () => '/phones/lines/to-activate',
                        providesTags: ['Phone']
                }),
                // Historique des paiements d'une ligne spécifique
                getPhonePaymentHistory: builder.query({
                        query: (phoneId) => `/phones/${phoneId}/payment-history`,
                        providesTags: (result, error, phoneId) => [
                                { type: 'Phone', id: `history-${phoneId}` },
                                { type: 'Phone', id: phoneId }
                        ]
                }),
                // 🆕 Demander un blocage (sans changer le statut)
                requestBlockPhone: builder.mutation({
                        query: (payload) => {
                                const phoneId = payload.phoneId || payload.id;
                                const body = {
                                        reason: payload.reason,
                                        notes: payload.notes,
                                        billing: payload.billing
                                };
                                
                                return {
                                        url: `/phones/${phoneId}/request-block`,
                                        method: 'POST',
                                        body: body
                                };
                        },
                        invalidatesTags: (result, error, payload) => {
                                const phoneId = payload.phoneId || payload.id;
                                return [
                                        { type: 'Phone', id: phoneId },
                                        { type: 'Phone', id: 'LIST' }
                                ];
                        },
                }),
                // 🆕 Confirmer/rejeter une demande de blocage (action superviseur)
                confirmBlockRequest: builder.mutation({
                        query: ({ phoneId, approved }) => ({
                                url: `/phones/${phoneId}/confirm-block`,
                                method: 'POST',
                                body: { approved }
                        }),
                        invalidatesTags: (result, error, { phoneId }) => [
                                { type: 'Phone', id: phoneId },
                                { type: 'Phone', id: 'LIST' }
                        ],
                }),
        }),
});

export const {
        useGetPhonesQuery,
        useGetPhoneByIdQuery,
        useCreatePhoneMutation,
        useUpdatePhoneMutation,
        useDeletePhoneMutation,
        useBlockPhoneMutation,
        useUnblockPhoneMutation,
        useDeactivatePhoneMutation,
        useGetPhoneWithPaymentStatusQuery,
        useGetPhonesToBlockQuery,
        useGetPhonesOverdueQuery,
        useGetPhonesToActivateQuery,
        useGetPhonePaymentHistoryQuery,
        useRequestBlockPhoneMutation, // 🆕
        useConfirmBlockRequestMutation, // 🆕
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