import { apiSlice } from '../api/apiSlice';

export const bankManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer les comptes bancaires pour sélection
    getBankAccountsForSelection: builder.query({
      query: () => '/api/bank-management/accounts-for-selection',
      providesTags: ['BankAccount'],
    }),

    // Récupérer tous les comptes bancaires avec calculs
    getAllBankAccountsWithPaymentInfo: builder.query({
      query: () => '/api/bank-management/overview',
      providesTags: ['BankAccount'],
    }),

    // Récupérer les cartes qui expirent
    getExpiringCards: builder.query({
      query: () => '/api/bank-management/expiring-cards',
      providesTags: ['BankCard'],
    }),

    // Récupérer les détails d'un compte bancaire
    getBankAccountDetails: builder.query({
      query: (bankAccountId) => `/api/bank-management/accounts/${bankAccountId}`,
      providesTags: (result, error, id) => [{ type: 'BankAccount', id }],
    }),

    // Créer un nouveau compte bancaire
    createBankAccount: builder.mutation({
      query: (data) => ({
        url: '/api/bank-management/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BankAccount'],
    }),

    // Mettre à jour un compte bancaire
    updateBankAccount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/bank-management/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'BankAccount',
        { type: 'BankAccount', id },
      ],
    }),

    // Ajouter une carte bancaire
    addBankCard: builder.mutation({
      query: ({ bankAccountId, ...cardData }) => ({
        url: `/api/bank-management/accounts/${bankAccountId}/cards`,
        method: 'POST',
        body: cardData,
      }),
      invalidatesTags: ['BankAccount', 'BankCard'],
    }),

    // Mettre à jour une carte bancaire
    updateBankCard: builder.mutation({
      query: ({ cardId, ...cardData }) => ({
        url: `/api/bank-management/cards/${cardId}`,
        method: 'PUT',
        body: cardData,
      }),
      invalidatesTags: ['BankAccount', 'BankCard'],
    }),

    // Supprimer une carte bancaire
    deleteBankCard: builder.mutation({
      query: (cardId) => ({
        url: `/api/bank-management/cards/${cardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccount', 'BankCard'],
    }),

    // Lier un compte RED à un compte bancaire
    linkRedAccountToBankAccount: builder.mutation({
      query: ({ redAccountId, bankAccountId }) => ({
        url: `/api/bank-management/red-accounts/${redAccountId}/link`,
        method: 'PUT',
        body: { bankAccountId },
      }),
      invalidatesTags: ['BankAccount', 'RedAccount'],
    }),
  }),
});

export const {
  useGetBankAccountsForSelectionQuery,
  useGetAllBankAccountsWithPaymentInfoQuery,
  useGetExpiringCardsQuery,
  useGetBankAccountDetailsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useAddBankCardMutation,
  useUpdateBankCardMutation,
  useDeleteBankCardMutation,
  useLinkRedAccountToBankAccountMutation,
} = bankManagementApiSlice;
