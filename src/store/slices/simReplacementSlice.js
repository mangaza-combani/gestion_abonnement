import { apiSliceWithPrefix } from '../api/apiSlice';

// RTK Query API endpoints pour les remplacements SIM
export const simReplacementApiSlice = apiSliceWithPrefix.injectEndpoints({
  endpoints: (builder) => ({
    // Traiter une demande de remplacement SIM (vol/perte)
    processSimReplacementRequest: builder.mutation({
      query: (payload) => ({
        url: '/sim-replacement/process',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        'Phone',
        { type: 'Phone', id: 'LIST' },
        'PhoneToBlock', // Invalider onglet À BLOQUER
        'ClientToOrder'
      ]
    }),

    // Confirmations superviseur (blocage RED + commande SIM)
    confirmSimReplacementActions: builder.mutation({
      query: (payload) => ({
        url: '/sim-replacement/confirm-actions',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        'Phone',
        { type: 'Phone', id: 'LIST' },
        'PhoneToBlock', // Retirer de À BLOQUER
        'PhoneToActivate', // Ajouter dans À ACTIVER
        'ClientToOrder', // Ou dans À COMMANDER selon le cas
        'PhonesList', // Mettre à jour liste générale
        'Reservation', // Mettre à jour réservations
        'LineReservation' // Forcer rafraîchissement onglet À ACTIVER
      ]
    }),

    // Déclarer la réception d'une SIM de remplacement
    declareSimReplacementReceived: builder.mutation({
      query: (payload) => ({
        url: '/sim-replacement/declare-received',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        'Phone',
        { type: 'Phone', id: 'LIST' },
        'PhoneToActivate', // Mettre à jour statut dans À ACTIVER
        'PhonesList', // Mettre à jour liste générale
        'Reservation', // Mettre à jour réservations
        'LineReservation' // Forcer rafraîchissement onglet À ACTIVER
      ]
    }),

    // 🆕 Commander une SIM de remplacement pour ligne en pause
    orderReplacementSim: builder.mutation({
      query: (payload) => ({
        url: '/sim-replacement/order-replacement',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        'Phone',
        { type: 'Phone', id: 'LIST' },
        'ClientToOrder', // Ligne va apparaître dans À COMMANDER
        'PhonesList', // Mettre à jour liste des lignes
        'Reservation', // Mettre à jour réservations
        'LineReservation', // Forcer rafraîchissement onglet À ACTIVER
        'PhoneToActivate' // Au cas où elle va dans À ACTIVER
      ]
    })
  })
});

// Export des hooks générés automatiquement
export const {
  useProcessSimReplacementRequestMutation,
  useConfirmSimReplacementActionsMutation,
  useDeclareSimReplacementReceivedMutation,
  useOrderReplacementSimMutation // 🆕 NOUVEAU HOOK
} = simReplacementApiSlice;