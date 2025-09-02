import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '../../config';

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.api.baseURL}api/subscriptions`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Subscription', 'SubscriptionStats'],
  endpoints: (builder) => ({
    // Obtenir tous les abonnements
    getSubscriptions: builder.query({
      query: () => '/',
      providesTags: ['Subscription'],
    }),

    // Obtenir un abonnement par ID
    getSubscription: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),

    // Créer un nouvel abonnement
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: '/',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),

    // Mettre à jour un abonnement
    updateSubscription: builder.mutation({
      query: ({ id, ...subscriptionData }) => ({
        url: `/${id}`,
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
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),

    // Obtenir les statistiques
    getSubscriptionStats: builder.query({
      query: () => '/stats/overview',
      providesTags: ['SubscriptionStats'],
    }),

    // Obtenir les abonnements par type
    getSubscriptionsByType: builder.query({
      query: (type) => `/type/${type}`,
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