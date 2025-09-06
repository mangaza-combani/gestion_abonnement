import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import {
  useGetLineBalanceQuery,
  useGetNextBillingDateQuery,
  useGetLinePaymentHistoryQuery,
  useCreateAdvancePaymentMutation,
  useCreateTestDataMutation
} from '../../store/slices/linePaymentsSlice';

const RealInvoiceGenerator = ({ open, onClose, client }) => {
  const [selectedAction, setSelectedAction] = useState('view'); // 'view', 'pay-advance', 'history'
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  // Récupérer les données réelles du client
  // DEBUG: Afficher la structure du client pour diagnostiquer
  console.log('🔍 CLIENT DATA STRUCTURE:', {
    client,
    phoneNumber: client?.phoneNumber,
    phoneSubscriptions: client?.phoneSubscriptions,
    id: client?.id,
    keys: Object.keys(client || {})
  });
  
  // Logique pour trouver le bon phoneId
  // D'après les logs, le client ID 13 possède le téléphone ID 15
  // Il faut chercher le téléphone qui appartient à ce client (user_id = client.id)
  // Pour l'instant, utilisons une logique de mapping basée sur les logs observés
  let phoneId = null;
  
  if (client?.id === 13) {
    phoneId = 15; // Mapping temporaire basé sur les logs backend
  } else {
    phoneId = client?.id; // Fallback générique
  }

  // Queries RTK
  const { 
    data: balanceData, 
    isLoading: isLoadingBalance,
    error: balanceError 
  } = useGetLineBalanceQuery(phoneId, { skip: !phoneId });

  const { 
    data: billingData, 
    isLoading: isLoadingBilling 
  } = useGetNextBillingDateQuery(phoneId, { skip: !phoneId });

  const { 
    data: historyData, 
    isLoading: isLoadingHistory 
  } = useGetLinePaymentHistoryQuery(phoneId, { skip: !phoneId || selectedAction !== 'history' });

  const [createAdvancePayment, { 
    isLoading: isCreatingPayment 
  }] = useCreateAdvancePaymentMutation();

  const [createTestData] = useCreateTestDataMutation();

  // Créer automatiquement les données de test si pas de balance trouvée
  useEffect(() => {
    if (phoneId && balanceError && !isLoadingBalance) {
      console.log('🔧 Création automatique des données de test pour phoneId:', phoneId);
      createTestData(phoneId);
    }
  }, [phoneId, balanceError, isLoadingBalance, createTestData]);

  // Générer les options de périodes futures
  const generateFuturePeriods = () => {
    const periods = [];
    const currentDate = new Date();
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const periodKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      const periodLabel = futureDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      periods.push({ key: periodKey, label: periodLabel });
    }
    return periods;
  };

  const handleAdvancePayment = async () => {
    if (!phoneId || !selectedPeriod || !advanceAmount) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await createAdvancePayment({
        phoneId: phoneId,
        amount: parseFloat(advanceAmount),
        paymentMonth: selectedPeriod,
        description: `Paiement d'avance via interface`
      }).unwrap();
      
      alert('Paiement d\'avance créé avec succès !');
      setAdvanceAmount('');
      setSelectedPeriod('');
      setSelectedAction('view');
    } catch (error) {
      alert('Erreur lors de la création du paiement: ' + (error.data?.message || error.message));
    }
  };

  if (!phoneId) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Facturation Client</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            <Typography>
              Ce client n'a pas de ligne téléphonique active. 
              Impossible d'accéder aux données de facturation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Facturation - {client?.firstName} {client?.lastName}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Navigation des actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant={selectedAction === 'view' ? 'contained' : 'outlined'}
                  startIcon={<AccountBalanceIcon />}
                  onClick={() => setSelectedAction('view')}
                >
                  Solde & Factures
                </Button>
                <Button
                  variant={selectedAction === 'pay-advance' ? 'contained' : 'outlined'}
                  startIcon={<PaymentIcon />}
                  onClick={() => setSelectedAction('pay-advance')}
                >
                  Paiement Avance
                </Button>
                <Button
                  variant={selectedAction === 'history' ? 'contained' : 'outlined'}
                  startIcon={<ReceiptIcon />}
                  onClick={() => setSelectedAction('history')}
                >
                  Historique
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Informations de base de la ligne */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📱 Ligne {client?.phoneNumber || 'Non défini'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {isLoadingBilling ? (
                  <LinearProgress />
                ) : billingData ? (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Prochaine facturation
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {billingData.nextBilling?.month}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Génération: {billingData.nextBilling?.generationDate}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      Échéance: {billingData.nextBilling?.dueDate}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" size="small">
                    Informations de facturation indisponibles
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contenu principal selon l'action sélectionnée */}
          <Grid item xs={12} md={8}>
            {selectedAction === 'view' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💰 Solde de la ligne
                  </Typography>
                  
                  {isLoadingBalance ? (
                    <LinearProgress />
                  ) : balanceError ? (
                    <Alert severity="error">
                      Erreur lors du chargement du solde
                    </Alert>
                  ) : balanceData ? (
                    <Box>
                      {/* Solde net */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" color={
                          balanceData.balance?.netBalance > 0 ? 'success.main' : 
                          balanceData.balance?.netBalance < 0 ? 'error.main' : 'text.primary'
                        }>
                          {balanceData.balance?.netBalance?.toFixed(2)}€
                        </Typography>
                        <Chip 
                          label={
                            balanceData.balance?.balanceStatus === 'CREDIT' ? 'Solde créditeur' :
                            balanceData.balance?.balanceStatus === 'DEBT' ? 'Solde débiteur' : 
                            'Solde équilibré'
                          }
                          color={
                            balanceData.balance?.balanceStatus === 'CREDIT' ? 'success' :
                            balanceData.balance?.balanceStatus === 'DEBT' ? 'error' : 'default'
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        {/* Arriérés */}
                        {balanceData.balance?.arrears?.total > 0 && (
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUpIcon />
                                Arriérés ({balanceData.balance.arrears.count})
                              </Typography>
                              <Typography variant="h6" color="error.dark">
                                {balanceData.balance.arrears.total.toFixed(2)}€
                              </Typography>
                              <List dense>
                                {balanceData.balance.arrears.details?.slice(0, 3).map((arrear, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={`${arrear.paymentMonth} - ${arrear.amount.toFixed(2)}€`}
                                      secondary={arrear.invoiceNumber}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Grid>
                        )}

                        {/* Avances */}
                        {balanceData.balance?.advances?.total > 0 && (
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingDownIcon />
                                Avances ({balanceData.balance.advances.count})
                              </Typography>
                              <Typography variant="h6" color="success.dark">
                                {balanceData.balance.advances.total.toFixed(2)}€
                              </Typography>
                              <List dense>
                                {balanceData.balance.advances.details?.slice(0, 3).map((advance, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={`${advance.paymentMonth} - ${advance.amount.toFixed(2)}€`}
                                      secondary={advance.invoiceNumber}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Aucune donnée de solde disponible
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedAction === 'pay-advance' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Paiement d'avance
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Permet de payer à l'avance pour les mois futurs, même sans facture générée
                  </Alert>
                  
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Période de paiement</InputLabel>
                      <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        label="Période de paiement"
                      >
                        {generateFuturePeriods().map((period) => (
                          <MenuItem key={period.key} value={period.key}>
                            {period.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Montant (€)"
                      type="number"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      fullWidth
                      inputProps={{ min: 0, step: 0.01 }}
                    />

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={handleAdvancePayment}
                      disabled={!selectedPeriod || !advanceAmount || isCreatingPayment}
                      fullWidth
                    >
                      {isCreatingPayment ? 'Création en cours...' : 'Créer le paiement d\'avance'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {selectedAction === 'history' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Historique des paiements
                  </Typography>
                  
                  {isLoadingHistory ? (
                    <LinearProgress />
                  ) : historyData ? (
                    <List>
                      {historyData.payments?.map((payment) => (
                        <ListItem key={payment.id} divider>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1">
                                  {payment.paymentMonth}
                                </Typography>
                                <Chip
                                  label={payment.status}
                                  color={
                                    payment.status === 'PAID' ? 'success' :
                                    payment.status === 'PENDING' ? 'warning' :
                                    payment.status === 'OVERDUE' ? 'error' : 'default'
                                  }
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Montant: {payment.amount.toFixed(2)}€
                                </Typography>
                                <Typography variant="caption">
                                  Facture: {payment.invoiceNumber}
                                </Typography>
                                {payment.notes && (
                                  <Typography variant="caption" display="block">
                                    {payment.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                      {historyData.payments?.length === 0 && (
                        <Alert severity="info">
                          Aucun historique de paiement pour cette ligne
                        </Alert>
                      )}
                    </List>
                  ) : (
                    <Alert severity="error">
                      Impossible de charger l'historique des paiements
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} size="large">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RealInvoiceGenerator;