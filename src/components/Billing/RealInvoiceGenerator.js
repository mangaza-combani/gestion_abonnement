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
  Paper,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import {
  useGetLinePaymentHistoryQuery,
  useCreateAdvancePaymentMutation,
  useGetClientOverviewQuery,
  useGetClientUnpaidInvoicesQuery,
  useProcessGroupPaymentMutation,
  usePaySpecificInvoiceMutation
} from '../../store/slices/linePaymentsSlice';

const RealInvoiceGenerator = ({ open, onClose, client }) => {
  const [selectedAction, setSelectedAction] = useState('overview'); // 'overview', 'invoices', 'pay-advance', 'history'
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  // États pour le modal de paiement détaillé
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // États pour paiement d'avance amélioré
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [monthlyRate] = useState(94.99); // Prix mensuel par ligne
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });
  
  const clientId = client?.id;
  // Debugging pour identifier le problème de client ID
  const debugClientId = clientId;
  
  console.log('🔍 CLIENT DATA:', {
    client,
    clientId,
    debugClientId,
    id: client?.id
  });
  
  console.log('🔧 DEBUG CLIENT ID:', {
    originalClientId: clientId,
    debugClientId: debugClientId,
    willSkipQuery: !debugClientId
  });
  
  // Vérifier l'authentification
  const token = localStorage.getItem('token');
  console.log('🔐 AUTH CHECK:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
  });

  // Test forcé avec clientId=13 pour debug
  useEffect(() => {
    if (debugClientId === 13) {
      console.log('🔴 FORÇAGE TEST API POUR CLIENT 13');
    }
  }, [debugClientId]);

  // Nouvelles queries client-centriques avec refetch
  const {
    data: clientOverview,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview
  } = useGetClientOverviewQuery(debugClientId, { skip: !debugClientId });

  const {
    data: unpaidInvoices,
    isLoading: isLoadingInvoices,
    refetch: refetchUnpaidInvoices
  } = useGetClientUnpaidInvoicesQuery(debugClientId, { skip: !debugClientId || selectedAction !== 'invoices' });

  console.log('📊 CLIENT OVERVIEW DATA:', {
    clientOverview,
    isLoadingOverview,
    overviewError,
    clientId,
    debugClientId,
    skipQuery: !debugClientId,
    // Détails spécifiques pour le debugging du nom
    clientOverviewClientName: clientOverview?.client?.name,
    originalClientFirstName: client?.firstName,
    originalClientLastName: client?.lastName,
    fallbackName: `${client?.firstName || ''} ${client?.lastName || ''}`.trim()
  });

  // Fonction utilitaire pour extraire les factures impayées
  const getUnpaidInvoicesListSafe = () => {
    // Priorité 1: données de l'endpoint spécifique unpaidInvoices
    if (Array.isArray(unpaidInvoices) && unpaidInvoices.length > 0) {
      return unpaidInvoices;
    }
    
    // Priorité 2: données depuis clientOverview.unpaidInvoices
    if (Array.isArray(clientOverview?.unpaidInvoices) && clientOverview.unpaidInvoices.length > 0) {
      return clientOverview.unpaidInvoices;
    }
    
    // Fallback: array vide
    return [];
  };

  const unpaidInvoicesList = getUnpaidInvoicesListSafe();

  console.log('🔍 UNPAID INVOICES DATA:', {
    unpaidInvoices,
    isLoadingInvoices,
    clientOverviewUnpaidInvoices: clientOverview?.unpaidInvoices,
    unpaidInvoicesList
  });

  const [processGroupPayment, {
    isLoading: isProcessingGroupPayment
  }] = useProcessGroupPaymentMutation();

  const [paySpecificInvoice, {
    isLoading: isPayingSpecificInvoice
  }] = usePaySpecificInvoiceMutation();

  const [createAdvancePayment, { 
    isLoading: isCreatingPayment 
  }] = useCreateAdvancePaymentMutation();

  // Legacy queries pour compatibilité historique - amélioration debug
  const phoneId = clientOverview?.lines?.[0]?.id; // Premier téléphone pour compatibilité
  
  console.log('📞 PHONE ID DEBUG:', {
    clientOverview,
    lines: clientOverview?.lines,
    firstLine: clientOverview?.lines?.[0],
    phoneId,
    selectedAction,
    shouldSkipHistory: !phoneId || selectedAction !== 'history'
  });
  const { 
    data: historyData, 
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useGetLinePaymentHistoryQuery(phoneId, { skip: !phoneId || selectedAction !== 'history' });

  // Handler pour paiement groupé
  const handleGroupPayment = async () => {
    if (!clientId) return;
    
    try {
      await processGroupPayment({
        clientId,
        paymentMethod: 'manual',
        notes: 'Paiement groupé via interface'
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: '✅ Paiement groupé effectué avec succès !',
        severity: 'success'
      });
      
      // Rafraîchir toutes les données après paiement groupé
      setTimeout(() => {
        refetchOverview();
        refetchUnpaidInvoices();
        refetchHistory();
      }, 500);
      
      setSelectedAction('overview');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Erreur lors du paiement groupé: ${error.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  // Handler pour ouvrir le modal de paiement détaillé
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amount?.toString() || '');
    setPaymentMethod('');
    setPaymentNotes('');
    setPaymentModalOpen(true);
  };

  // Handler pour fermer le modal de paiement
  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentMethod('');
    setPaymentNotes('');
  };

  // Handler pour traiter le paiement avec détails
  const handleProcessDetailedPayment = async () => {
    if (!selectedInvoice || !paymentMethod || !paymentAmount) {
      setSnackbar({
        open: true,
        message: '⚠️ Veuillez remplir tous les champs obligatoires',
        severity: 'warning'
      });
      return;
    }

    const paymentAmountFloat = parseFloat(paymentAmount);
    const invoiceAmount = selectedInvoice.amount || 0;

    if (paymentAmountFloat <= 0) {
      setSnackbar({
        open: true,
        message: '⚠️ Le montant doit être supérieur à 0',
        severity: 'warning'
      });
      return;
    }

    if (paymentAmountFloat > invoiceAmount) {
      setSnackbar({
        open: true,
        message: '⚠️ Le montant ne peut pas être supérieur au montant de la facture',
        severity: 'warning'
      });
      return;
    }

    try {
      // Déterminer le type de paiement
      const isPartialPayment = paymentAmountFloat < invoiceAmount;
      const remainingAmount = invoiceAmount - paymentAmountFloat;

      await paySpecificInvoice({
        invoiceId: selectedInvoice.id,
        clientId,
        paymentMethod: paymentMethod,
        paidAmount: paymentAmountFloat,
        isPartialPayment: isPartialPayment,
        remainingAmount: remainingAmount,
        notes: `Paiement ${paymentMethod.toLowerCase()} - ${paymentNotes}`.trim(),
        paymentDate: new Date().toISOString(),
        paymentTrace: {
          method: paymentMethod,
          amount: paymentAmountFloat,
          originalInvoiceAmount: invoiceAmount,
          isPartial: isPartialPayment,
          remainingDue: remainingAmount,
          timestamp: new Date().toISOString(),
          notes: paymentNotes
        }
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: `✅ Paiement ${isPartialPayment ? 'partiel' : 'complet'} effectué avec succès !`,
        severity: 'success'
      });
      handleClosePaymentModal();
      
      // Rafraîchir toutes les données après paiement spécifique
      setTimeout(() => {
        refetchOverview();
        refetchUnpaidInvoices();
        refetchHistory();
      }, 500);
      
      setSelectedAction('overview');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Erreur lors du paiement: ${error.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

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

  // Calculer le montant total pour les paiements d'avance
  const calculateAdvanceTotal = () => {
    return selectedLines.length * selectedPeriods.length * monthlyRate;
  };

  // Handler pour sélection de lignes
  const handleLineSelection = (lineId) => {
    setSelectedLines(prev => 
      prev.includes(lineId) 
        ? prev.filter(id => id !== lineId)
        : [...prev, lineId]
    );
  };

  // Handler pour sélection de périodes
  const handlePeriodSelection = (periodKey) => {
    setSelectedPeriods(prev => 
      prev.includes(periodKey)
        ? prev.filter(key => key !== periodKey)
        : [...prev, periodKey]
    );
  };

  // Handler pour tout sélectionner/désélectionner les lignes
  const handleSelectAllLines = (checked) => {
    if (checked) {
      const allLineIds = clientOverview?.lines?.map(line => line.id) || [];
      setSelectedLines(allLineIds);
    } else {
      setSelectedLines([]);
    }
  };

  // Handler pour tout sélectionner/désélectionner les périodes
  const handleSelectAllPeriods = (checked) => {
    if (checked) {
      const allPeriodKeys = generateFuturePeriods().map(period => period.key);
      setSelectedPeriods(allPeriodKeys);
    } else {
      setSelectedPeriods([]);
    }
  };

  const handleAdvancePayment = async () => {
    if (!phoneId || !selectedPeriod || !advanceAmount) {
      setSnackbar({
        open: true,
        message: '⚠️ Veuillez remplir tous les champs',
        severity: 'warning'
      });
      return;
    }

    try {
      await createAdvancePayment({
        phoneId: phoneId,
        amount: parseFloat(advanceAmount),
        paymentMonth: selectedPeriod,
        description: `Paiement d'avance via interface`
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: '✅ Paiement d\'avance créé avec succès !',
        severity: 'success'
      });
      
      // Rafraîchir les données après paiement d'avance
      setTimeout(() => {
        refetchOverview();
        refetchHistory();
      }, 500);
      
      setAdvanceAmount('');
      setSelectedPeriod('');
      setSelectedAction('overview');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Erreur lors de la création du paiement: ${error.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  if (!clientId) {
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
              Client non identifié. Impossible d'accéder aux données de facturation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isLoadingOverview) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chargement...</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Facturation - {clientOverview?.client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim()}
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
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant={selectedAction === 'overview' ? 'contained' : 'outlined'}
                  startIcon={<AccountBalanceIcon />}
                  onClick={() => {
                    console.log('🟦 OVERVIEW CLICKED - debugClientId:', debugClientId);
                    setSelectedAction('overview')
                  }}
                >
                  Vue d'ensemble
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    console.log('🔥 TEST DIRECT API CLIENT 13');
                    const token = localStorage.getItem('token');
                    console.log('🔐 TOKEN FOR API TEST:', {
                      hasToken: !!token,
                      tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token'
                    });
                    
                    const headers = {
                      'Content-Type': 'application/json'
                    };
                    
                    if (token) {
                      headers['authorization'] = `Bearer ${token}`;
                    }
                    
                    // Force un fetch direct de l'API pour tester avec auth
                    fetch('http://localhost:3333/api/line-payments/client/13/overview', {
                      method: 'GET',
                      headers
                    })
                      .then(res => {
                        console.log('📡 API RESPONSE STATUS:', res.status, res.statusText);
                        return res.json();
                      })
                      .then(data => console.log('📡 API DIRECT RESPONSE:', data))
                      .catch(err => console.error('❌ API ERROR:', err));
                  }}
                >
                  TEST API
                </Button>
                <Button
                  variant={selectedAction === 'invoices' ? 'contained' : 'outlined'}
                  startIcon={<ReceiptIcon />}
                  onClick={() => setSelectedAction('invoices')}
                >
                  Factures impayées
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
                  startIcon={<InfoIcon />}
                  onClick={() => setSelectedAction('history')}
                >
                  Historique
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Informations client globales */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👤 {clientOverview?.client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {clientOverview ? (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Lignes actives
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {clientOverview.summary?.totalLines || clientOverview.lines?.length || 0}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="textSecondary">
                      Solde client total
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color={
                        (clientOverview.client?.balance || 0) > 0 ? 'success.main' : 
                        (clientOverview.client?.balance || 0) < 0 ? 'error.main' : 'text.primary'
                      }
                      sx={{ mb: 1 }}
                    >
                      {(clientOverview.client?.balance || 0).toFixed(2)}€
                    </Typography>
                    
                    <Chip
                      label={`${clientOverview.summary?.unpaidInvoicesCount || 0} factures impayées`}
                      color={(clientOverview.summary?.unpaidInvoicesCount || 0) > 0 ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                ) : overviewError ? (
                  <Alert severity="error" size="small">
                    Erreur de chargement des données client
                  </Alert>
                ) : (
                  <Alert severity="info" size="small">
                    Données client indisponibles
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contenu principal selon l'action sélectionnée */}
          <Grid item xs={12} md={8}>
            {selectedAction === 'overview' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Vue d'ensemble du client
                  </Typography>
                  
                  {clientOverview ? (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Toutes les lignes du client
                      </Typography>
                      
                      {clientOverview.lines?.map((line) => (
                        <Paper key={line.id} sx={{ p: 2, mb: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle1">
                                📱 {line.phoneNumber}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {line.id}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Chip
                                label={line.phoneStatus || 'UNKNOWN'}
                                color={line.phoneStatus === 'ACTIVE' ? 'success' : 'default'}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2">
                                Statut paiement: <strong>{line.paymentStatus || 'N/A'}</strong>
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      )) || (
                        <Alert severity="info">
                          Aucune ligne téléphonique trouvée
                        </Alert>
                      )}
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom color="error.main">
                          💰 Total dû
                        </Typography>
                        
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {(clientOverview.summary?.totalUnpaid || 0) === 0 
                                  ? "Client à jour dans ses paiements" 
                                  : "Décomposition du total dû"}
                              </Typography>
                              <Typography variant="body2">
                                📅 {clientOverview.summary?.unpaidInvoicesCount || 0} facture(s) impayée(s)
                              </Typography>
                              <Typography variant="body2">
                                📱 {clientOverview.summary?.totalLines || 0} ligne(s) concernée(s)
                              </Typography>
                              {(clientOverview.summary?.totalUnpaid || 0) > 0 && (
                                <Typography variant="body2" sx={{ mt: 1, color: '#ffeb3b' }}>
                                  ⚡ Cliquez pour voir le détail dans l'onglet "Factures impayées"
                                </Typography>
                              )}
                              {(clientOverview.summary?.totalUnpaid || 0) === 0 && (
                                <Typography variant="body2" sx={{ mt: 1, color: '#4caf50' }}>
                                  ✅ Aucune facture en attente
                                </Typography>
                              )}
                            </Box>
                          }
                          placement="top"
                          arrow
                        >
                          <Typography 
                            variant="h3" 
                            color={(clientOverview.summary?.totalUnpaid || 0) === 0 ? "success.main" : "error.main"}
                            sx={{ 
                              mb: 2, 
                              fontWeight: 'bold',
                              cursor: 'help',
                              '&:hover': {
                                textShadow: (clientOverview.summary?.totalUnpaid || 0) === 0 
                                  ? '0 0 10px rgba(76, 175, 80, 0.5)'
                                  : '0 0 10px rgba(244, 67, 54, 0.5)',
                                transform: 'scale(1.02)',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                            onClick={() => (clientOverview.summary?.totalUnpaid || 0) > 0 && setSelectedAction('invoices')}
                          >
                            {(clientOverview.summary?.totalUnpaid || 0).toFixed(2)}€
                          </Typography>
                        </Tooltip>
                        
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                          {clientOverview.unpaidInvoices?.length > 0 ? (
                            clientOverview.unpaidInvoices.map((invoice, index) => {
                              // Formatter le mois en français
                              const monthYear = new Date(invoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                                month: 'long',
                                year: 'numeric'
                              });
                              
                              // Créer le tooltip avec détails
                              const tooltipContent = (
                                <div>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Facture {monthYear}
                                  </Typography>
                                  <Typography variant="body2">
                                    📱 Ligne: {invoice.phoneNumber}
                                  </Typography>
                                  <Typography variant="body2">
                                    💰 Montant: {invoice.amount?.toFixed(2)}€
                                  </Typography>
                                  <Typography variant="body2">
                                    📅 Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'orange', mt: 1 }}>
                                    ⚠️ {invoice.daysOverdue} jours de retard
                                  </Typography>
                                </div>
                              );
                              
                              return (
                                <Tooltip 
                                  key={invoice.id || index}
                                  title={tooltipContent} 
                                  placement="top"
                                  arrow
                                >
                                  <Chip
                                    icon={<CalendarIcon />}
                                    label={monthYear}
                                    color="error"
                                    variant="filled"
                                    sx={{
                                      fontWeight: 'bold',
                                      cursor: 'help',
                                      '& .MuiChip-icon': {
                                        color: 'white'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              );
                            })
                          ) : (
                            // Aucune facture impayée - Proposer paiement d'avance
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip
                                icon={<CalendarIcon />}
                                label="✅ Aucune facture impayée"
                                color="success"
                                variant="filled"
                                sx={{ mb: 2 }}
                              />
                              <br />
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<TrendingUpIcon />}
                                onClick={() => setSelectedAction('pay-advance')}
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                Faire un paiement d'avance
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Données client non disponibles
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
            
            {selectedAction === 'invoices' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Factures impayées du client
                  </Typography>
                  
                  {isLoadingInvoices ? (
                    <LinearProgress />
                  ) : unpaidInvoicesList.length > 0 ? (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Vous pouvez payer toutes les factures d'un coup ou individuellement
                      </Alert>
                      
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {unpaidInvoicesList.map((invoice) => {
                          // Formatter le mois en français pour un affichage plus clair
                          const monthYear = invoice.paymentMonth ? 
                            new Date(invoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric'
                            }) : 'Mois non défini';
                          
                          // Calculer les jours de retard
                          const daysOverdue = invoice.dueDate ? 
                            Math.max(0, Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))) : 0;
                          
                          return (
                            <Paper key={invoice.id} sx={{ p: 3, border: '1px solid #f0f0f0' }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={5}>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                      📄 Facture #{invoice.invoiceNumber || `INV-${invoice.id}`}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                      📅 Mois: {monthYear}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                    📱 Ligne: {invoice.phoneNumber}
                                  </Typography>
                                  {invoice.dueDate && (
                                    <Typography variant="body2" color="textSecondary">
                                      🔔 Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                                    </Typography>
                                  )}
                                  {daysOverdue > 0 && (
                                    <Chip
                                      label={`⚠️ ${daysOverdue} jours de retard`}
                                      color="error"
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  )}
                                </Grid>
                                
                                <Grid item xs={12} sm={3}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                      {invoice.amount?.toFixed(2)}€
                                    </Typography>
                                    <Chip
                                      label={invoice.status === 'OVERDUE' ? 'EN RETARD' : invoice.status}
                                      color={invoice.status === 'OVERDUE' ? 'error' : 'warning'}
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Button
                                      variant="contained"
                                      size="large"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handleOpenPaymentModal(invoice)}
                                      disabled={isPayingSpecificInvoice}
                                      fullWidth
                                      sx={{ 
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                      }}
                                    >
                                      Payer cette facture
                                    </Button>
                                    {invoice.notes && (
                                      <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        💬 {invoice.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          );
                        })}
                      </Stack>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          Total à payer: {unpaidInvoicesList.reduce((sum, inv) => sum + (inv.amount || 0), 0).toFixed(2)}€
                        </Typography>
                        
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PaymentIcon />}
                          onClick={handleGroupPayment}
                          disabled={isProcessingGroupPayment}
                          color="primary"
                        >
                          {isProcessingGroupPayment ? 'Paiement en cours...' : 'Tout payer d\'un coup'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="success">
                      🎉 Aucune facture impayée ! Le client est à jour dans ses paiements.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedAction === 'pay-advance' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Paiement d'avance multi-lignes
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Sélectionnez les lignes et les mois futurs pour lesquels vous souhaitez payer à l'avance. Le montant sera calculé automatiquement ({monthlyRate}€ par ligne par mois).
                  </Alert>
                  
                  <Stack spacing={3}>
                    {/* Sélection des lignes */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📱 Sélection des lignes
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedLines.length === (clientOverview?.lines?.length || 0) && selectedLines.length > 0}
                              indeterminate={selectedLines.length > 0 && selectedLines.length < (clientOverview?.lines?.length || 0)}
                              onChange={(e) => handleSelectAllLines(e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="bold">🔘 Toutes les lignes</Typography>}
                        />
                        <Box sx={{ ml: 3, mt: 1 }}>
                          {clientOverview?.lines?.map((line) => (
                            <FormControlLabel
                              key={line.id}
                              control={
                                <Checkbox
                                  checked={selectedLines.includes(line.id)}
                                  onChange={() => handleLineSelection(line.id)}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    📞 {line.phoneNumber}
                                  </Typography>
                                  <Chip 
                                    label={line.phoneStatus} 
                                    size="small" 
                                    color={line.phoneStatus === 'ACTIVE' ? 'success' : 'default'}
                                  />
                                </Box>
                              }
                            />
                          )) || (
                            <Alert severity="warning" size="small">
                              Aucune ligne disponible pour ce client
                            </Alert>
                          )}
                        </Box>
                      </FormGroup>
                    </Box>

                    {/* Sélection des périodes */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📅 Sélection des mois
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedPeriods.length === generateFuturePeriods().length && selectedPeriods.length > 0}
                              indeterminate={selectedPeriods.length > 0 && selectedPeriods.length < generateFuturePeriods().length}
                              onChange={(e) => handleSelectAllPeriods(e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="bold">🔘 Tous les mois</Typography>}
                        />
                        <Box sx={{ ml: 3, mt: 1 }}>
                          {generateFuturePeriods().map((period) => (
                            <FormControlLabel
                              key={period.key}
                              control={
                                <Checkbox
                                  checked={selectedPeriods.includes(period.key)}
                                  onChange={() => handlePeriodSelection(period.key)}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  📅 {period.label}
                                </Typography>
                              }
                            />
                          ))}
                        </Box>
                      </FormGroup>
                    </Box>

                    {/* Résumé du calcul */}
                    {(selectedLines.length > 0 && selectedPeriods.length > 0) && (
                      <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          📊 Résumé du paiement d'avance
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              📱 Lignes sélectionnées: <strong>{selectedLines.length}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              📅 Mois sélectionnés: <strong>{selectedPeriods.length}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              💰 Prix unitaire: <strong>{monthlyRate}€</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              🧮 Calcul: <strong>{selectedLines.length} × {selectedPeriods.length} × {monthlyRate}€</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1, bgcolor: 'primary.contrastText' }} />
                            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                              💸 Total: {calculateAdvanceTotal().toFixed(2)}€
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                    {/* Bouton de paiement */}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={() => {
                        // TODO: Implémenter la logique de paiement d'avance multiple
                        setSnackbar({
                          open: true,
                          message: `💰 Paiement d'avance: ${selectedLines.length} lignes × ${selectedPeriods.length} mois = ${calculateAdvanceTotal().toFixed(2)}€`,
                          severity: 'info'
                        });
                      }}
                      disabled={selectedLines.length === 0 || selectedPeriods.length === 0 || isCreatingPayment}
                      fullWidth
                      sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                      {isCreatingPayment ? 'Traitement en cours...' : `Payer ${calculateAdvanceTotal().toFixed(2)}€ d'avance`}
                    </Button>

                    {/* Aide */}
                    <Alert severity="success" sx={{ mt: 2 }}>
                      💡 <strong>Info:</strong> Ce paiement augmentera le solde du client de {calculateAdvanceTotal().toFixed(2)}€. 
                      Le système conservera une trace complète avec les détails des lignes et périodes sélectionnées.
                    </Alert>
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
                  
                  {/* Debug info pour comprendre la structure des données */}
                  {console.log('🔍 HISTORY DEBUG:', {
                    historyData,
                    isLoadingHistory,
                    phoneId,
                    historyKeys: historyData ? Object.keys(historyData) : 'no data',
                    historyPayments: historyData?.payments,
                    historyPaymentsLength: historyData?.payments?.length,
                    historyType: typeof historyData
                  })}
                  
                  {isLoadingHistory ? (
                    <LinearProgress />
                  ) : historyData ? (
                    <Box>
                      {/* Afficher toutes les données disponibles pour debug */}
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Données historique trouvées: {JSON.stringify(Object.keys(historyData || {}))}
                      </Alert>
                      
                      {/* Essayer plusieurs structures possibles */}
                      {Array.isArray(historyData) ? (
                        // Si historyData est directement un array
                        <List>
                          {historyData.map((payment, index) => (
                            <ListItem key={payment.id || index} divider>
                              <ListItemText
                                primary={
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1">
                                      {payment.paymentMonth || payment.month || `Paiement ${index + 1}`}
                                    </Typography>
                                    <Chip
                                      label={payment.status || 'UNKNOWN'}
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
                                      Montant: {payment.amount?.toFixed(2) || '0.00'}€
                                    </Typography>
                                    <Typography variant="caption">
                                      Facture: {payment.invoiceNumber || 'N/A'}
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
                        </List>
                      ) : historyData.payments && Array.isArray(historyData.payments) ? (
                        // Structure avec historyData.payments
                        <List>
                          {historyData.payments.map((payment) => (
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
                        </List>
                      ) : (
                        // Structure inconnue - afficher le contenu brut
                        <Box>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            Structure de données inattendue. Données brutes:
                          </Alert>
                          <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                              {JSON.stringify(historyData, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                      
                      {((Array.isArray(historyData) && historyData.length === 0) || 
                        (historyData.payments && Array.isArray(historyData.payments) && historyData.payments.length === 0)) && (
                        <Alert severity="info">
                          Aucun historique de paiement pour cette ligne
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="error">
                      Impossible de charger l'historique des paiements. PhoneId: {phoneId || 'non défini'}
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

      {/* Modal de paiement détaillé */}
      <Dialog open={paymentModalOpen} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              💳 Paiement de Facture
            </Typography>
            <IconButton onClick={handleClosePaymentModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedInvoice && (
            <Box>
              {/* Informations de la facture */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom color="primary.main">
                  📄 Facture #{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      📅 Mois:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedInvoice.paymentMonth ? 
                        new Date(selectedInvoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        }) : 'Non défini'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      📱 Ligne:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedInvoice.phoneNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      💰 Montant total:
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {selectedInvoice.amount?.toFixed(2)}€
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      🏷️ Statut:
                    </Typography>
                    <Chip 
                      label={selectedInvoice.status === 'OVERDUE' ? 'EN RETARD' : selectedInvoice.status} 
                      color={selectedInvoice.status === 'OVERDUE' ? 'error' : 'warning'} 
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Formulaire de paiement */}
              <Stack spacing={3}>
                <FormControl fullWidth required>
                  <InputLabel>💳 Moyen de paiement</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="💳 Moyen de paiement"
                  >
                    <MenuItem value="ESPECE">💵 Espèces</MenuItem>
                    <MenuItem value="CARTE_BANCAIRE">💳 Carte bancaire</MenuItem>
                    <MenuItem value="CHEQUE">📄 Chèque</MenuItem>
                    <MenuItem value="VIREMENT">🏦 Virement bancaire</MenuItem>
                    <MenuItem value="MOBILE_MONEY">📱 Mobile Money</MenuItem>
                    <MenuItem value="SOLDE_CLIENT">💰 Solde client</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="💰 Montant à payer (€)"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01, max: selectedInvoice.amount }}
                  helperText={`Montant maximum: ${selectedInvoice.amount?.toFixed(2)}€`}
                />

                <TextField
                  label="📝 Notes et commentaires"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Informations supplémentaires sur le paiement (optionnel)..."
                />

                {/* Résumé du paiement */}
                {paymentAmount && parseFloat(paymentAmount) > 0 && (
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      📊 Résumé du paiement
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          💰 Montant payé: <strong>{parseFloat(paymentAmount).toFixed(2)}€</strong>
                        </Typography>
                      </Grid>
                      {parseFloat(paymentAmount) < selectedInvoice.amount && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="warning.main">
                            ⚠️ Paiement partiel - Reste dû: <strong>{(selectedInvoice.amount - parseFloat(paymentAmount)).toFixed(2)}€</strong>
                          </Typography>
                        </Grid>
                      )}
                      {parseFloat(paymentAmount) === selectedInvoice.amount && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="success.main">
                            ✅ Paiement complet - Facture entièrement payée
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClosePaymentModal} color="secondary">
            Annuler
          </Button>
          <Button 
            onClick={handleProcessDetailedPayment}
            variant="contained" 
            disabled={!paymentMethod || !paymentAmount || parseFloat(paymentAmount) <= 0 || isPayingSpecificInvoice}
            startIcon={<PaymentIcon />}
          >
            {isPayingSpecificInvoice ? 'Traitement...' : 'Confirmer le paiement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default RealInvoiceGenerator;