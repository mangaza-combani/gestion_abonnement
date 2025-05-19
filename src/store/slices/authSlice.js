import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// Initial state pour le auth slice
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Création du slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setCredentials: (state, { payload }) => {
      console.log('payload', payload);
      state.user = payload.user;
      state.token = payload.token;
      state.role = payload.user.role;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
  },
});

// Export des actions
export const { clearErrors, setCredentials, logOut } = authSlice.actions;

// Extension de apiSlice avec les endpoints d'authentification
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoints d'authentification
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          email: credentials.identifiant,
          password: credentials.password,
        },
      }),
    }),
    whoIAm: builder.query({
      query: () => ({
        url: "/auth/who-i-am",
        method: "GET",
      }),
      providesTags: ['User'],
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    forgotPasswordEmail: builder.mutation({
      query: (email) => ({
        url: '/auth/send-password-reset-link',
        method: 'POST',
        body: {
          fetchBy: 'email',
          email
        },
      }),
    }),
    forgotPasswordSms: builder.mutation({
      query: (phoneNumber) => ({
        url: '/auth/send-password-reset-link',
        method: 'POST',
        body: {
          fetchBy: 'phone',
          phone: phoneNumber
        },
      }),
    }),
    verifyCode: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-code',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export des hooks générés
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useWhoIAmQuery,
  useForgotPasswordEmailMutation,
  useForgotPasswordSmsMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApiSlice;

// Export du reducer
export default authSlice.reducer;