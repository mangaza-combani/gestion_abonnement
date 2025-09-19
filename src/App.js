// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';
import { useSocket } from './hooks/useSocket';
import SocketProvider from './components/layout/SocketProvider';

// Theme and Store
import { theme } from './theme/theme';
import { store } from './store/';

// Layouts
import MainLayout from './components/layout/MainLayaout';

// Pages
import LoginPage from './pages/auth/loginPage';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import AgencyDashboard from './pages/dashboard/AgencyDashboard';
import AgenciesManagement from './pages/supervisor/AgenciesManagement';
import LinesManagement from './pages/supervisor/LinesManagement';
import ClientsManagement from './pages/agency/ClientsManagement';
import MyLines from './pages/agency/MyLines';
import SimStock from './pages/agency/SimStock';
import Settings from './pages/Settings';
import CommissionWithdrawal from './pages/agency/CommissionWithdrawal';
import AccountResign from './pages/supervisor/AccountResign';
import UsersManagement from './pages/supervisor/UsersManagement';
import SubscriptionsManagement from './pages/supervisor/SubscriptionsManagement';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr'); // Set the locale to French

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleBasedRoute = ({ supervisorComponent, agencyComponent }) => {
  const userData = localStorage.getItem('user');
  let user = null;
  
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Invalid user data in localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  const { role } = useSelector((state) => {
    return {
      role: user ? user.role : null,
    };
  });
    if (!role) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return <Navigate to="/login" />;
    }
  return (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === "SUPERVISOR") ? supervisorComponent : agencyComponent;
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Route publique de connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <MainLayout />
                  </SocketProvider>
                </ProtectedRoute>
              }
            >
              {/* Redirection par défaut */}
              <Route index element={<Navigate to="/dashboard" />} />

              {/* Dashboard selon le rôle */}
              <Route
                path="dashboard"
                element={
                  <RoleBasedRoute
                    agencyComponent={<AgencyDashboard />}
                    supervisorComponent={<SupervisorDashboard />}
                  />
                }
              />

              {/* Routes Superviseur */}
              <Route path="agencies" element={<AgenciesManagement />} />
              <Route path="subscriptions" element={<SubscriptionsManagement />} />
              <Route path="commissions" element={<CommissionWithdrawal />} />
              <Route path="accountresign" element={<AccountResign />} />
              <Route path="user" element={<UsersManagement />} />

              {/* Routes Communes */}
              <Route path="lines" element={<LinesManagement />} />

              {/* Routes Agence */}
              <Route path="my-lines" element={<MyLines />} />
              <Route path="sim-stock" element={<SimStock />} />

              {/* Route commune */}
              <Route path="settings" element={<Settings />} />

              {/* Redirection pour les routes inconnues */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;