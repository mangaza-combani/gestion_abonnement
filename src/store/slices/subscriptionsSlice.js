import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../api/apiSlice';

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Subscription', 'SubscriptionStats'],
  endpoints: (builder) => ({
    // Obtenir tous les abonnements
    getSubscriptions: builder.query({
      query: () => '/subscriptions/',
      providesTags: ['Subscription'],
    }),

    // Obtenir un abonnement par ID
    getSubscription: builder.query({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),

    // Créer un nouvel abonnement
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: '/subscriptions/',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),

    // Mettre à jour un abonnement
    updateSubscription: builder.mutation({
      query: ({ id, ...subscriptionData }) => ({
        url: `/subscriptions/${id}`,
        method: 'PUT',
        body: subscriptionData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        'Subscription',
        'SubscriptionStats'
      ],
    }),

    // Supprimer/désactiver un abonnement
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),

    // Obtenir les statistiques
    getSubscriptionStats: builder.query({
      query: () => '/subscriptions/stats/overview',
      providesTags: ['SubscriptionStats'],
    }),

    // Obtenir les abonnements par type
    getSubscriptionsByType: builder.query({
      query: (type) => `/subscriptions/type/${type}`,
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetSubscriptionStatsQuery,
  useGetSubscriptionsByTypeQuery,
} = subscriptionsApi;