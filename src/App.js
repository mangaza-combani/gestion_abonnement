// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';

// Theme and Store
import { theme } from './theme/theme';
import { store } from './store/store';

// Layouts
import MainLayout from './components/layout/MainLayaout';

// Pages
import LoginPage from './pages/auth/loginPage';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import AgencyDashboard from './pages/dashboard/AgencyDashboard';
import AgenciesManagement from './pages/supervisor/AgenciesManagement';
import LinesManagement from './pages/supervisor/LinesManagement';
import ClientsManagement from './pages/agency/ClientsManagement';
import SimStock from './pages/agency/SimStock';
import Settings from './pages/settings/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleBasedRoute = ({ supervisorComponent, agencyComponent }) => {
  const { role } = useSelector((state) => state.auth);
  return role === 'supervisor' ? supervisorComponent : agencyComponent;
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
                  <MainLayout />
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
                    supervisorComponent={<SupervisorDashboard />}
                    agencyComponent={<AgencyDashboard />}
                  />
                }
              />

              {/* Routes Superviseur */}
              <Route path="agencies" element={<AgenciesManagement />} />
              <Route path="lines" element={<LinesManagement />} />

              {/* Routes Agence */}
              <Route path="clients" element={<ClientsManagement />} />
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