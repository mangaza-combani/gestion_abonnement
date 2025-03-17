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
      state.user = payload.user;
      state.token = payload.token;
      state.role = payload.user.role;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token);
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
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
        url: '/v1/user/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/v1/user/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/v1/user/logout',
        method: 'POST',
      }),
    }),
    forgotPasswordEmail: builder.mutation({
      query: (email) => ({
        url: '/v1/user/forgot-password/email',
        method: 'POST',
        body: { email },
      }),
    }),
    forgotPasswordSms: builder.mutation({
      query: (phoneNumber) => ({
        url: '/v1/user/forgot-password/sms',
        method: 'POST',
        body: { phoneNumber },
      }),
    }),
    verifyCode: builder.mutation({
      query: (data) => ({
        url: '/v1/user/verify-code',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/v1/user/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/v1/user/change-password',
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
  useForgotPasswordEmailMutation,
  useForgotPasswordSmsMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApiSlice;

// Export du reducer
export default authSlice.reducer;