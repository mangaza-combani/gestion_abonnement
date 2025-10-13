import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  PeopleAlt,
  PhoneAndroid,
  Euro,
  TrendingUp,
  Refresh,
  Warning,
  CheckCircle,
  Assignment,
  Assessment
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import AdvancedMetrics from '../../components/dashboard/AdvancedMetrics';
import useSupervisorDashboard from '../../hooks/useSupervisorDashboard';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && (
      <Box sx={{ pt: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const SupervisorDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // Utilisation du hook personnalisé pour récupérer les données
  const {
    dashboardData,
    alerts,
    metrics,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale
  } = useSupervisorDashboard({
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    autoRefresh: true,
    includeAlerts: true
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Affichage pendant le chargement
  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement du dashboard...</Typography>
      </Box>
    );
  }

  // Affichage en cas d'erreur critique
  if (error && !dashboardData) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={refresh}>
            <Refresh />
          </IconButton>
        }
      >
        Erreur de chargement: {error}
      </Alert>
    );
  }

  const data = dashboardData || {};
  const overview = data.overview || {};
  const lines = data.lines || {};
  const finances = data.finances || {};
  const operations = data.operations || {};

  return (
    <Box>
      {/* En-tête avec statut et contrôles */}
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Dashboard Superviseur
          </Typography>

          {/* Indicateur de fraîcheur des données */}
          {isStale ? (
            <Chip
              icon={<Warning />}
              label="Données anciennes"
              color="warning"
              size="small"
            />
          ) : (
            <Chip
              icon={<CheckCircle />}
              label="Données à jour"
              color="success"
              size="small"
            />
          )}

          {/* Alertes critiques */}
          {metrics?.criticalAlertsCount > 0 && (
            <Chip
              icon={<Warning />}
              label={`${metrics.criticalAlertsCount} alerte${metrics.criticalAlertsCount > 1 ? 's' : ''} critique${metrics.criticalAlertsCount > 1 ? 's' : ''}`}
              color="error"
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {lastUpdated && `Mis à jour: ${new Date(lastUpdated).toLocaleTimeString()}`}
          </Typography>
          <Tooltip title="Actualiser">
            <IconButton onClick={refresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Affichage d'erreur non-critique */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} - Affichage des dernières données disponibles
        </Alert>
      )}

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={overview.totalClients || 0}
            icon={<PeopleAlt />}
            color="primary"
            subtitle={`${overview.totalAgencies || 0} agences`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lignes Actives"
            value={lines.active || 0}
            icon={<PhoneAndroid />}
            color="success"
            subtitle={`${lines.activationRate || 0}% du total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenu Mensuel"
            value={`${finances.monthlyRevenue || 0}€`}
            icon={<Euro />}
            color="success"
            subtitle={`Moy: ${finances.averageRevenuePerLine?.toFixed(0) || 0}€/ligne`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="À Activer"
            value={lines.toActivate || 0}
            icon={<Assignment />}
            color="warning"
            subtitle={`${lines.blocked || 0} bloquées`}
          />
        </Grid>
      </Grid>

      {/* Onglets pour les vues détaillées */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="Alertes"
            icon={<Warning />}
            iconPosition="start"
          />
          <Tab
            label="Métriques Avancées"
            icon={<Assessment />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <AlertsPanel alerts={alerts} loading={loading} />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <AdvancedMetrics
            dashboardData={dashboardData}
            metrics={metrics}
            loading={loading}
          />
        </TabPanel>
      </Paper>

      {/* Résumé rapide en bas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Stock SIM
            </Typography>
            <Typography
              variant="h3"
              color={operations.simStock < 10 ? 'error.main' : 'success.main'}
            >
              {operations.simStock || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cartes disponibles
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Factures en retard
            </Typography>
            <Typography
              variant="h3"
              color={finances.overdueInvoicesCount > 0 ? 'error.main' : 'success.main'}
            >
              {finances.overdueInvoicesCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {finances.totalOverdueAmount || 0}€ au total
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Santé Système
            </Typography>
            <Typography
              variant="h3"
              color={
                (metrics?.systemHealth || 0) >= 85 ? 'success.main' :
                (metrics?.systemHealth || 0) >= 70 ? 'warning.main' : 'error.main'
              }
            >
              {metrics?.systemHealth || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              État général
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupervisorDashboard;
