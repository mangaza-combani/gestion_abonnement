import { apiSliceWithPrefix } from '../api/apiSlice';

// RTK Query API endpoints pour les paramètres d'entreprise
export const companySettingsApiSlice = apiSliceWithPrefix.injectEndpoints({
  endpoints: (builder) => ({
    getCompanySettings: builder.query({
      query: () => '/company-settings',
      providesTags: ['CompanySettings'],
    }),
    updateCompanySettings: builder.mutation({
      query: (companyData) => ({
        url: '/company-settings',
        method: 'PUT',
        body: companyData,
      }),
      invalidatesTags: ['CompanySettings'],
    }),
  }),
});

export const {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} = companySettingsApiSlice;