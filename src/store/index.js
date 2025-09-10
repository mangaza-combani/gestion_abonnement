import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { apiSlice, apiSliceWithPrefix } from './api/apiSlice';
import authReducer from './slices/authSlice';
import clientsReducer from './slices/clientsSlice';
import simCardsReducer from './slices/simCardsSlice';
import linesReducer from './slices/linesSlice';
import redAccountsReducer from './slices/redAccountsSlice';
import uiReducer from './slices/uiSlice';
import agencySlice from './slices/agencySlice';
import { subscriptionsApi } from './slices/subscriptionsSlice';
// linePaymentsApi is now injected into apiSliceWithPrefix, no need to import separately

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [apiSliceWithPrefix.reducerPath]: apiSliceWithPrefix.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    auth: authReducer,
    clients: clientsReducer,
    simCards: simCardsReducer,
    lines: linesReducer,
    redAccounts: redAccountsReducer,
    ui: uiReducer,
    agency : agencySlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(apiSliceWithPrefix.middleware)
      .concat(subscriptionsApi.middleware),
});

setupListeners(store.dispatch);

export default store;