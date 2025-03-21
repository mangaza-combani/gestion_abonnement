import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './api/apiSlice';
import authReducer from './slices/authSlice';
import clientsReducer from './slices/clientsSlice';
import simCardsReducer from './slices/simCardsSlice';
import linesReducer from './slices/linesSlice';
import redAccountsReducer from './slices/redAccountsSlice';
import uiReducer from './slices/uiSlice';
import agencySlice from './slices/agencySlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    clients: clientsReducer,
    simCards: simCardsReducer,
    lines: linesReducer,
    redAccounts: redAccountsReducer,
    ui: uiReducer,
    agency : agencySlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export default store;