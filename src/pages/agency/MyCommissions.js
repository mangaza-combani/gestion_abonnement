import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import {
  useGetCurrentMonthByAgencyQuery,
  useGetCommissionHistoryQuery,
  useDeclarePaymentMutation
} from '../../store/slices/commissionsSlice';

const MyCommissions = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(''); // '' = mois courant

  // Récupérer l'ID de l'agence connectée depuis le store auth
  const user = useSelector((state) => state.auth.user);
  const agencyId = user?.agencyId;

  // Hook pour déclarer un paiement
  const [declarePayment, { isLoading: isDeclaring }] = useDeclarePaymentMutation();

  // Générer la liste des 12 derniers mois
  const generatePeriods = () => {
    const periods = [{ value: '', label: 'Mois courant' }];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      periods.push({ value, label });
    }

    return periods;
  };

  const periods = generatePeriods();

  // Récupérer les commissions du mois courant
  const {
    data: currentMonthData,
    isLoading: currentLoading,
    error: currentError,
    refetch: refetchCurrent
  } = useGetCurrentMonthByAgencyQuery(
    { agencyId, month: selectedPeriod || undefined },
    { skip: !agencyId }
  );

  // Récupérer l'historique des commissions (6 derniers mois)
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError
  } = useGetCommissionHistoryQuery(
    { agencyId, periods: 6 },
    { skip: !agencyId }
  );

  // Render loading state
  if (currentLoading || historyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (currentError || historyError) {
    const error = currentError || historyError;
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error.status === 'FETCH_ERROR'
            ? 'Impossible de se connecter au serveur.'
            : error.data?.message || 'Une erreur est survenue lors du chargement des commissions.'}
        </Alert>
      </Box>
    );
  }

  const { agency, period, totalCommission, totalSupervisorAmount, totalRevenue, details = [], paymentsProcessed, isPaid, paymentStatus } = currentMonthData || {};
  const { history = [] } = historyData || {};

  // Filtrer l'historique pour ne garder que les périodes avec montant non nul
  const filteredHistory = history.filter(item =>
    item.totalCommission > 0 || item.totalSupervisorAmount > 0
  );

  // Vérifier si on peut déclarer le paiement (doit être au moins le 10)
  const canDeclarePayment = () => {
    const now = new Date();
    const currentDay = now.getDate();

    // Si on regarde le mois courant (selectedPeriod est vide), vérifier qu'on est au moins le 10
    if (!selectedPeriod || selectedPeriod === '') {
      return currentDay >= 10;
    }

    // Pour les mois passés, toujours autorisé
    const selectedDate = new Date(selectedPeriod + '-01');
    return selectedDate < new Date(now.getFullYear(), now.getMonth(), 1) || currentDay >= 10;
  };

  // Handler pour déclarer le paiement
  const handleDeclarePayment = async () => {
    try {
      const periodMonth = selectedPeriod || new Date().toISOString().slice(0, 7);
      await declarePayment(periodMonth).unwrap();
      refetchCurrent();
      alert('Paiement déclaré avec succès');
    } catch (error) {
      console.error('Erreur lors de la déclaration:', error);
      alert(error.data?.message || 'Erreur lors de la déclaration du paiement');
    }
  };

  // Déterminer le statut de paiement
  const getPaymentStatusInfo = () => {
    if (!paymentStatus) {
      return { label: 'Non déclaré', color: 'default', bgColor: 'grey.300' };
    }
    switch (paymentStatus) {
      case 'PENDING':
        return { label: 'Non déclaré', color: 'warning', bgColor: 'warning.main' };
      case 'DECLARED':
        return { label: 'Déclaré payé', color: 'info', bgColor: 'info.main' };
      case 'CONFIRMED':
        return { label: 'Confirmé', color: 'success', bgColor: 'success.main' };
      default:
        return { label: 'Non déclaré', color: 'default', bgColor: 'grey.300' };
    }
  };

  const statusInfo = getPaymentStatusInfo();

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Mes Commissions
          </Typography>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={selectedPeriod}
              label="Période"
              onChange={(e) => setSelectedPeriod(e.target.value)}
              size="small"
            >
              {periods.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {agency?.name} - {period?.label}
        </Typography>
      </Box>

      {/* Cartes récapitulatives */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Ma Commission
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {(totalCommission || 0).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}€
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {paymentsProcessed || 0} paiements
                  </Typography>
                </Box>
                <EuroIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    À Verser au Superviseur
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {(totalSupervisorAmount || 0).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}€
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Montant dû
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: statusInfo.bgColor, color: 'white' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Statut du Paiement
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {statusInfo.label}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
              {paymentStatus !== 'CONFIRMED' && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleDeclarePayment}
                  disabled={isDeclaring || paymentStatus === 'DECLARED' || !canDeclarePayment()}
                  sx={{
                    mt: 1,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {isDeclaring ? 'Déclaration...' :
                   paymentStatus === 'DECLARED' ? 'En attente confirmation' :
                   !canDeclarePayment() ? 'Disponible à partir du 10' :
                   'Déclarer avoir payé'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Historique simple */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historique des Paiements
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {filteredHistory.length === 0 ? (
            <Alert severity="info">
              Aucun historique disponible
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Période</strong></TableCell>
                    <TableCell align="right"><strong>Ma Commission</strong></TableCell>
                    <TableCell align="right"><strong>Versé au Superviseur</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((item, index) => {
                    const historyStatus = item.paymentStatus || (item.isPaid ? 'CONFIRMED' : 'PENDING');
                    const historyStatusInfo =
                      historyStatus === 'CONFIRMED' ? { label: 'Confirmé', color: 'success' } :
                      historyStatus === 'DECLARED' ? { label: 'Déclaré payé', color: 'info' } :
                      { label: 'Non déclaré', color: 'warning' };

                    return (
                      <TableRow key={index} hover>
                        <TableCell>{item.period.label}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="success.main">
                            {(item.totalCommission || 0).toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}€
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="primary.main">
                            {(item.totalSupervisorAmount || 0).toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}€
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={historyStatusInfo.label}
                            color={historyStatusInfo.color}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyCommissions;
