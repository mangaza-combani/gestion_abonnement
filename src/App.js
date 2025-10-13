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
  const token = localStorage.getItem('token');

  // Double vérification: Redux state + token localStorage
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // Vérifier l'authentification d'abord
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Invalid user data in localStorage:', error);
    // Ne pas supprimer immédiatement, juste rediriger
    return <Navigate to="/login" replace />;
  }

  // Si pas d'utilisateur ou pas de rôle
  if (!user || !user.role) {
    console.warn('Utilisateur sans rôle détecté');
    return <Navigate to="/login" replace />;
  }

  // Vérifier si le rôle de l'utilisateur est autorisé
  if (!allowedRoles.includes(user.role)) {
    console.warn(`Accès refusé: rôle ${user.role} non autorisé pour cette page`);
    // Rediriger vers dashboard au lieu de déconnecter
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Helper pour les routes superviseur uniquement
const SupervisorRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleBasedRoute>
);

// Helper pour les routes agence uniquement
const AgencyRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['AGENCY']}>
    {children}
  </RoleBasedRoute>
);

// Helper pour dashboard adaptatif
const DashboardRoute = ({ supervisorComponent, agencyComponent }) => {
  const userData = localStorage.getItem('user');
  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Invalid user data in localStorage:', error);
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const isSupervisor = ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'].includes(user.role);
  return isSupervisor ? supervisorComponent : agencyComponent;
};

// Composant pour empêcher l'accès à /login si déjà connecté
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  // Si l'utilisateur est connecté, rediriger vers dashboard
  if (isAuthenticated && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Route publique de connexion - redirige si déjà connecté */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

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
                  <DashboardRoute
                    agencyComponent={<AgencyDashboard />}
                    supervisorComponent={<SupervisorDashboard />}
                  />
                }
              />

              {/* Routes Superviseur uniquement */}
              <Route
                path="agencies"
                element={
                  <SupervisorRoute>
                    <AgenciesManagement />
                  </SupervisorRoute>
                }
              />
              <Route
                path="subscriptions"
                element={
                  <SupervisorRoute>
                    <SubscriptionsManagement />
                  </SupervisorRoute>
                }
              />
              <Route
                path="accountresign"
                element={
                  <SupervisorRoute>
                    <AccountResign />
                  </SupervisorRoute>
                }
              />
              <Route
                path="user"
                element={
                  <SupervisorRoute>
                    <UsersManagement />
                  </SupervisorRoute>
                }
              />

              {/* Route Gestion Lignes - Accessible par Superviseur ET Agence */}
              <Route
                path="lines"
                element={
                  <RoleBasedRoute allowedRoles={['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'AGENCY']}>
                    <LinesManagement />
                  </RoleBasedRoute>
                }
              />

              {/* Routes Agence uniquement */}
              <Route
                path="sim-stock"
                element={
                  <AgencyRoute>
                    <SimStock />
                  </AgencyRoute>
                }
              />

              {/* Routes Superviseur uniquement (non accessibles par Agence) */}
              <Route
                path="commissions"
                element={
                  <SupervisorRoute>
                    <CommissionWithdrawal />
                  </SupervisorRoute>
                }
              />
              <Route
                path="my-lines"
                element={
                  <SupervisorRoute>
                    <MyLines />
                  </SupervisorRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <SupervisorRoute>
                    <Settings />
                  </SupervisorRoute>
                }
              />

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