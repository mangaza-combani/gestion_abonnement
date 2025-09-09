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
  usePaySpecificInvoiceMutation,
  useAddClientBalanceMutation
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

  // États pour la sélection du moyen de paiement
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentSplit, setPaymentSplit] = useState({
    balance: 0,
    cash: 0, 
    card: 0
  });
  const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
  
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

  // Vrais hooks RTK Query
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
  
  const [addClientBalance, { 
    isLoading: isAddingBalance 
  }] = useAddClientBalanceMutation();

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
        // Seulement refetch history si on est sur la page history et si phoneId existe
        if (selectedAction === 'history' && phoneId) {
          refetchHistory();
        }
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
        // Seulement refetch history si on est sur la page history et si phoneId existe
        if (selectedAction === 'history' && phoneId) {
          refetchHistory();
        }
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

  // 🧠 LOGIQUE INTELLIGENTE : Calculer les mois disponibles selon le solde
  const generateFuturePeriods = () => {
    const periods = [];
    const currentDate = new Date();
    const clientBalance = clientOverview?.client?.balance || 0;
    const numberOfLines = selectedLines.length || (clientOverview?.lines?.length || 1);
    const costPerMonth = monthlyRate * numberOfLines; // Coût total par mois pour toutes les lignes
    
    // Calculer combien de mois sont déjà couverts par le solde actuel
    const monthsCoveredByBalance = Math.floor(clientBalance / costPerMonth);
    
    console.log('💡 CALCUL couverture solde:', {
      clientBalance,
      numberOfLines,
      costPerMonth,
      monthsCoveredByBalance
    });
    
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const periodKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      const periodLabel = futureDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      // Déterminer le statut du mois
      const isCoveredByBalance = i <= monthsCoveredByBalance;
      const status = isCoveredByBalance ? 'couvert' : 'disponible';
      const displayLabel = isCoveredByBalance 
        ? `${periodLabel} ✅ (déjà couvert)`
        : `${periodLabel}`;
      
      periods.push({ 
        key: periodKey, 
        label: periodLabel,
        displayLabel: displayLabel,
        isCovered: isCoveredByBalance,
        status: status
      });
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

  // Handler pour tout sélectionner/désélectionner les périodes (seulement non couverts)
  const handleSelectAllPeriods = (checked) => {
    if (checked) {
      // Sélectionner seulement les périodes non couvertes par le solde
      const availablePeriodKeys = generateFuturePeriods()
        .filter(period => !period.isCovered)
        .map(period => period.key);
      setSelectedPeriods(availablePeriodKeys);
    } else {
      setSelectedPeriods([]);
    }
  };

  const handleAdvancePayment = async () => {
    console.log('🚀 DEBUT handleAdvancePayment - État des champs:', {
      phoneId,
      selectedPeriod, 
      advanceAmount,
      clientId,
      clientBalance: clientOverview?.client?.balance
    });

    if (!phoneId || !selectedPeriod || !advanceAmount) {
      console.log('❌ VALIDATION ECHOUEE - Champs manquants:', {
        phoneId: !!phoneId,
        selectedPeriod: !!selectedPeriod,
        advanceAmount: !!advanceAmount
      });
      setSnackbar({
        open: true,
        message: '⚠️ Veuillez remplir tous les champs',
        severity: 'warning'
      });
      return;
    }

    // 🎯 NOUVELLE APPROCHE: Ouvrir le modal de sélection de paiement
    const amount = parseFloat(advanceAmount);
    const clientBalance = clientOverview?.client?.balance || 0;
    
    setTotalPaymentAmount(amount);
    setPaymentSplit({
      balance: Math.min(amount, clientBalance), // Utiliser le solde disponible
      cash: Math.max(0, amount - clientBalance), // Le reste en espèces
      card: 0
    });
    
    console.log('💳 OUVERTURE modal sélection paiement:', {
      amount,
      clientBalance,
      suggestedSplit: {
        balance: Math.min(amount, clientBalance),
        cash: Math.max(0, amount - clientBalance)
      }
    });
    
    setPaymentMethodModal(true);
  };

  // Nouvelle fonction pour traiter le paiement d'avance - AJOUT DE SOLDE UNIQUEMENT
  const processAdvancePayment = async () => {
    const total = paymentSplit.balance + paymentSplit.cash + paymentSplit.card;
    
    if (Math.abs(total - totalPaymentAmount) > 0.01) {
      setSnackbar({
        open: true,
        message: `⚠️ Le total des paiements (${total.toFixed(2)}€) doit égaler le montant (${totalPaymentAmount.toFixed(2)}€)`,
        severity: 'warning'
      });
      return;
    }

    console.log('💳 TRAITEMENT paiement d\'avance - ajout solde client:', {
      paymentSplit,
      selectedLines,
      selectedPeriods,
      totalAmount: totalPaymentAmount,
      clientId: clientId
    });

    try {
      // 🎯 LOGIQUE SIMPLIFIEE : Juste ajouter le montant au solde du client
      // Le système débitera automatiquement le 20 de chaque mois
      
      // Déterminer la méthode de paiement pour la description
      const activeMethods = [];
      if (paymentSplit.balance > 0) activeMethods.push(`${paymentSplit.balance}€ solde`);
      if (paymentSplit.cash > 0) activeMethods.push(`${paymentSplit.cash}€ espèces`);
      if (paymentSplit.card > 0) activeMethods.push(`${paymentSplit.card}€ carte`);
      
      let reason = `Paiement d'avance de ${totalPaymentAmount}€`;
      if (activeMethods.length > 0) {
        reason += ` (${activeMethods.join(' + ')})`;
      }
      reason += ` pour ${selectedLines.length} ligne(s) × ${selectedPeriods.length} mois`;

      // ⚠️ PROBLÈME POTENTIEL : Si le paiement utilise le solde existant, on ne peut pas l'ajouter au solde !
      // Seuls les paiements en espèces/carte augmentent le solde
      const amountToAddToBalance = paymentSplit.cash + paymentSplit.card;
      
      if (amountToAddToBalance > 0) {
        // Ajouter seulement la partie espèces + carte au solde
        const balanceData = {
          clientId: clientId,
          amount: amountToAddToBalance,
          reason: reason
        };

        console.log('📤 ENVOI addClientBalance:', balanceData);

        const result = await addClientBalance(balanceData).unwrap();
        
        console.log('✅ SUCCES addClientBalance:', result);
        
        setSnackbar({
          open: true,
          message: `✅ Paiement d'avance de ${totalPaymentAmount}€ ajouté au solde ! Nouveau solde: ${result.newBalance}€`,
          severity: 'success'
        });
      } else if (paymentSplit.balance > 0) {
        // Si c'est uniquement un paiement par solde existant, on informe juste
        setSnackbar({
          open: true,
          message: `💡 Le paiement de ${totalPaymentAmount}€ utilise uniquement le solde existant. Le système débitera automatiquement le 20 de chaque mois.`,
          severity: 'info'
        });
      }
      
      // Fermer le modal de paiement
      setPaymentMethodModal(false);
      
      // Rafraîchir les données après paiement d'avance
      console.log('🔄 RAFRAICHISSEMENT des données...');
      setTimeout(() => {
        refetchOverview();
        // Seulement refetch history si on est sur la page history et si phoneId existe
        if (selectedAction === 'history' && phoneId) {
          refetchHistory();
        }
        console.log('🔄 Refetch déclenché');
      }, 500);
      
      // 🎯 REDIRECTION vers la vue d'ensemble après 2 secondes
      setTimeout(() => {
        console.log('🎯 REDIRECTION vers vue d\'ensemble');
        setSelectedAction('overview');
      }, 2000);
      
      // Réinitialiser les champs
      setSelectedLines([]);
      setSelectedPeriods([]);
      setAdvanceAmount('');
      
    } catch (error) {
      console.error('❌ ERREUR ajout solde:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        data: error.data,
        status: error.status
      });
      
      setSnackbar({
        open: true,
        message: `❌ Erreur paiement: ${error.data?.message || error.message}`,
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

                    {/* Information sur la couverture du solde */}
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          bgcolor: 'primary.50',
                          border: '1px solid',
                          borderColor: 'primary.200'
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>💰 Analyse du solde actuel:</strong>
                        </Typography>
                        <Typography variant="body2">
                          • Solde disponible: <strong>{(clientOverview?.client?.balance || 0).toFixed(2)}€</strong><br/>
                          • Coût mensuel ({selectedLines.length || 1} ligne(s)): <strong>{(monthlyRate * (selectedLines.length || 1)).toFixed(2)}€</strong><br/>
                          • Mois déjà couverts: <strong>{Math.floor((clientOverview?.client?.balance || 0) / (monthlyRate * (selectedLines.length || 1)))}</strong>
                        </Typography>
                      </Alert>
                    </Box>

                    {/* Sélection des périodes */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        📅 Sélection des mois supplémentaires
                      </Typography>
                      <FormGroup>
                        {(() => {
                          const availablePeriods = generateFuturePeriods().filter(p => !p.isCovered);
                          const allAvailableSelected = selectedPeriods.length === availablePeriods.length && selectedPeriods.length > 0;
                          const someAvailableSelected = selectedPeriods.length > 0 && selectedPeriods.length < availablePeriods.length;
                          
                          return (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={allAvailableSelected}
                                  indeterminate={someAvailableSelected}
                                  onChange={(e) => handleSelectAllPeriods(e.target.checked)}
                                />
                              }
                              label={<Typography variant="body2" fontWeight="bold">🔘 Tous les mois disponibles</Typography>}
                            />
                          );
                        })()}
                        <Box sx={{ ml: 3, mt: 1 }}>
                          {generateFuturePeriods().map((period) => (
                            <FormControlLabel
                              key={period.key}
                              control={
                                <Checkbox
                                  checked={selectedPeriods.includes(period.key)}
                                  onChange={() => handlePeriodSelection(period.key)}
                                  disabled={period.isCovered}
                                />
                              }
                              label={
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: period.isCovered ? 'text.secondary' : 'text.primary',
                                    opacity: period.isCovered ? 0.6 : 1
                                  }}
                                >
                                  📅 {period.displayLabel}
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
                        const amount = calculateAdvanceTotal();
                        const clientBalance = clientOverview?.client?.balance || 0;
                        
                        setAdvanceAmount(amount);
                        setTotalPaymentAmount(amount);
                        
                        // Suggérer automatiquement la répartition optimale
                        setPaymentSplit({
                          balance: Math.min(amount, clientBalance),
                          cash: Math.max(0, amount - clientBalance),
                          card: 0
                        });
                        
                        setPaymentMethodModal(true);
                      }}
                      disabled={selectedLines.length === 0 || selectedPeriods.length === 0 || isAddingBalance}
                      fullWidth
                      sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                      {isAddingBalance ? 'Traitement en cours...' : `Payer ${calculateAdvanceTotal().toFixed(2)}€ d'avance`}
                    </Button>

                    {/* Aide */}
                    <Alert severity="success" sx={{ mt: 2 }}>
                      💡 <strong>Logique intelligente:</strong><br/>
                      • Les mois déjà couverts par le solde actuel sont automatiquement bloqués ✅<br/>
                      • Vous ne payez que pour les mois supplémentaires non couverts<br/>
                      • Le système débitera automatiquement {monthlyRate * (selectedLines.length || 1)}€ le 20 de chaque mois<br/>
                      • Ce paiement ajoutera {calculateAdvanceTotal().toFixed(2)}€ au solde client
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

      {/* Modal de sélection du moyen de paiement */}
      <Dialog 
        open={paymentMethodModal} 
        onClose={() => setPaymentMethodModal(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">💳 Sélection du moyen de paiement</Typography>
            <IconButton onClick={() => setPaymentMethodModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            {/* Résumé du paiement */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Typography variant="h6" gutterBottom>
                📊 Résumé du paiement d'avance
              </Typography>
              <Typography variant="body1">
                <strong>Montant total:</strong> {totalPaymentAmount.toFixed(2)}€
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLines.length > 0 && selectedPeriods.length > 0 
                  ? `${selectedLines.length} lignes × ${selectedPeriods.length} mois` 
                  : selectedPeriod ? `Période: ${selectedPeriod}` : 'Paiement d\'avance'
                } • Client: {client?.firstname} {client?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solde client disponible: {clientOverview?.client?.balance?.toFixed(2) || '0.00'}€
              </Typography>
            </Paper>

            {/* Répartition du paiement */}
            <Box>
              <Typography variant="h6" gutterBottom>
                💰 Répartition du paiement
              </Typography>
              
              {/* Boutons de suggestion rapide */}
              <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const available = clientOverview?.client?.balance || 0;
                    setPaymentSplit({
                      balance: Math.min(totalPaymentAmount, available),
                      cash: Math.max(0, totalPaymentAmount - available),
                      card: 0
                    });
                  }}
                >
                  Solde + Espèces
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPaymentSplit({
                    balance: 0,
                    cash: totalPaymentAmount,
                    card: 0
                  })}
                >
                  Tout en espèces
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPaymentSplit({
                    balance: 0,
                    cash: 0,
                    card: totalPaymentAmount
                  })}
                >
                  Tout par carte
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPaymentSplit({
                    balance: Math.min(totalPaymentAmount, clientOverview?.client?.balance || 0),
                    cash: 0,
                    card: 0
                  })}
                  disabled={!clientOverview?.client?.balance || clientOverview.client.balance < totalPaymentAmount}
                >
                  Tout par solde
                </Button>
              </Stack>
              
              {/* Paiement par solde */}
              <Box mb={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalanceIcon color="primary" />
                  <Typography variant="body1" sx={{ minWidth: 100 }}>Solde client:</Typography>
                  <TextField
                    type="number"
                    value={paymentSplit.balance}
                    onChange={(e) => setPaymentSplit(prev => ({
                      ...prev,
                      balance: Math.max(0, Math.min(parseFloat(e.target.value) || 0, clientOverview?.client?.balance || 0))
                    }))}
                    InputProps={{
                      endAdornment: '€',
                      inputProps: { 
                        min: 0, 
                        max: clientOverview?.client?.balance || 0,
                        step: 0.01 
                      }
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    (Max: {clientOverview?.client?.balance?.toFixed(2) || '0.00'}€)
                  </Typography>
                </Stack>
              </Box>

              {/* Paiement en espèces */}
              <Box mb={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PaymentIcon color="success" />
                  <Typography variant="body1" sx={{ minWidth: 100 }}>Espèces:</Typography>
                  <TextField
                    type="number"
                    value={paymentSplit.cash}
                    onChange={(e) => setPaymentSplit(prev => ({
                      ...prev,
                      cash: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                    InputProps={{
                      endAdornment: '€',
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Stack>
              </Box>

              {/* Paiement par carte */}
              <Box mb={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ReceiptIcon color="info" />
                  <Typography variant="body1" sx={{ minWidth: 100 }}>Carte bancaire:</Typography>
                  <TextField
                    type="number"
                    value={paymentSplit.card}
                    onChange={(e) => setPaymentSplit(prev => ({
                      ...prev,
                      card: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                    InputProps={{
                      endAdornment: '€',
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Stack>
              </Box>

              {/* Total et validation */}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Total saisi:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={
                      Math.abs((paymentSplit.balance + paymentSplit.cash + paymentSplit.card) - totalPaymentAmount) < 0.01 
                        ? 'success.main' 
                        : 'error.main'
                    }
                  >
                    {(paymentSplit.balance + paymentSplit.cash + paymentSplit.card).toFixed(2)}€
                  </Typography>
                </Stack>
                
                {Math.abs((paymentSplit.balance + paymentSplit.cash + paymentSplit.card) - totalPaymentAmount) >= 0.01 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Le total saisi doit égaler le montant à payer ({totalPaymentAmount.toFixed(2)}€)
                  </Alert>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setPaymentMethodModal(false)} 
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            onClick={processAdvancePayment}
            variant="contained"
            disabled={Math.abs((paymentSplit.balance + paymentSplit.cash + paymentSplit.card) - totalPaymentAmount) >= 0.01}
            startIcon={<PaymentIcon />}
          >
            Confirmer le paiement
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default RealInvoiceGenerator;