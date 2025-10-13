import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1'
};

const MetricCard = ({ title, value, percentage, color = 'primary' }) => (
  <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" color={`${color}.main`} gutterBottom>
      {value}
    </Typography>
    {percentage !== undefined && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          {percentage}%
        </Typography>
      </Box>
    )}
  </Paper>
);

const SystemHealthIndicator = ({ health }) => {
  let color = 'success';
  let label = 'Excellent';

  if (health < 50) {
    color = 'error';
    label = 'Critique';
  } else if (health < 70) {
    color = 'warning';
    label = 'Attention';
  } else if (health < 85) {
    color = 'info';
    label = 'Bon';
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h3" color={`${color}.main`} gutterBottom>
        {health}%
      </Typography>
      <Chip
        label={label}
        color={color}
        variant="outlined"
        size="small"
      />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        Santé du système
      </Typography>
    </Box>
  );
};

const LinesStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Actives', value: data.active, color: COLORS.success },
    { name: 'À activer', value: data.toActivate, color: COLORS.warning },
    { name: 'Bloquées', value: data.blocked, color: COLORS.error },
    { name: 'En attente paiement', value: data.pendingPayment, color: COLORS.info }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const AgencyPerformanceTable = ({ agencies }) => {
  if (!agencies.topPerformers || agencies.topPerformers.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" sx={{ p: 2 }}>
        Aucune donnée d'agence disponible
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Agence</TableCell>
            <TableCell align="right">CA Mensuel</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agencies.topPerformers.map((agency, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ width: 24, height: 24 }}
                  />
                  {agency.name}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography color="success.main" fontWeight="medium">
                  {agency.revenue}€
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AdvancedMetrics = ({ dashboardData, metrics, loading = false }) => {
  if (loading || !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Chargement des métriques avancées...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Métriques principales */}
      <Grid item xs={12} lg={8}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <MetricCard
              title="Taux d'activation"
              value={`${dashboardData.lines.activationRate}%`}
              percentage={dashboardData.lines.activationRate}
              color="success"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              title="Actions requises"
              value={`${metrics.actionNeededPercentage}%`}
              percentage={metrics.actionNeededPercentage}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              title="Taux recouvrement"
              value={`${metrics.recoveryRate}%`}
              percentage={metrics.recoveryRate}
              color="info"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              title="Stock SIM"
              value={dashboardData.operations.simStock}
              color={dashboardData.operations.simStock < 10 ? 'error' : 'success'}
            />
          </Grid>
        </Grid>

        {/* Graphique répartition des lignes */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Répartition des lignes par statut
          </Typography>
          <LinesStatusChart data={dashboardData.lines} />
        </Paper>
      </Grid>

      {/* Santé système et Top agences */}
      <Grid item xs={12} lg={4}>
        {/* Santé du système */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            État général
          </Typography>
          <SystemHealthIndicator health={metrics.systemHealth} />

          {/* Indicateurs secondaires */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Alertes critiques
              </Typography>
              <Typography variant="h6" color="error.main">
                {metrics.criticalAlertsCount}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Rev./ligne
              </Typography>
              <Typography variant="h6" color="primary.main">
                {dashboardData.finances.averageRevenuePerLine.toFixed(0)}€
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Top agences */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top agences (CA mensuel)
          </Typography>
          <AgencyPerformanceTable agencies={dashboardData.agencies} />
        </Paper>
      </Grid>

      {/* Résumé financier */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Résumé financier
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography color="success.main" variant="h4">
                  {dashboardData.finances.monthlyRevenue}€
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Revenus du mois
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography color="error.main" variant="h4">
                  {dashboardData.finances.totalOverdueAmount}€
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Montant en retard
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography color="warning.main" variant="h4">
                  {dashboardData.finances.overdueInvoicesCount}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Factures en retard
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography color="primary.main" variant="h4">
                  {dashboardData.finances.averageRevenuePerLine.toFixed(0)}€
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Moyenne par ligne
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdvancedMetrics;