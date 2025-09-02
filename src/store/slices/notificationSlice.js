import { apiSlice } from '../api/apiSlice';

// Extension de l'API avec les endpoints pour les notifications
export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer toutes les notifications
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: (result) =>
        result?.userNotification
          ? [
              ...result.userNotification.map(({ id }) => ({ type: 'Notification', id })),
              { type: 'Notification', id: 'LIST' }
            ]
          : [{ type: 'Notification', id: 'LIST' }]
    }),

    // Récupérer les statistiques des notifications
    getNotificationCounts: builder.query({
      query: () => '/notifications/counts',
      providesTags: [{ type: 'Notification', id: 'COUNTS' }]
    }),

    // Marquer une notification comme lue/pas lue
    markNotificationAsRead: builder.mutation({
      query: ({ id, status }) => ({
        url: `/notification/${id}/mark-read`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' }
      ]
    }),

    // Marquer toutes les notifications comme lues
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH'
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' }
      ]
    }),

    // Récupérer une notification spécifique (marque automatiquement comme lue)
    getNotification: builder.query({
      query: (id) => `/notification/${id}`,
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' }
      ]
    })
  })
});

// Export des hooks générés automatiquement
export const {
  useGetNotificationsQuery,
  useGetNotificationCountsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetNotificationQuery
} = notificationApiSlice;