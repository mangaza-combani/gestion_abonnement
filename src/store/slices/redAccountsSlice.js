import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// Status constants
export const LINE_STATUSES = {
  ATTRIBUTED: "attributed",
  UNATTRIBUTED: "unattributed",
  TERMINATED: "terminated",
  BLOCKED: "blocked",
  PAUSED: "paused",
  WAITING_SIM: "waiting_for_sim"
};

// Fonction utilitaire pour vérifier si une ligne résiliée est disponible (plus d'un an)
export const isTerminatedLineAvailable = (terminatedAt) => {
  if (!terminatedAt) return false;
  
  const terminationDate = new Date(terminatedAt);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return terminationDate <= oneYearAgo;
};

// Fonction utilitaire pour analyser la disponibilité des comptes
export const analyzeAccountsAvailability = (accounts, agencyId = null) => {
  const filtered = agencyId 
    ? accounts.filter(account => account.agencyId === agencyId) 
    : accounts;
    
  const analyzed = filtered.map(account => {
    const terminatedLines = account.lines?.filter(line => 
      line.status === LINE_STATUSES.TERMINATED && 
      isTerminatedLineAvailable(line.terminatedAt)
    ) || [];
    
    return {
      ...account,
      availableSlots: account.maxLines - account.activeLines,
      terminatedLines: terminatedLines,
      canAcceptNewLine: account.activeLines < account.maxLines
    };
  });
  
  return {
    availableAccounts: analyzed.filter(acc => acc.availableSlots > 0 || acc.terminatedLines.length > 0),
    terminatedLines: analyzed.flatMap(acc => acc.terminatedLines)
  };
};

// Extension de l'API avec les endpoints pour les comptes RED
export const redAccountsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer tous les comptes RED
    getRedAccounts: builder.query({
      query: () => '/v1/red-accounts',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'RedAccount', id })),
              { type: 'RedAccount', id: 'LIST' }
            ]
          : [{ type: 'RedAccount', id: 'LIST' }]
    }),
    
    // Récupérer les comptes RED par agence
    getRedAccountsByAgency: builder.query({
      query: (agencyId) => `/v1/agencies/${agencyId}/red-accounts`,
      providesTags: (result, error, agencyId) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'RedAccount', id })),
              { type: 'RedAccount', id: `Agency_${agencyId}` }
            ]
          : [{ type: 'RedAccount', id: `Agency_${agencyId}` }]
    }),
    
    // Récupérer un compte RED par ID
    getRedAccountById: builder.query({
      query: (id) => `/v1/red-accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'RedAccount', id }]
    }),
    
    // Créer un nouveau compte RED
    createRedAccount: builder.mutation({
      query: (accountData) => ({
        url: '/v1/red-accounts',
        method: 'POST',
        body: accountData
      }),
      invalidatesTags: [{ type: '/v1/RedAccount', id: 'LIST' }]
    }),
    
    // Créer une nouvelle ligne sur un compte
    createLine: builder.mutation({
      query: ({ accountId, lineData }) => ({
        url: `/v1/red-accounts/${accountId}/lines`,
        method: 'POST',
        body: lineData
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'RedAccount', id: accountId }
      ]
    }),
    
    // Changer le statut d'une ligne
    changeLineStatus: builder.mutation({
      query: ({ accountId, lineId, status }) => ({
        url: `/v1/red-accounts/${accountId}/lines/${lineId}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'RedAccount', id: accountId }
      ]
    }),
    
    // Attribuer une ligne à un client
    assignLine: builder.mutation({
      query: ({ accountId, lineId, clientId, simCardId }) => ({
        url: `/v1/red-accounts/${accountId}/lines/${lineId}/assign`,
        method: 'POST',
        body: { clientId, simCardId }
      }),
      invalidatesTags: (result, error, { accountId, clientId }) => [
        { type: 'RedAccount', id: accountId },
        { type: 'Client', id: clientId }
      ]
    }),
    
    // Résilier une ligne
    terminateLine: builder.mutation({
      query: ({ accountId, lineId, reason }) => ({
        url: `/v1/red-accounts/${accountId}/lines/${lineId}/terminate`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'RedAccount', id: accountId }
      ]
    }),
    
    // Commander une carte SIM pour une ligne
    orderSimCard: builder.mutation({
      query: ({ accountId, lineId, clientId }) => ({
        url: `/v1/red-accounts/${accountId}/lines/${lineId}/order-sim`,
        method: 'POST',
        body: { clientId }
      }),
      invalidatesTags: (result, error, { accountId, clientId }) => [
        { type: 'RedAccount', id: accountId },
        { type: 'Client', id: clientId },
        { type: 'SimCard', id: 'LIST' }
      ]
    })
  })
});

// Export hooks générées automatiquement par RTK Query
export const {
  useGetRedAccountsQuery,
  useGetRedAccountsByAgencyQuery,
  useGetRedAccountByIdQuery,
  useCreateRedAccountMutation,
  useCreateLineMutation,
  useChangeLineStatusMutation,
  useAssignLineMutation,
  useTerminateLineMutation,
  useOrderSimCardMutation
} = redAccountsApiSlice;

// Slice local pour la gestion de l'état UI
const redAccountsSlice = createSlice({
  name: 'redAccounts',
  initialState: {
    selectedAccount: null,
    filter: null
  },
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    clearSelection: (state) => {
      state.selectedAccount = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearFilter: (state) => {
      state.filter = null;
    }
  }
});

// Exportation des actions et du reducer
export const { selectAccount, clearSelection, setFilter, clearFilter } = redAccountsSlice.actions;
export default redAccountsSlice.reducer;

// Sélecteurs personnalisés utilisant RTK Query
// Ils utilisent les données mises en cache par RTK Query

// Sélectionner les comptes avec disponibilité
export const selectAvailableAccounts = (state, agencyId = null) => {
  const { data: accounts = [] } = apiSlice.endpoints.getRedAccounts.select()(state);
  const { availableAccounts } = analyzeAccountsAvailability(accounts, agencyId);
  return availableAccounts;
};

// Sélectionner les lignes résiliées disponibles
export const selectTerminatedLines = (state) => {
  const { data: accounts = [] } = apiSlice.endpoints.getRedAccounts.select()(state);
  const { terminatedLines } = analyzeAccountsAvailability(accounts);
  return terminatedLines;
};

// Sélectionner les lignes non attribuées
export const selectUnattributedLines = (state) => {
  const { data: accounts = [] } = apiSlice.endpoints.getRedAccounts.select()(state);
  const lines = [];
  
  accounts.forEach(account => {
    account.lines?.forEach(line => {
      if (line.status === LINE_STATUSES.UNATTRIBUTED) {
        lines.push({ ...line, accountId: account.id });
      }
    });
  });
  
  return lines;
};

// Sélectionner le compte choisi
export const selectSelectedAccount = (state) => state.redAccounts.selectedAccount;

// Fonctions utilitaires pour transformer les résultats des requêtes
export const transformAccount = (account) => {
  if (!account) return null;
  
  // Calcul des lignes disponibles, etc.
  const terminatedLines = account.lines?.filter(line => 
    line.status === LINE_STATUSES.TERMINATED && 
    isTerminatedLineAvailable(line.terminatedAt)
  ) || [];
  
  return {
    ...account,
    availableSlots: account.maxLines - account.activeLines,
    terminatedLines,
    canAcceptNewLine: account.activeLines < account.maxLines,
    availableLines: [...(account.lines?.filter(line => 
      line.status === LINE_STATUSES.UNATTRIBUTED) || []), ...terminatedLines]
  };
};