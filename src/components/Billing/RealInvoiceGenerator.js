import React, { useState, useEffect, useRef } from 'react';
import API_CONFIG from '../../config/api.js';
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
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

import {
  useGetLinePaymentHistoryQuery,
  useCreateAdvancePaymentMutation,
  useGetClientOverviewQuery,
  useGetClientUnpaidInvoicesQuery,
  useGetLineAllInvoicesQuery, // 🆕 NOUVEAU : Pour toutes les factures d'une ligne
  useProcessGroupPaymentMutation,
  usePaySpecificInvoiceMutation,
  useAddLineBalanceMutation // NOUVEAU système par ligne
} from '../../store/slices/linePaymentsSlice';
import { useGetPhonePaymentHistoryQuery, useGetPhoneByIdQuery } from '../../store/slices/linesSlice';

const RealInvoiceGenerator = ({ open, onClose, client, selectedLine }) => {
  // Protection contre les refetch après démontage
  const isMountedRef = useRef(true);
  
  // Nettoyer à la fermeture du modal
  useEffect(() => {
    if (!open) {
      isMountedRef.current = false;
    } else {
      isMountedRef.current = true;
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [open]);
  
  const [selectedAction, setSelectedAction] = useState('overview'); // 'overview', 'invoices', 'pay-advance', 'history'
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  // 🆕 NOUVEAU : État pour les filtres des factures
  const [invoiceFilter, setInvoiceFilter] = useState('all'); // 'all', 'paid', 'unpaid', 'overdue'
  
  // États pour le modal de paiement détaillé
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // États pour paiement d'avance amélioré
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  
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
  
  // États pour sélection multiple des autres lignes
  const [selectedOtherLines, setSelectedOtherLines] = useState([]);
  
  // 🎯 NOUVELLE LOGIQUE : Ligne sélectionnée + Client
  const selectedLineId = selectedLine?.id; // ID de la ligne sélectionnée
  const clientId = client?.id; // ID du vrai client
  
  console.log('🎯 NOUVELLE STRUCTURE DONNÉES:', {
    selectedLine,
    selectedLineId,
    client,
    clientId,
    selectedLinePhone: selectedLine?.phoneNumber
  });
  
  console.log('🔧 DEBUG CLIENT ID:', {
    originalClientId: clientId,
    selectedLineId: selectedLineId,
    willSkipQuery: !clientId
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
    if (clientId === 13) {
      console.log('🔴 FORÇAGE TEST API POUR CLIENT 13');
    }
  }, [clientId]);

  // Vrais hooks RTK Query
  const {
    data: clientOverview,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview
  } = useGetClientOverviewQuery(clientId, { skip: !clientId });

  // 🎯 NOUVEAU : Fonction pour obtenir le prix mensuel d'une ligne (définie après clientOverview)
  const getLineMonthlyPrice = (lineId) => {
    if (!clientOverview?.lines) return 94.99; // Fallback
    
    const line = clientOverview.lines.find(l => l.id === lineId);
    return line?.subscription?.price || 94.99; // Fallback si pas de subscription
  };

  // Prix mensuel pour la ligne sélectionnée
  const monthlyRate = getLineMonthlyPrice(selectedLineId);

  const {
    data: unpaidInvoices,
    isLoading: isLoadingInvoices,
    refetch: refetchUnpaidInvoices
  } = useGetClientUnpaidInvoicesQuery(clientId, { skip: !clientId || selectedAction !== 'invoices' });

  // 🆕 NOUVEAU : Hook pour récupérer TOUTES les factures de la ligne sélectionnée
  const {
    data: allInvoicesData,
    isLoading: isLoadingAllInvoices,
    error: allInvoicesError,
    refetch: refetchAllInvoices
  } = useGetLineAllInvoicesQuery(selectedLineId, { 
    skip: !selectedLineId || selectedAction !== 'all-invoices',
    refetchOnMountOrArgChange: true
  });

  console.log('📊 CLIENT OVERVIEW DATA:', {
    clientOverview,
    isLoadingOverview,
    overviewError,
    clientId,
    selectedLineId,
    skipQuery: !clientId,
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

  // 🎯 NOUVEAU : Fonction pour vérifier le vrai statut de paiement basé sur les factures réelles
  const getRealPaymentStatus = () => {
    // Si on a des données de factures impayées, c'est la source de vérité
    if (unpaidInvoicesList.length > 0) {
      return 'IMPAYÉ';
    }
    
    // Si on a chargé les données et qu'il n'y a pas de factures impayées
    if (!isLoadingInvoices && unpaidInvoicesList.length === 0) {
      return 'À JOUR';
    }
    
    // Fallback sur le statut de la ligne
    return selectedLine?.payment_status || selectedLine?.paymentStatus || 'INCONNU';
  };

  const realPaymentStatus = getRealPaymentStatus();

  // 🆕 NOUVEAU : Fonction pour filtrer les factures selon le filtre sélectionné
  const getFilteredInvoices = () => {
    if (!allInvoicesData?.invoices) return [];
    
    const invoices = allInvoicesData.invoices;
    
    switch (invoiceFilter) {
      case 'paid':
        return invoices.filter(invoice => invoice.isPaid);
      case 'unpaid':
        return invoices.filter(invoice => !invoice.isPaid);
      case 'overdue':
        return invoices.filter(invoice => invoice.isOverdue);
      case 'all':
      default:
        return invoices;
    }
  };

  const filteredInvoices = getFilteredInvoices();

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
  
  // NOUVEAU : Hook pour solde par ligne
  const [addLineBalance, { 
    isLoading: isAddingBalance 
  }] = useAddLineBalanceMutation();

  // NOUVEAU : Utiliser la ligne sélectionnée pour l'historique
  const phoneId = selectedLineId; // Ligne sélectionnée pour historique
  
  console.log('📞 PHONE ID DEBUG - LIGNE SÉLECTIONNÉE:', {
    selectedLine,
    selectedLineId,
    phoneId, // Maintenant = selectedLineId
    selectedAction,
    shouldSkipHistory: !phoneId || selectedAction !== 'history'
  });
  const { 
    data: historyData, 
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useGetPhonePaymentHistoryQuery(phoneId, { 
    skip: !phoneId || selectedAction !== 'history',
    refetchOnMountOrArgChange: true, // Refetch à chaque changement
    refetchOnFocus: true, // Refetch quand l'onglet retrouve le focus
  });

  // 🎯 NOUVEAU : Query pour récupérer les données de la ligne à jour (incluant le solde)
  const { 
    data: currentLineData,
    refetch: refetchLineData
  } = useGetPhoneByIdQuery(phoneId, { skip: !phoneId });

  // 🎯 Calculer le solde de la ligne sélectionnée après avoir récupéré currentLineData
  const selectedLineBalance = currentLineData?.balance || selectedLine?.balance || 0;

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
        if (!isMountedRef.current) return; // Protection
        if (refetchOverview) refetchOverview();
        if (refetchUnpaidInvoices) refetchUnpaidInvoices();
        // 🆕 NOUVEAU : Rafraîchir aussi toutes les factures
        if (selectedLineId && refetchAllInvoices) {
          refetchAllInvoices();
        }
        // Seulement refetch history si on est sur la page history et si phoneId existe
        if (selectedAction === 'history' && phoneId && refetchHistory) {
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
        if (!isMountedRef.current) return; // Protection
        if (refetchOverview) refetchOverview();
        if (refetchUnpaidInvoices) refetchUnpaidInvoices();
        // 🆕 NOUVEAU : Rafraîchir aussi toutes les factures
        if (selectedLineId && refetchAllInvoices) {
          refetchAllInvoices();
        }
        // Seulement refetch history si on est sur la page history et si phoneId existe
        if (selectedAction === 'history' && phoneId && refetchHistory) {
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
    // NOUVEAU : Utiliser le solde de la ligne sélectionnée
    const lineBalance = selectedLineBalance;
    const costPerMonth = monthlyRate; // Coût par mois pour UNE ligne
    
    // Calculer combien de mois sont déjà couverts par le solde de la ligne
    const monthsCoveredByBalance = Math.floor(lineBalance / costPerMonth);
    
    console.log('💡 CALCUL couverture solde - LIGNE SÉLECTIONNÉE:', {
      selectedLine: selectedLine?.phoneNumber,
      lineBalance,
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

  // 🎯 NOUVEAU : Calculer le montant total avec les vrais prix de chaque ligne
  const calculateAdvanceTotal = () => {
    if (selectedLines.length === 0 || selectedPeriods.length === 0) {
      return 0;
    }
    
    // Calculer le prix total basé sur le prix réel de chaque ligne sélectionnée
    const totalPerMonth = selectedLines.reduce((sum, lineId) => {
      const linePrice = getLineMonthlyPrice(lineId);
      return sum + linePrice;
    }, 0);
    
    return totalPerMonth * selectedPeriods.length;
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

  // Handler pour tout sélectionner/désélectionner les lignes (seulement les actives)
  const handleSelectAllLines = (checked) => {
    if (checked) {
      const activeLinesIds = clientOverview?.lines
        ?.filter(line => {
          // Seulement les lignes actives (pas en attente d'activation)
          return line.phoneStatus !== 'NEEDS_TO_BE_ACTIVATED' && line.line_status !== 'NEEDS_TO_BE_ACTIVATED';
        })
        ?.map(line => line.id) || [];
      setSelectedLines(activeLinesIds);
    } else {
      setSelectedLines([]);
    }
  };

  // 🆕 NOUVEAU : Fonctions pour gérer les PDFs
  const handleViewInvoice = async (invoice) => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!authToken) {
        setSnackbar({
          open: true,
          message: 'Token d\'authentification manquant',
          severity: 'error'
        });
        return;
      }

      setSnackbar({
        open: true,
        message: 'Ouverture de la facture...',
        severity: 'info'
      });

      // Récupérer le PDF avec l'authentification Bearer
      const response = await fetch(`${API_CONFIG.BASE_URL}invoices/${invoice.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Convertir en blob et ouvrir dans un nouvel onglet
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

    } catch (error) {
      console.error('Erreur lors de la visualisation:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la visualisation de la facture',
        severity: 'error'
      });
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!authToken) {
        setSnackbar({
          open: true,
          message: 'Token d\'authentification manquant',
          severity: 'error'
        });
        return;
      }

      setSnackbar({
        open: true,
        message: 'Téléchargement en cours...',
        severity: 'info'
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}invoices/${invoice.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${invoice.invoiceNumber}_${invoice.paymentMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Facture téléchargée avec succès',
        severity: 'success'
      });

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du téléchargement de la facture',
        severity: 'error'
      });
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
      selectedLineBalance: selectedLineBalance
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
    const lineBalance = selectedLineBalance;
    
    setTotalPaymentAmount(amount);
    setPaymentSplit({
      balance: Math.min(amount, lineBalance), // Utiliser le solde disponible de la ligne
      cash: Math.max(0, amount - lineBalance), // Le reste en espèces
      card: 0
    });
    
    console.log('💳 OUVERTURE modal sélection paiement - LIGNE:', selectedLine?.phoneNumber, {
      amount,
      lineBalance,
      suggestedSplit: {
        balance: Math.min(amount, lineBalance),
        cash: Math.max(0, amount - lineBalance)
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
        // 🎯 UTILISER LE NOUVEAU SYSTÈME : Ajout de solde par ligne
        const balanceData = {
          phoneId: selectedLineId,
          clientId: clientId, // Pour invalidation cache
          amount: amountToAddToBalance,
          reason: reason
        };

        console.log('📤 ENVOI addLineBalance pour ligne:', selectedLine?.phoneNumber, balanceData);

        const result = await addLineBalance(balanceData).unwrap();
        
        console.log('✅ SUCCES addLineBalance:', result);
        
        setSnackbar({
          open: true,
          message: `✅ Paiement d'avance de ${totalPaymentAmount}€ ajouté au solde de la ligne ${selectedLine?.phoneNumber} ! Nouveau solde: ${result.newBalance}€`,
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
      console.log('🔄 RAFRAICHISSEMENT IMMEDIAT des données...');
      
      // Refetch immédiat sans délai
      if (refetchOverview) refetchOverview();
      
      // 🎯 NOUVEAU : Refetch des données de la ligne pour mettre à jour le solde
      if (phoneId && refetchLineData) {
        refetchLineData();
      }
      
      // Refetch de l'historique seulement si la query est active
      if (phoneId && selectedAction === 'history' && refetchHistory) {
        try {
          refetchHistory();
        } catch (error) {
          // Silently ignore refetch errors for inactive queries
        }
      }
      
      // Refetch supplémentaire avec délai au cas où l'invalidation met du temps
      setTimeout(() => {
        if (!isMountedRef.current) return; // Protection
        if (refetchOverview) refetchOverview();
        if (phoneId && refetchLineData) {
          refetchLineData(); // 🎯 NOUVEAU : Refetch différé de la ligne aussi
        }
        if (phoneId && selectedAction === 'history' && refetchHistory) {
          try {
            refetchHistory();
          } catch (error) {
            // Silently ignore refetch errors
          }
        }
      }, 200);
      
      // 🎯 REDIRECTION vers l'historique pour voir le nouveau paiement après 1 seconde
      setTimeout(() => {
        setSelectedAction('history');
      }, 1000);
      
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
                    console.log('🟦 OVERVIEW CLICKED - clientId:', clientId);
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
                    fetch(`${API_CONFIG.BASE_URL}/line-payments/client/13/overview`, {
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
                  variant={selectedAction === 'all-invoices' ? 'contained' : 'outlined'}
                  startIcon={<ReceiptIcon />}
                  onClick={() => {
                    setSelectedAction('all-invoices');
                    setInvoiceFilter('all'); // Réinitialiser le filtre
                  }}
                >
                  Toutes les factures
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
                  onClick={() => {
                    setSelectedAction('history');
                    // Refetch immédiat de l'historique quand on clique sur l'onglet
                    if (phoneId && refetchHistory) {
                      setTimeout(() => {
                        if (!isMountedRef.current) return; // Protection
                        try {
                          refetchHistory();
                        } catch (error) {
                          // Silently ignore refetch errors
                        }
                      }, 100);
                    }
                  }}
                >
                  Historique
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Ligne sélectionnée + Aperçu client */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* LIGNE SÉLECTIONNÉE - Focus principal */}
              <Card sx={{ border: 2, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    📱 Ligne sélectionnée
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {selectedLine?.phoneNumber || 'N/A'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Solde de cette ligne
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={
                      selectedLineBalance > 0 ? 'success.main' : 
                      selectedLineBalance < 0 ? 'error.main' : 'text.primary'
                    }
                    sx={{ mb: 1, fontWeight: 'bold' }}
                  >
                    {selectedLineBalance.toFixed(2)}€
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">
                    Statuts
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={selectedLine?.line_status || selectedLine?.phoneStatus || 'N/A'}
                      color={selectedLine?.line_status === 'PLAY' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={selectedLine?.payment_status || selectedLine?.paymentStatus || 'N/A'}
                      color={
                        (selectedLine?.payment_status === 'À JOUR' || selectedLine?.paymentStatus === 'À JOUR') 
                          ? 'success' 
                          : 'error'
                      }
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* CLIENT - Informations secondaires */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    👤 {clientOverview?.client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  
                  {clientOverview ? (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Autres lignes: {(clientOverview.summary?.totalLines || clientOverview.lines?.length || 1) - 1}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total factures impayées: {clientOverview.summary?.unpaidInvoicesCount || 0}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="info" size="small">
                      Données client indisponibles
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contenu principal selon l'action sélectionnée */}
          <Grid item xs={12} md={8}>
            {selectedAction === 'overview' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💰 Ligne sélectionnée: {selectedLine?.phoneNumber} - Solde: {selectedLineBalance.toFixed(2)}€
                    {/* Chip statut paiement - basé sur les vraies factures */}
                    <Chip 
                      label={realPaymentStatus}
                      color={realPaymentStatus === 'À JOUR' ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                    
                    {/* Alert d'incohérence si nécessaire */}
                    {realPaymentStatus !== (selectedLine?.payment_status || selectedLine?.paymentStatus) && (
                      <Chip 
                        label="⚠️ Données incohérentes"
                        color="warning"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => {
                          setSnackbar({
                            open: true,
                            message: `Incohérence détectée: Statut ligne "${selectedLine?.payment_status || selectedLine?.paymentStatus}" vs vraies factures "${realPaymentStatus}"`,
                            severity: 'warning'
                          });
                        }}
                      />
                    )}
                    
                    {/* Chip mois impayé si applicable */}
                    {realPaymentStatus === 'IMPAYÉ' && (
                      <Chip
                        icon={<CalendarIcon />}
                        label={(() => {
                          // Récupérer le vrai mois impayé depuis les factures
                          if (unpaidInvoicesList.length > 0) {
                            const oldestUnpaid = unpaidInvoicesList[0]; // Premier = plus ancien
                            if (oldestUnpaid.paymentMonth) {
                              return new Date(oldestUnpaid.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                                month: 'long',
                                year: 'numeric'
                              });
                            }
                          }
                          // Fallback
                          return new Date().toLocaleDateString('fr-FR', { 
                            month: 'long', 
                            year: 'numeric' 
                          });
                        })()}
                        color="warning"
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  
                  {clientOverview ? (
                    <Box>
                      {/* AUTRES LIGNES AVEC IMPAYÉS - Format compact 3 par ligne */}
                      {(() => {
                        const otherLinesWithUnpaid = clientOverview.lines
                          ?.filter(line => line.id !== selectedLineId)
                          ?.filter(line => {
                            // Exclure les lignes en attente d'activation
                            if (line.phoneStatus === 'NEEDS_TO_BE_ACTIVATED' || line.line_status === 'NEEDS_TO_BE_ACTIVATED') {
                              return false;
                            }
                            return line.payment_status !== 'À JOUR' && line.paymentStatus !== 'À JOUR';
                          }) || [];
                        
                        return otherLinesWithUnpaid.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Autres lignes impayées:
                            </Typography>
                            
                            <Grid container spacing={1}>
                              {otherLinesWithUnpaid.map((line) => (
                                <Grid item xs={12} sm={4} key={line.id}>
                                  <Paper sx={{ p: 1, bgcolor: 'error.50' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Checkbox
                                        checked={selectedOtherLines.includes(line.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedOtherLines(prev => [...prev, line.id]);
                                          } else {
                                            setSelectedOtherLines(prev => prev.filter(id => id !== line.id));
                                          }
                                        }}
                                        size="small"
                                      />
                                      <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                          {line.phoneNumber}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                          {line.balance?.toFixed(2) || '0.00'}€
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                            
                            {selectedOtherLines.length > 0 && (
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                sx={{ mt: 2 }}
                                onClick={() => {
                                  console.log('Payer lignes:', selectedOtherLines);
                                }}
                              >
                                Payer {selectedOtherLines.length} ligne(s) ({selectedOtherLines.length * 25}€)
                              </Button>
                            )}
                          </Box>
                        );
                      })()}
                      
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={() => setSelectedAction('pay-advance')}>
                          Paiement d'avance
                        </Button>
                        <Button variant="outlined" onClick={() => setSelectedAction('invoices')}>
                          Factures
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Alert severity="info">Données indisponibles</Alert>
                  )}
                </CardContent>
              </Card>
            )}
            
            {selectedAction === 'invoices' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Factures impayées - Ligne: {selectedLine?.phoneNumber}
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Seules les factures impayées sont affichées ici.
                    Vous pouvez les payer individuellement ou toutes d'un coup.
                  </Alert>
                  
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

            {selectedAction === 'all-invoices' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Toutes les factures - Ligne: {selectedLine?.phoneNumber}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Visualisation complète de toutes les factures (payées et impayées) avec leurs statuts détaillés.
                  </Alert>
                  
                  {/* Statistiques globales avec filtres cliquables */}
                  {allInvoicesData?.statistics && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        🔍 Cliquez sur un statut pour filtrer les factures :
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
                        <Chip 
                          label={`Toutes (${allInvoicesData.statistics.total})`}
                          color="primary"
                          variant={invoiceFilter === 'all' ? 'filled' : 'outlined'}
                          onClick={() => setInvoiceFilter('all')}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'primary.50' },
                            fontWeight: invoiceFilter === 'all' ? 'bold' : 'normal'
                          }}
                        />
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label={`Payées (${allInvoicesData.statistics.paid})`}
                          color="success" 
                          variant={invoiceFilter === 'paid' ? 'filled' : 'outlined'}
                          onClick={() => setInvoiceFilter('paid')}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'success.50' },
                            fontWeight: invoiceFilter === 'paid' ? 'bold' : 'normal'
                          }}
                        />
                        <Chip 
                          icon={<ErrorIcon />}
                          label={`Impayées (${allInvoicesData.statistics.unpaid})`}
                          color="error" 
                          variant={invoiceFilter === 'unpaid' ? 'filled' : 'outlined'}
                          onClick={() => setInvoiceFilter('unpaid')}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'error.50' },
                            fontWeight: invoiceFilter === 'unpaid' ? 'bold' : 'normal'
                          }}
                        />
                        <Chip 
                          icon={<CalendarIcon />}
                          label={`En retard (${allInvoicesData.statistics.overdue})`}
                          color="warning" 
                          variant={invoiceFilter === 'overdue' ? 'filled' : 'outlined'}
                          onClick={() => setInvoiceFilter('overdue')}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'warning.50' },
                            fontWeight: invoiceFilter === 'overdue' ? 'bold' : 'normal'
                          }}
                        />
                      </Stack>
                      
                      <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              {invoiceFilter === 'all' ? 'Total factures' : `Factures ${invoiceFilter}`}
                            </Typography>
                            <Typography variant="h6">
                              {invoiceFilter === 'all' ? allInvoicesData.statistics.total : filteredInvoices.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              {invoiceFilter === 'all' ? 'Montant total' : 'Montant filtré'}
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                              {invoiceFilter === 'all' 
                                ? allInvoicesData.statistics.totalAmount.toFixed(2)
                                : filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)
                              }€
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="textSecondary">Montant payé</Typography>
                            <Typography variant="h6" color="success.main">
                              {allInvoicesData.statistics.paidAmount.toFixed(2)}€
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="textSecondary">Montant impayé</Typography>
                            <Typography variant="h6" color="error.main">
                              {allInvoicesData.statistics.unpaidAmount.toFixed(2)}€
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  )}
                  
                  {/* Chargement */}
                  {isLoadingAllInvoices ? (
                    <LinearProgress />
                  ) : allInvoicesError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Erreur lors du chargement des factures: {allInvoicesError.message}
                    </Alert>
                  ) : allInvoicesData?.invoices?.length > 0 ? (
                    <Box>
                      {/* Indicateur de filtrage */}
                      <Alert 
                        severity={filteredInvoices.length === 0 ? 'warning' : 'info'} 
                        sx={{ mb: 2 }}
                      >
                        {invoiceFilter === 'all' ? (
                          `Affichage de toutes les ${filteredInvoices.length} factures`
                        ) : (
                          `Filtre "${invoiceFilter}" : ${filteredInvoices.length} facture(s) trouvée(s) sur ${allInvoicesData.invoices.length} au total`
                        )}
                        {filteredInvoices.length === 0 && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Aucune facture ne correspond au filtre sélectionné. Cliquez sur "Toutes" pour voir l'ensemble.
                          </Typography>
                        )}
                      </Alert>
                      
                      {/* Affichage des vraies factures filtrées */}
                      <Stack spacing={2}>
                        {filteredInvoices.map((invoice) => {
                        const monthYear = invoice.paymentMonth ? 
                          new Date(invoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric'
                          }) : 'Mois non défini';
                        
                        // Couleur de bordure selon le statut
                        const borderColor = invoice.isPaid ? 'success.light' : 'error.light';
                        const bgColor = invoice.isPaid ? 'success.50' : 'error.50';
                        const textColor = invoice.isPaid ? 'success.dark' : 'error.dark';
                        
                        return (
                          <Paper key={invoice.id} sx={{ p: 3, border: '1px solid', borderColor, bgcolor: bgColor }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={5}>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: textColor }}>
                                    📄 {invoice.invoiceNumber}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                    📅 Mois: {monthYear}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                  📱 Ligne: {invoice.phoneNumber}
                                </Typography>
                                {invoice.paymentDate && (
                                  <Typography variant="body2" color="textSecondary">
                                    ✅ Payé le: {new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}
                                  </Typography>
                                )}
                                {invoice.daysOverdue > 0 && (
                                  <Chip
                                    label={`⚠️ ${invoice.daysOverdue} jours de retard`}
                                    color="error"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Grid>
                              
                              <Grid item xs={12} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: textColor }}>
                                    {invoice.amount.toFixed(2)}€
                                  </Typography>
                                  <Chip
                                    icon={invoice.isPaid ? <CheckCircleIcon /> : <ErrorIcon />}
                                    label={invoice.statusLabel}
                                    color={invoice.statusColor}
                                    size="small"
                                    sx={{ mt: 1 }}
                                  />
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                  {/* Actions PDF pour toutes les factures */}
                                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                                    <Tooltip title="Visualiser la facture PDF">
                                      <IconButton
                                        color="primary"
                                        onClick={() => handleViewInvoice(invoice)}
                                        size="small"
                                        sx={{
                                          bgcolor: 'primary.50',
                                          '&:hover': { bgcolor: 'primary.100' }
                                        }}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Télécharger la facture PDF">
                                      <IconButton
                                        color="secondary"
                                        onClick={() => handleDownloadInvoice(invoice)}
                                        size="small"
                                        sx={{
                                          bgcolor: 'secondary.50',
                                          '&:hover': { bgcolor: 'secondary.100' }
                                        }}
                                      >
                                        <DownloadIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>

                                  {invoice.isPaid ? (
                                    <Box>
                                      <Typography variant="body2" color="textSecondary">
                                        Méthode: {invoice.paymentMethod || 'Non spécifiée'}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Référence: {invoice.invoiceNumber}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handleOpenPaymentModal(invoice)}
                                      fullWidth
                                    >
                                      Payer
                                    </Button>
                                  )}
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
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Aucune facture trouvée pour cette ligne ({selectedLine?.phoneNumber})
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
                    Sélectionnez les lignes et les mois futurs pour lesquels vous souhaitez payer à l'avance. 
                    Le montant sera calculé automatiquement selon le prix d'abonnement de chaque ligne.
                    <br/>
                    <strong>Ligne sélectionnée ({selectedLine?.phoneNumber}) : {monthlyRate.toFixed(2)}€/mois</strong>
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
                              checked={(() => {
                                const activeLines = clientOverview?.lines?.filter(line => 
                                  line.phoneStatus !== 'NEEDS_TO_BE_ACTIVATED' && line.line_status !== 'NEEDS_TO_BE_ACTIVATED'
                                ) || [];
                                return selectedLines.length === activeLines.length && selectedLines.length > 0;
                              })()}
                              indeterminate={(() => {
                                const activeLines = clientOverview?.lines?.filter(line => 
                                  line.phoneStatus !== 'NEEDS_TO_BE_ACTIVATED' && line.line_status !== 'NEEDS_TO_BE_ACTIVATED'
                                ) || [];
                                return selectedLines.length > 0 && selectedLines.length < activeLines.length;
                              })()}
                              onChange={(e) => handleSelectAllLines(e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="bold">🔘 Toutes les lignes</Typography>}
                        />
                        <Box sx={{ ml: 3, mt: 1 }}>
                          {clientOverview?.lines
                            ?.filter(line => {
                              // Exclure les lignes en attente d'activation
                              return line.phoneStatus !== 'NEEDS_TO_BE_ACTIVATED' && line.line_status !== 'NEEDS_TO_BE_ACTIVATED';
                            })
                            ?.map((line) => (
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
                                  <Chip 
                                    label={`${getLineMonthlyPrice(line.id).toFixed(2)}€/mois`}
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
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
                          <strong>💰 Analyse du solde - Ligne sélectionnée:</strong>
                        </Typography>
                        <Typography variant="body2">
                          • Solde ligne sélectionnée ({selectedLine?.phoneNumber}): <strong>{selectedLineBalance.toFixed(2)}€</strong><br/>
                          • Prix abonnement de cette ligne: <strong>{monthlyRate.toFixed(2)}€/mois</strong><br/>
                          • Mois couverts par le solde actuel: <strong>{Math.floor(selectedLineBalance / monthlyRate)}</strong>
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
                          
                          {/* Détail par ligne sélectionnée */}
                          {selectedLines.length > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                💰 Détail par ligne :
                              </Typography>
                              {selectedLines.map((lineId) => {
                                const line = clientOverview?.lines?.find(l => l.id === lineId);
                                const linePrice = getLineMonthlyPrice(lineId);
                                return (
                                  <Typography key={lineId} variant="body2" sx={{ ml: 2 }}>
                                    📞 {line?.phoneNumber}: {linePrice.toFixed(2)}€/mois
                                  </Typography>
                                );
                              })}
                              <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>
                                Total/mois: {selectedLines.reduce((sum, lineId) => sum + getLineMonthlyPrice(lineId), 0).toFixed(2)}€
                              </Typography>
                            </Grid>
                          )}
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1, bgcolor: 'primary.contrastText' }} />
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                              🧮 Calcul: {selectedLines.reduce((sum, lineId) => sum + getLineMonthlyPrice(lineId), 0).toFixed(2)}€/mois × {selectedPeriods.length} mois
                            </Typography>
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
                        const lineBalance = selectedLineBalance;
                        
                        setAdvanceAmount(amount);
                        setTotalPaymentAmount(amount);
                        
                        // Suggérer automatiquement la répartition optimale
                        setPaymentSplit({
                          balance: Math.min(amount, selectedLineBalance),
                          cash: Math.max(0, amount - selectedLineBalance),
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
                      • Chaque ligne a son propre prix d'abonnement (prix adapté automatiquement)<br/>
                      • Le système débitera automatiquement selon le prix de chaque ligne le 20 de chaque mois<br/>
                      • Ce paiement ajoutera {calculateAdvanceTotal().toFixed(2)}€ au solde de la ligne sélectionnée
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {selectedAction === 'history' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Historique des paiements - {selectedLine?.phoneNumber}
                  </Typography>
                  
                  {isLoadingHistory ? (
                    <LinearProgress />
                  ) : historyData ? (
                    <Box>
                      {/* Affichage propre de l'historique des paiements */}
                      {historyData.paymentHistory && historyData.paymentHistory.length > 0 ? (
                        <List>
                          {historyData.paymentHistory.map((payment) => (
                            <ListItem key={payment.id} divider>
                              <ListItemText
                                primary={
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1">
                                      Paiement {payment.paymentMonth}
                                    </Typography>
                                    <Chip
                                      label={payment.status === 'COMPLETED' ? 'PAYÉ' : payment.status}
                                      color={
                                        payment.status === 'COMPLETED' || payment.status === 'PAID' ? 'success' :
                                        payment.status === 'PENDING' ? 'warning' :
                                        payment.status === 'OVERDUE' ? 'error' : 'default'
                                      }
                                      size="small"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      💰 <strong>{payment.amount}€</strong> • {payment.paymentMethod}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      📅 {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                                    </Typography>
                                    {payment.invoiceNumber && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        📄 Facture: {payment.invoiceNumber}
                                      </Typography>
                                    )}
                                    {payment.notes && (
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                        📝 {payment.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            {historyData.message || 'Aucun paiement d\'avance effectué pour cette ligne'}
                          </Typography>
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
                Solde ligne sélectionnée: {selectedLineBalance.toFixed(2)}€
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
                    const available = selectedLineBalance;
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
                    balance: Math.min(totalPaymentAmount, selectedLineBalance),
                    cash: 0,
                    card: 0
                  })}
                  disabled={selectedLineBalance === 0 || selectedLineBalance < totalPaymentAmount}
                >
                  Tout par solde
                </Button>
              </Stack>
              
              {/* Paiement par solde */}
              <Box mb={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalanceIcon color="primary" />
                  <Typography variant="body1" sx={{ minWidth: 100 }}>Solde ligne:</Typography>
                  <TextField
                    type="number"
                    value={paymentSplit.balance}
                    onChange={(e) => setPaymentSplit(prev => ({
                      ...prev,
                      balance: Math.max(0, Math.min(parseFloat(e.target.value) || 0, selectedLineBalance))
                    }))}
                    InputProps={{
                      endAdornment: '€',
                      inputProps: { 
                        min: 0, 
                        max: selectedLineBalance,
                        step: 0.01 
                      }
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    (Max: {selectedLineBalance.toFixed(2)}€)
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