import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
// Import de la configuration API
import API_CONFIG from '../../config/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MyCommissions = () => {
  const [distributions, setDistributions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction API locale
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { authorization: `Bearer ${token}` }),
        },
        ...(data && { body: JSON.stringify(data) }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
  const [filters, setFilters] = useState({
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    distributionType: '',
    page: 1,
    limit: 20
  });

  // Types de distribution avec couleurs
  const distributionTypes = {
    'NORMAL': { label: 'Normal', color: 'success' },
    'PARTIAL_PAYMENT': { label: 'Partiel', color: 'warning' },
    'ADVANCE_PAYMENT': { label: 'Avance', color: 'info' },
    'SIM_FEE_ONLY': { label: 'SIM uniquement', color: 'secondary' }
  };

  useEffect(() => {
    fetchMyDistributions();
    fetchMyStats();
  }, [filters.period]);

  const fetchMyDistributions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiCall(`/agency/distributions/my-distributions?${queryParams}`, 'GET');
      if (response.success) {
        setDistributions(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur distributions:', error);
    }
    setLoading(false);
  };

  const fetchMyStats = async () => {
    try {
      const response = await apiCall(`/agency/commissions/dashboard?period=${filters.period}`, 'GET');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
      page: 1 // Reset page
    }));
  };

  const handleRefresh = () => {
    fetchMyDistributions();
    fetchMyStats();
  };

  // Calculer les totaux des distributions affichées
  const totals = distributions.reduce((acc, dist) => {
    acc.totalPayments += dist.paymentAmount;
    acc.totalCommission += dist.agencyCommission;
    acc.count += 1;
    return acc;
  }, { totalPayments: 0, totalCommission: 0, count: 0 });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          💰 Mes Commissions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {/* Résumé Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Commissions ({filters.period})
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(totals.totalCommission)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    sur {formatCurrency(totals.totalPayments)} de paiements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Nombre de Distributions
                  </Typography>
                  <Typography variant="h6">
                    {totals.count}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    clients payants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Commission Moyenne
                  </Typography>
                  <Typography variant="h6">
                    {totals.count > 0 ? formatCurrency(totals.totalCommission / totals.count) : formatCurrency(0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    par client
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Filtres
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Période"
              type="month"
              value={filters.period}
              onChange={handleFilterChange('period')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Type de Distribution"
              value={filters.distributionType}
              onChange={handleFilterChange('distributionType')}
            >
              <MenuItem value="">Tous les types</MenuItem>
              {Object.entries(distributionTypes).map(([key, type]) => (
                <MenuItem key={key} value={key}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: '56px' }}
              onClick={fetchMyDistributions}
            >
              Appliquer les filtres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Règle de 3 Explication */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" component="div">
          <strong>🧮 Comment vos commissions sont calculées:</strong>
          <br />
          • Votre Commission = (Montant payé par client × Votre taux configuré) ÷ Prix abonnement
          <br />
          • Les frais SIM (10€) vont exclusivement au superviseur
          <br />
          • Exemple: Client paie 15€ sur abonnement 20€, votre taux 4€ → Commission = (15€ × 4€) ÷ 20€ = 3€
        </Typography>
      </Alert>

      {/* Table des distributions */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Téléphone</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Abonnement</TableCell>
                <TableCell>Montant Payé</TableCell>
                <TableCell>Votre Commission</TableCell>
                <TableCell>% Commission</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributions.map((distribution) => {
                const commissionPercent = distribution.paymentAmount > 0
                  ? Math.round((distribution.agencyCommission / distribution.paymentAmount) * 100 * 100) / 100
                  : 0;

                return (
                  <TableRow key={distribution.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {distribution.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{distribution.clientName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {distribution.subscriptionName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(distribution.paymentAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {formatCurrency(distribution.agencyCommission)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${commissionPercent}%`}
                        color={commissionPercent >= 15 ? 'success' : commissionPercent >= 10 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={distributionTypes[distribution.distributionType]?.label || distribution.distributionType}
                        color={distributionTypes[distribution.distributionType]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(distribution.paymentDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {distributions.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              Aucune commission trouvée pour cette période
            </Typography>
          </Box>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      {/* Résumé période */}
      {distributions.length > 0 && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📊 Résumé - {filters.period}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Total Paiements Reçus
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(totals.totalPayments)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Vos Commissions
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(totals.totalCommission)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Taux Moyen
                  </Typography>
                  <Typography variant="h6">
                    {totals.totalPayments > 0
                      ? Math.round((totals.totalCommission / totals.totalPayments) * 100 * 100) / 100
                      : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default MyCommissions;