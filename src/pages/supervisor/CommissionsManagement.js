import React, { useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Euro as EuroIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import {
  useGetCurrentMonthAllAgenciesQuery,
  useGetCommissionHistoryQuery,
  useConfirmPaymentMutation
} from '../../store/slices/commissionsSlice';

const CommissionsManagement = () => {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(''); // '' = mois courant

  // Hook pour confirmer un paiement
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();

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

  // Récupérer les commissions du mois courant pour toutes les agences
  const {
    data: commissionsData,
    isLoading: commissionsLoading,
    error: commissionsError,
    refetch: refetchCommissions
  } = useGetCurrentMonthAllAgenciesQuery(selectedPeriod || undefined);

  // Récupérer l'historique seulement si une agence est sélectionnée
  const {
    data: historyData,
    isLoading: historyLoading
  } = useGetCommissionHistoryQuery(
    { agencyId: selectedAgency?.agencyId, periods: 12 },
    { skip: !selectedAgency }
  );

  const handleOpenHistory = (agency) => {
    setSelectedAgency(agency);
    setHistoryDialogOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryDialogOpen(false);
    setTimeout(() => setSelectedAgency(null), 300);
  };

  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm('Confirmer la réception de ce paiement ?')) {
      return;
    }

    try {
      await confirmPayment(paymentId).unwrap();
      refetchCommissions();
      alert('Paiement confirmé avec succès');
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      alert(error.data?.message || 'Erreur lors de la confirmation du paiement');
    }
  };

  // Render loading state
  if (commissionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (commissionsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {commissionsError.status === 'FETCH_ERROR'
            ? 'Impossible de se connecter au serveur.'
            : commissionsError.data?.message || 'Une erreur est survenue lors du chargement des commissions.'}
        </Alert>
      </Box>
    );
  }

  const { period, totalCommissions, totalSupervisorAmounts, totalRevenues, agencies = [] } = commissionsData || {};

  // Filtrer les agences pour ne garder que celles avec un montant non nul
  const filteredAgencies = agencies.filter(agency =>
    agency.totalSupervisorAmount > 0 || agency.totalCommission > 0
  );

  // Calculer les totaux si pas fournis par l'API
  const computedTotalSupervisor = filteredAgencies.reduce((sum, a) => sum + (a.totalSupervisorAmount || 0), 0);
  const computedTotalRevenue = filteredAgencies.reduce((sum, a) => sum + (a.totalRevenue || 0), 0);
  const computedTotalRedCost = filteredAgencies.reduce((sum, a) => sum + (a.totalRedCost || 0), 0);
  const computedTotalNetProfit = filteredAgencies.reduce((sum, a) => sum + (a.totalSupervisorNetProfit || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Gestion des Commissions
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
      </Box>

      {/* Carte récapitulative simple */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EuroIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total à Recevoir
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {computedTotalSupervisor.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}€
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Montant dû par les agences
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Agences Payées
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {filteredAgencies.filter(a => a.isPaid).length} / {filteredAgencies.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {period?.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaymentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  En Attente
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {filteredAgencies.filter(a => !a.isPaid).reduce((sum, a) => sum + (a.totalSupervisorAmount || 0), 0).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}€
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {filteredAgencies.filter(a => !a.isPaid).length} agence(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste simple des paiements */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Paiements des Agences - {period?.label}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {filteredAgencies.length === 0 ? (
            <Alert severity="info">
              Aucune commission pour cette période
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Agence</strong></TableCell>
                    <TableCell align="right"><strong>Montant à Verser</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAgencies.map((agency) => (
                    <TableRow key={agency.agencyId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon color="primary" />
                          <Typography fontWeight="medium">{agency.agencyName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {(agency.totalSupervisorAmount || 0).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}€
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agency.paymentsProcessed} paiement(s)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {agency.isPaid ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Payé"
                            color="success"
                            size="medium"
                          />
                        ) : (
                          <Chip
                            label="Non payé"
                            color="warning"
                            size="medium"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            startIcon={<ReceiptIcon />}
                            onClick={() => handleOpenHistory(agency)}
                          >
                            Historique
                          </Button>
                          {agency.paymentStatus === 'DECLARED' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleConfirmPayment(agency.paymentId)}
                              disabled={isConfirming}
                            >
                              {isConfirming ? 'Confirmation...' : 'Confirmer paiement'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog Historique */}
      <Dialog
        open={historyDialogOpen}
        onClose={handleCloseHistory}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Historique des commissions - {selectedAgency?.agencyName}
            </Typography>
            <IconButton onClick={handleCloseHistory}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (() => {
            // Filtrer l'historique pour ne garder que les périodes avec montant non nul
            const filteredDialogHistory = historyData?.history?.filter(item =>
              item.totalCommission > 0 || item.totalSupervisorAmount > 0
            ) || [];

            return filteredDialogHistory.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Période</strong></TableCell>
                    <TableCell align="right"><strong>Paiements</strong></TableCell>
                    <TableCell align="right"><strong>Commission</strong></TableCell>
                    <TableCell align="center"><strong>Statut</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDialogHistory.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.period.label}</TableCell>
                      <TableCell align="right">{item.paymentsProcessed}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="primary.main">
                          {(item.totalCommission || 0).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}€
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.isPaid ? 'Payé' : 'Non payé'}
                          color={item.isPaid ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            ) : (
              <Alert severity="info">
                Aucun historique disponible pour cette agence
              </Alert>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionsManagement;
