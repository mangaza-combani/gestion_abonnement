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
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  PictureAsPdf as PdfIcon,
  Print as PrintIcon
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

  // États pour le traitement des paiements par ligne
  const [paymentResults, setPaymentResults] = useState([]);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [processingPayments, setProcessingPayments] = useState(false);
  
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

  // 🆕 États pour l'édition manuelle du montant
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [manualAmount, setManualAmount] = useState('');

  // 🎯 NOUVELLE LOGIQUE : Ligne sélectionnée + Client
  const [currentSelectedLineId, setCurrentSelectedLineId] = useState(selectedLine?.id); // État pour la ligne actuellement sélectionnée
  const selectedLineId = currentSelectedLineId || selectedLine?.id; // ID de la ligne sélectionnée
  const clientId = client?.id; // ID du vrai client

  // Mettre à jour la ligne sélectionnée quand selectedLine change (ouverture du modal)
  useEffect(() => {
    if (selectedLine?.id && selectedLine.id !== currentSelectedLineId) {
      setCurrentSelectedLineId(selectedLine.id);
    }
  }, [selectedLine?.id, currentSelectedLineId]);

  
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

  // 🆕 Réinitialiser le montant manuel quand les données changent
  useEffect(() => {
    // Réinitialiser l'édition et le montant manuel quand la sélection change
    setIsEditingAmount(false);
    setManualAmount('');
  }, [selectedLines, currentSelectedLineId, clientOverview]);

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
    clientOverviewUnpaidInvoices: clientOverview?.unpaidInvoices
  });

  // 🔍 DEBUG : Voir les vraies valeurs des statuts de paiement
  console.log('🔍 DEBUG PAYMENT STATUS:', {
    clientOverviewLines: clientOverview?.lines?.map(line => ({
      id: line.id,
      phoneNumber: line.phoneNumber,
      payment_status: line.payment_status,
      paymentStatus: line.paymentStatus,
      balance: line.balance,
      line_status: line.line_status,
      phoneStatus: line.phoneStatus
    }))
  });

  // 🎯 FONCTION UTILITAIRE : Détecter si une ligne a des impayés (corrigée)
  const hasUnpaidInvoices = (line) => {
    // Méthode 1: Vérifier s'il y a des factures impayées réelles pour cette ligne
    const unpaidInvoicesForLine = clientOverview?.unpaidInvoices?.filter(invoice =>
      invoice.phoneNumber === line.phoneNumber || invoice.lineId === line.id
    ) || [];
    const realUnpaidAmount = unpaidInvoicesForLine.reduce((total, invoice) => total + (invoice.amount || 0), 0);
    const invoiceCheck = realUnpaidAmount > 0;

    // Méthode 2: Vérifier le solde négatif (seulement si pas de factures réelles)
    const balanceCheck = !invoiceCheck && (line.balance || 0) < 0;

    // Méthode 3: Vérifier les statuts de paiement (seulement si les autres méthodes échouent)
    const statusCheck = !invoiceCheck && !balanceCheck &&
      (line.payment_status === 'IMPAYÉ' || line.paymentStatus === 'IMPAYÉ');

    console.log(`🔍 Line ${line.phoneNumber} unpaid check (CORRECTED):`, {
      unpaidInvoicesCount: unpaidInvoicesForLine.length,
      realUnpaidAmount: realUnpaidAmount.toFixed(2),
      invoiceCheck,
      balanceCheck,
      statusCheck,
      payment_status: line.payment_status,
      paymentStatus: line.paymentStatus,
      balance: line.balance,
      finalResult: invoiceCheck || balanceCheck || statusCheck
    });

    // Priorité aux factures réelles, puis solde, puis statut
    return invoiceCheck || balanceCheck || statusCheck;
  };

  // 🎯 FONCTION : Calculer le montant des factures impayées pour une ligne spécifique
  const getLineUnpaidAmount = (line) => {
    if (!clientOverview?.unpaidInvoices) return 0;

    // Trouver les factures impayées pour cette ligne
    const lineUnpaidInvoices = clientOverview.unpaidInvoices.filter(invoice =>
      invoice.phoneNumber === line.phoneNumber || invoice.lineId === line.id
    );

    // Calculer le montant total
    return lineUnpaidInvoices.reduce((total, invoice) => total + (invoice.amount || 0), 0);
  };

  // 🎯 NOUVELLE FONCTION : Récupérer les détails des factures impayées pour le tooltip
  const getLineUnpaidInvoicesDetails = (line) => {
    if (!clientOverview?.unpaidInvoices) return [];

    // Trouver les factures impayées pour cette ligne
    const lineUnpaidInvoices = clientOverview.unpaidInvoices.filter(invoice =>
      invoice.phoneNumber === line.phoneNumber || invoice.lineId === line.id
    );

    // Formatter les détails pour l'affichage
    return lineUnpaidInvoices.map(invoice => {
      const month = invoice.paymentMonth
        ? new Date(invoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })
        : 'Mois non défini';

      return {
        month,
        amount: invoice.amount || 0,
        invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
        dueDate: invoice.dueDate
      };
    });
  };

  // 🎯 FONCTION : Créer le contenu du tooltip pour les factures impayées
  const createUnpaidTooltipContent = (line) => {
    const unpaidDetails = getLineUnpaidInvoicesDetails(line);

    if (unpaidDetails.length === 0) return '';

    const totalAmount = unpaidDetails.reduce((total, detail) => total + detail.amount, 0);

    let content = `Factures impayées (${totalAmount.toFixed(2)}€):\n`;
    unpaidDetails.forEach((detail, index) => {
      content += `• ${detail.month}: ${detail.amount.toFixed(2)}€`;
      if (index < unpaidDetails.length - 1) content += '\n';
    });

    return content;
  };

  // 🎯 NOUVELLE FONCTION : Calculer le montant réel des factures impayées pour les lignes sélectionnées
  const getSelectedLinesUnpaidInvoicesAmount = () => {
    if (!clientOverview?.unpaidInvoices || selectedLines.length === 0) return 0;

    // Filtrer les factures impayées qui correspondent aux lignes sélectionnées
    const selectedLinesUnpaidInvoices = clientOverview.unpaidInvoices.filter(invoice => {
      // Vérifier si cette facture appartient à une ligne sélectionnée
      return selectedLines.some(selectedLineId => {
        const line = clientOverview.lines?.find(l => l.id === selectedLineId);
        return line && (invoice.phoneNumber === line.phoneNumber || invoice.lineId === selectedLineId);
      });
    });

    // Calculer le montant total
    return selectedLinesUnpaidInvoices.reduce((total, invoice) => total + (invoice.amount || 0), 0);
  };

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

  // 🎯 Calculer le solde et les infos de la ligne actuellement sélectionnée
  const getCurrentSelectedLine = () => {
    if (clientOverview?.lines) {
      return clientOverview.lines.find(line => line.id === selectedLineId) || selectedLine;
    }
    return selectedLine;
  };

  const currentSelectedLine = getCurrentSelectedLine();
  const selectedLineBalance = currentLineData?.balance || currentSelectedLine?.balance || 0;

  // Fonction utilitaire pour extraire les factures impayées DE LA LIGNE ACTIVE UNIQUEMENT
  const getUnpaidInvoicesListSafe = () => {
    let allUnpaidInvoices = [];

    // Priorité 1: données de l'endpoint spécifique unpaidInvoices
    if (Array.isArray(unpaidInvoices) && unpaidInvoices.length > 0) {
      allUnpaidInvoices = unpaidInvoices;
    }
    // Priorité 2: données depuis clientOverview.unpaidInvoices
    else if (Array.isArray(clientOverview?.unpaidInvoices) && clientOverview.unpaidInvoices.length > 0) {
      allUnpaidInvoices = clientOverview.unpaidInvoices;
    }

    // Filtrer pour ne garder que les impayés de la ligne active
    if (allUnpaidInvoices.length > 0 && currentSelectedLine) {
      return allUnpaidInvoices.filter(invoice =>
        invoice.phoneNumber === currentSelectedLine.phoneNumber ||
        invoice.lineId === currentSelectedLine.id
      );
    }

    // Fallback: array vide
    return [];
  };

  const unpaidInvoicesList = getUnpaidInvoicesListSafe();

  // 💰 NOUVELLES FONCTIONS : Paiement par ligne individuelle
  const processIndividualLinePayments = async (paymentMethod) => {
    setProcessingPayments(true);
    const results = [];

    try {
      // Obtenir les lignes avec impayés seulement
      const linesWithUnpaid = selectedLines.filter(lineId => {
        const line = clientOverview?.lines?.find(l => l.id === lineId);
        return hasUnpaidInvoices(line);
      });

      console.log('🎯 Lignes à traiter pour paiement:', {
        totalSelected: selectedLines.length,
        withUnpaid: linesWithUnpaid.length,
        lineIds: linesWithUnpaid
      });

      // Traiter chaque ligne individuellement
      for (const lineId of linesWithUnpaid) {
        const line = clientOverview?.lines?.find(l => l.id === lineId);
        const lineUnpaidAmount = getLineUnpaidAmount(line);

        if (lineUnpaidAmount > 0) {
          console.log(`💸 Traitement paiement ligne ${line?.phoneNumber}: ${lineUnpaidAmount}€`);

          try {
            // Utiliser l'endpoint de paiement groupé avec une seule ligne
            const paymentData = {
              clientId: client.id,
              phoneIds: [lineId],
              paymentMethod: paymentMethod,
              amount: lineUnpaidAmount,
              notes: `Paiement ${paymentMethod === 'cash' ? 'espèces' : 'CB'} - Ligne ${line?.phoneNumber}`
            };

            const result = await processGroupPayment(paymentData).unwrap();

            // Extraire les invoiceIds de paidInvoices
            const invoiceIds = result.paidInvoices ? result.paidInvoices.map(inv => inv.invoiceId) :
                              result.invoiceIds || [];

            results.push({
              lineId,
              phoneNumber: line?.phoneNumber,
              amount: lineUnpaidAmount,
              success: true,
              invoiceIds: invoiceIds,
              paymentId: result.paymentId,
              result,
              paidInvoices: result.paidInvoices // Garder les données complètes
            });

            console.log(`✅ Paiement réussi pour ligne ${line?.phoneNumber}:`, result);

          } catch (error) {
            console.error(`❌ Erreur paiement ligne ${line?.phoneNumber}:`, error);
            results.push({
              lineId,
              phoneNumber: line?.phoneNumber,
              amount: lineUnpaidAmount,
              success: false,
              error: error.message || 'Erreur inconnue'
            });
          }
        }
      }

      setPaymentResults(results);
      setShowPaymentConfirmation(true);

      // Rafraîchir les données
      refetchOverview();
      if (unpaidInvoices) {
        refetchUnpaidInvoices();
      }

    } catch (error) {
      console.error('❌ Erreur générale lors du traitement des paiements:', error);
      alert('Erreur lors du traitement des paiements. Veuillez réessayer.');
    } finally {
      setProcessingPayments(false);
    }
  };

  // 🔍 NOUVELLE FONCTION : Afficher l'aperçu de facture HTML
  const showInvoicePDF = async (invoiceId, title = 'Facture') => {
    try {
      // Vérifier l'authentification
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!authToken) {
        setSnackbar({
          open: true,
          message: 'Token d\'authentification manquant',
          severity: 'error'
        });
        return;
      }

      // Utiliser la route PDF publique avec authentification par token
      const serverUrl = API_CONFIG.SERVER_URL || 'http://localhost:3333';
      const previewUrl = `${serverUrl}/api/invoices/public/${invoiceId}/pdf-with-token?token=${encodeURIComponent(authToken)}`;

      console.log(`📄 Ouverture aperçu facture ${invoiceId}:`, previewUrl);

      // Ouvrir directement l'aperçu HTML existant dans un nouvel onglet
      const pdfWindow = window.open(previewUrl, `invoice-${invoiceId}`, 'width=1000,height=800');

      if (pdfWindow) {
        // Attendre que la page se charge et ajouter des fonctionnalités d'impression
        pdfWindow.onload = () => {
          console.log('📄 Aperçu de facture chargé avec succès');
        };
      } else {
        // Fallback si les popups sont bloquées
        alert('Veuillez autoriser les popups pour voir la facture');
        window.open(previewUrl, '_blank');
      }

    } catch (error) {
      console.error(`❌ Erreur récupération PDF facture ${invoiceId}:`, error);
      setSnackbar({
        open: true,
        message: `❌ Erreur lors de l'ouverture de la facture: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // 🖨️ NOUVELLE FONCTION : Affichage PDF consolidé de toutes les factures
  const handlePrintConsolidatedInvoices = async (result) => {
    if (!result.success || !result.invoiceIds || result.invoiceIds.length === 0) {
      console.warn('Aucune facture à imprimer pour cette ligne');
      return;
    }

    try {
      // Vérifier l'authentification
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!authToken) {
        setSnackbar({
          open: true,
          message: 'Token d\'authentification manquant',
          severity: 'error'
        });
        return;
      }

      // Utiliser la route POST pour le PDF consolidé
      const serverUrl = API_CONFIG.SERVER_URL || 'http://localhost:3333';
      const consolidatedUrl = `${serverUrl}/api/invoices/public/consolidated-pdf-with-token`;

      // Créer le formulaire pour envoyer les données en POST
      const formData = new FormData();
      formData.append('token', authToken);
      result.invoiceIds.forEach((id, index) => {
        formData.append(`invoiceIds[${index}]`, id.toString());
      });

      console.log(`📄 Ouverture PDF consolidé pour ${result.invoiceIds.length} factures:`, result.invoiceIds);

      // Créer un lien temporaire pour télécharger le PDF consolidé
      const response = await fetch(consolidatedUrl, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, `consolidated-invoices-${result.phoneNumber}`, 'width=1000,height=800');

        // Nettoyer l'URL après un délai
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        console.error('Erreur lors de la génération du PDF consolidé');
        setSnackbar({
          open: true,
          message: 'Erreur lors de la génération du PDF consolidé',
          severity: 'error'
        });
      }

    } catch (error) {
      console.error('Erreur PDF consolidé:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la génération du PDF consolidé',
        severity: 'error'
      });
    }
  };

  // 🖨️ NOUVELLE FONCTION : Affichage des factures PDF (aperçu) - version individuelle
  const handlePrintInvoice = async (result) => {
    if (!result.success || !result.invoiceIds || result.invoiceIds.length === 0) {
      console.warn('Aucune facture à imprimer pour cette ligne');
      return;
    }

    // Afficher chaque facture dans un nouvel onglet
    for (const invoiceId of result.invoiceIds) {
      await showInvoicePDF(invoiceId, `Facture ligne ${result.phoneNumber}`);
    }
  };

  // 🖨️ NOUVELLE FONCTION : Affichage d'aperçu de reçu/facture de paiement
  const handlePrintPaymentReceipt = async (result) => {
    if (!result.success) {
      console.warn('Impossible d\'afficher le reçu pour un paiement échoué');
      return;
    }

    console.log('📄 handlePrintPaymentReceipt appelée avec:', result);

    // Essayer de trouver un invoiceId pour afficher la facture PDF
    let invoiceId = null;

    // Priorité 1: invoiceIds direct
    if (result.invoiceIds && result.invoiceIds.length > 0) {
      invoiceId = result.invoiceIds[0];
      console.log('📄 Utilisation direct invoiceId:', invoiceId);
    }
    // Priorité 2: paidInvoices direct du result
    else if (result.paidInvoices && result.paidInvoices.length > 0) {
      invoiceId = result.paidInvoices[0].invoiceId;
      console.log('📄 Utilisation paidInvoices direct:', invoiceId);
    }
    // Priorité 3: invoiceIds du résultat API imbriqué (paidInvoices)
    else if (result.result?.paidInvoices && result.result.paidInvoices.length > 0) {
      invoiceId = result.result.paidInvoices[0].invoiceId;
      console.log('📄 Utilisation paidInvoices invoiceId:', invoiceId);
    }

    // Si on a trouvé un invoiceId, afficher la facture PDF
    if (invoiceId) {
      await showInvoicePDF(invoiceId, `Facture - Paiement ligne ${result.phoneNumber}`);

      setSnackbar({
        open: true,
        message: `📄 Aperçu facture ouverte pour ligne ${result.phoneNumber}`,
        severity: 'success'
      });
    } else {
      // Fallback: afficher un message de confirmation simple
      setSnackbar({
        open: true,
        message: `✅ Paiement de ${result.amount.toFixed(2)}€ pour ligne ${result.phoneNumber} traité avec succès`,
        severity: 'success'
      });

      console.log('⚠️ Aucun invoiceId trouvé pour afficher la facture PDF. Structure result:', result);
    }
  };

  // 🖨️ NOUVELLE FONCTION : Affichage d'une facture individuelle
  const handlePrintSingleInvoice = async (invoiceId, phoneNumber) => {
    if (!invoiceId) {
      console.warn('ID de facture manquant pour l\'impression');
      return;
    }

    console.log(`📄 Affichage facture individuelle ${invoiceId} pour ligne ${phoneNumber}`);

    // Utiliser la fonction showInvoicePDF pour afficher l'aperçu
    await showInvoicePDF(invoiceId, `Facture - Ligne ${phoneNumber}`);

    // Message de confirmation
    setSnackbar({
      open: true,
      message: `📄 Ouverture aperçu facture pour ligne ${phoneNumber}`,
      severity: 'info'
    });
  };

  // 🎯 NOUVEAU : Fonction pour vérifier le vrai statut de paiement basé sur les factures réelles de la ligne sélectionnée
  const getRealPaymentStatus = () => {
    // Si on a des données de factures impayées, c'est la source de vérité
    if (unpaidInvoicesList.length > 0) {
      return 'IMPAYÉ';
    }

    // Si on a chargé les données et qu'il n'y a pas de factures impayées
    if (!isLoadingInvoices && unpaidInvoicesList.length === 0) {
      return 'À JOUR';
    }

    // Fallback sur le statut de la ligne actuellement sélectionnée
    return currentSelectedLine?.payment_status || currentSelectedLine?.paymentStatus || 'INCONNU';
  };

  const realPaymentStatus = getRealPaymentStatus();

  // Sélectionner automatiquement la ligne active selon le mode
  useEffect(() => {
    if (currentSelectedLine) {
      const lineHasUnpaid = hasUnpaidInvoices(currentSelectedLine);

      if (selectedAction === 'pay-advance') {
        // Mode paiement d'avance : sélectionner si la ligne est à jour
        if (!lineHasUnpaid && !selectedLines.includes(currentSelectedLine.id)) {
          setSelectedLines([currentSelectedLine.id]);
        }
      } else {
        // Mode normal : sélectionner si la ligne a des impayés
        if (lineHasUnpaid && !selectedLines.includes(currentSelectedLine.id)) {
          setSelectedLines([currentSelectedLine.id]);
        }
      }
    }
  }, [selectedAction, currentSelectedLine]);

  // Handler pour paiement groupé
  const handleGroupPayment = async () => {
    if (!clientId) return;

    try {
      // Vérifier qu'il y a des lignes sélectionnées
      if (selectedLines.length === 0) {
        setSnackbar({
          open: true,
          message: '⚠️ Aucune ligne sélectionnée pour le paiement',
          severity: 'warning'
        });
        return;
      }

      // Filtrer les lignes sélectionnées qui ont des factures impayées
      const selectedLinesWithUnpaid = selectedLines.filter(lineId => {
        const line = clientOverview?.lines?.find(l => l.id === lineId);
        const unpaidAmount = getLineUnpaidAmount(line);
        return unpaidAmount > 0;
      });

      if (selectedLinesWithUnpaid.length === 0) {
        setSnackbar({
          open: true,
          message: '⚠️ Aucune facture impayée dans les lignes sélectionnées',
          severity: 'warning'
        });
        return;
      }

      // 🆕 Utiliser le montant manuel si défini, sinon le montant calculé
      const calculatedAmount = getSelectedLinesUnpaidInvoicesAmount();
      const finalAmount = manualAmount && !isNaN(parseFloat(manualAmount)) ? parseFloat(manualAmount) : calculatedAmount;

      const result = await processGroupPayment({
        clientId,
        phoneIds: selectedLinesWithUnpaid,
        paymentMethod: 'manual',
        amount: finalAmount,
        notes: `Paiement groupé${manualAmount && !isNaN(parseFloat(manualAmount)) && parseFloat(manualAmount) !== calculatedAmount ? ' (montant modifié)' : ''} - ${selectedLinesWithUnpaid.length} ligne(s) - Total: ${finalAmount}€`
      }).unwrap();

      // 🎉 TRAITEMENT DES RÉSULTATS POUR AFFICHAGE
      console.log('📄 Résultat du paiement groupé:', result);

      const groupedResults = [];

      // Créer les résultats basés sur la réponse de l'API
      if (result.paidInvoices && result.paidInvoices.length > 0) {
        // Grouper les résultats par ligne (phoneId)
        const resultsByLine = new Map();

        result.paidInvoices.forEach(paidInvoice => {
          const phoneId = paidInvoice.phoneId;
          const line = clientOverview?.lines?.find(l => l.id === phoneId);

          if (!resultsByLine.has(phoneId)) {
            resultsByLine.set(phoneId, {
              lineId: phoneId,
              phoneNumber: paidInvoice.phoneNumber || line?.phoneNumber,
              amount: 0,
              success: true,
              invoiceIds: [],
              paymentId: result.paymentId,
              result: result,
              paidInvoices: []
            });
          }

          const lineResult = resultsByLine.get(phoneId);
          lineResult.amount += paidInvoice.paidAmount;
          lineResult.invoiceIds.push(paidInvoice.invoiceId);
          lineResult.paidInvoices.push(paidInvoice);
        });

        groupedResults.push(...resultsByLine.values());
      } else {
        // Fallback : créer un résultat générique si pas de détails spécifiques
        selectedLinesWithUnpaid.forEach(lineId => {
          const line = clientOverview?.lines?.find(l => l.id === lineId);

          groupedResults.push({
            lineId,
            phoneNumber: line?.phoneNumber,
            amount: finalAmount / selectedLinesWithUnpaid.length, // Répartir équitablement
            success: true,
            invoiceIds: [],
            paymentId: result.paymentId,
            result: result,
            paidInvoices: []
          });
        });
      }

      setPaymentResults(groupedResults);
      setShowPaymentConfirmation(true);

      setSnackbar({
        open: true,
        message: `✅ Paiement groupé de ${finalAmount.toFixed(2)}€ effectué avec succès sur ${selectedLinesWithUnpaid.length} ligne(s) !`,
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

  // 🧠 LOGIQUE INTELLIGENTE : Calculer les mois disponibles selon le solde ET la règle du 20
  const generateFuturePeriods = () => {
    const periods = [];
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    // NOUVEAU : Utiliser le solde de la ligne sélectionnée
    const lineBalance = selectedLineBalance;
    const costPerMonth = monthlyRate; // Coût par mois pour UNE ligne

    // Calculer combien de mois sont déjà couverts par le solde de la ligne
    const monthsCoveredByBalance = Math.floor(lineBalance / costPerMonth);

    console.log('💡 CALCUL couverture solde - LIGNE SÉLECTIONNÉE:', {
      selectedLine: selectedLine?.phoneNumber,
      lineBalance,
      costPerMonth,
      monthsCoveredByBalance,
      currentDay,
      isAfter20th: currentDay >= 20
    });

    // 🎯 RÈGLE DU 20 : Si on est après le 20, le mois prochain n'est plus disponible pour l'avance
    const startingMonth = currentDay >= 20 ? 2 : 1; // Commencer au mois d'après si on est après le 20

    for (let i = startingMonth; i <= 6; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const periodKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      const periodLabel = futureDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      // Ajuster l'index pour la couverture par le solde selon le mois de départ
      const adjustedIndex = i - startingMonth + 1;
      const isCoveredByBalance = adjustedIndex <= monthsCoveredByBalance;

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
    // 🆕 Utiliser le montant manuel si défini et valide, sinon utiliser advanceAmount
    const manualAmountValue = manualAmount && !isNaN(parseFloat(manualAmount)) ? parseFloat(manualAmount) : null;
    const amount = manualAmountValue || parseFloat(advanceAmount);
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
          {/* Navigation simplifiée */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  💳 Interface d'Encaissement
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={selectedAction === 'overview' ? 'contained' : 'outlined'}
                    startIcon={<PaymentIcon />}
                    onClick={() => setSelectedAction('overview')}
                    color="primary"
                  >
                    Encaissement
                  </Button>
                  <Button
                    variant={selectedAction === 'pay-advance' ? 'contained' : 'outlined'}
                    startIcon={<TrendingUpIcon />}
                    onClick={() => setSelectedAction('pay-advance')}
                    size="small"
                    color="success"
                  >
                    Paiement d'avance
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Sélecteur de lignes du client */}
          <Grid item xs={12} md={selectedAction === 'pay-advance' ? 6 : 8}>
            <Stack spacing={2}>
              {/* EN-TÊTE CLIENT */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    👤 {clientOverview?.client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Sélectionnez la ligne à traiter
                  </Typography>

                  {/* Statistiques intégrées */}
                  {clientOverview?.lines && (
                    <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                      <Typography variant="caption" color="primary.main" fontWeight="bold">
                        📊 {clientOverview.lines.length} ligne{clientOverview.lines.length > 1 ? 's' : ''}
                      </Typography>
                      {(() => {
                        const unpaidLinesCount = clientOverview.lines.filter(hasUnpaidInvoices).length;
                        return unpaidLinesCount > 0 && (
                          <Typography variant="caption" color="error.main" fontWeight="bold">
                            ⚠️ {unpaidLinesCount} impayée{unpaidLinesCount > 1 ? 's' : ''}
                          </Typography>
                        );
                      })()}
                      {selectedLines.length > 0 && (
                        <Typography variant="caption" color="warning.main" fontWeight="bold">
                          ✓ {selectedLines.length} sélectionnée{selectedLines.length > 1 ? 's' : ''}
                          {(() => {
                            // Calculer combien de lignes sélectionnées sont impayées
                            const selectedWithUnpaid = clientOverview?.lines?.filter(line =>
                              selectedLines.includes(line.id) && hasUnpaidInvoices(line)
                            ).length || 0;

                            if (selectedWithUnpaid > 0 && selectedWithUnpaid < selectedLines.length) {
                              return ` (${selectedWithUnpaid} impayée${selectedWithUnpaid > 1 ? 's' : ''})`;
                            }
                            return '';
                          })()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* LISTE DES LIGNES DU CLIENT */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    📱 Lignes du client
                  </Typography>

                  {clientOverview?.lines ? (
                    <TableContainer sx={{ maxHeight: 400, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                indeterminate={(() => {
                                  const eligibleLines = selectedAction === 'pay-advance'
                                    ? clientOverview?.lines?.filter(line => !hasUnpaidInvoices(line)) || []
                                    : clientOverview?.lines?.filter(hasUnpaidInvoices) || [];
                                  return selectedLines.length > 0 && selectedLines.length < eligibleLines.length;
                                })()}
                                checked={(() => {
                                  const eligibleLines = selectedAction === 'pay-advance'
                                    ? clientOverview?.lines?.filter(line => !hasUnpaidInvoices(line)) || []
                                    : clientOverview?.lines?.filter(hasUnpaidInvoices) || [];
                                  return eligibleLines.length > 0 && selectedLines.length === eligibleLines.length;
                                })()}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const eligibleLines = selectedAction === 'pay-advance'
                                      ? clientOverview?.lines?.filter(line => !hasUnpaidInvoices(line)) || []
                                      : clientOverview?.lines?.filter(hasUnpaidInvoices) || [];
                                    setSelectedLines(eligibleLines.map(line => line.id));
                                  } else {
                                    setSelectedLines([]);
                                  }
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>📱 Numéro</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>💰 Solde</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>💳 Paiement</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {clientOverview.lines.map((line) => {
                            const isCurrentlySelected = line.id === selectedLineId;
                            const isSelected = selectedLines.includes(line.id);
                            const lineHasUnpaidInvoices = hasUnpaidInvoices(line);
                            const lineBalance = line.balance || 0;
                            const unpaidAmount = getLineUnpaidAmount(line);

                            return (
                              <TableRow
                                key={line.id}
                                sx={{
                                  cursor: 'pointer',
                                  bgcolor: isCurrentlySelected ? 'primary.50' :
                                          isSelected ? 'warning.50' :
                                          lineHasUnpaidInvoices ? 'error.50' : 'inherit',
                                  '&:hover': {
                                    bgcolor: isCurrentlySelected ? 'primary.100' :
                                            isSelected ? 'warning.100' :
                                            lineHasUnpaidInvoices ? 'error.100' : 'grey.50',
                                  },
                                  border: isCurrentlySelected ? '2px solid' :
                                         isSelected ? '1px solid' : 'none',
                                  borderColor: isCurrentlySelected ? 'primary.main' :
                                             isSelected ? 'warning.main' : 'transparent',
                                }}
                              >
                                <TableCell padding="checkbox">
                                  <Tooltip
                                    title={(() => {
                                      if (selectedAction === 'pay-advance') {
                                        return lineHasUnpaidInvoices ? "Cette ligne a des impayés, non sélectionnable pour paiement d'avance" : "";
                                      } else {
                                        return !lineHasUnpaidInvoices ? "Cette ligne n'a pas de factures impayées" : "";
                                      }
                                    })()}
                                    placement="top"
                                  >
                                    <span>
                                      <Checkbox
                                        checked={isSelected}
                                        disabled={selectedAction === 'pay-advance' ? lineHasUnpaidInvoices : !lineHasUnpaidInvoices}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          if (e.target.checked) {
                                            setSelectedLines(prev => [...prev, line.id]);
                                          } else {
                                            setSelectedLines(prev => prev.filter(id => id !== line.id));
                                          }
                                        }}
                                        size="small"
                                      />
                                    </span>
                                  </Tooltip>
                                </TableCell>

                                <TableCell
                                  onClick={() => {
                                    setCurrentSelectedLineId(line.id);
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={isCurrentlySelected ? 'bold' : 'normal'}
                                    color={isCurrentlySelected ? 'primary.main' : 'inherit'}
                                  >
                                    {line.phoneNumber || 'N/A'}
                                  </Typography>
                                  {isCurrentlySelected && (
                                    <Typography variant="caption" color="primary.main">
                                      ← Active
                                    </Typography>
                                  )}
                                </TableCell>

                                <TableCell
                                  align="center"
                                  onClick={() => setCurrentSelectedLineId(line.id)}
                                >
                                  {unpaidAmount > 0 ? (
                                    // Affichage du montant des factures impayées en rouge négatif
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="error.main"
                                    >
                                      -{unpaidAmount.toFixed(2)}€
                                    </Typography>
                                  ) : (
                                    // Affichage du solde normal
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={
                                        lineBalance > 0 ? 'success.main' :
                                        lineBalance < 0 ? 'error.main' : 'text.primary'
                                      }
                                    >
                                      {lineBalance.toFixed(2)}€
                                    </Typography>
                                  )}
                                </TableCell>

                                <TableCell
                                  align="center"
                                  onClick={() => setCurrentSelectedLineId(line.id)}
                                >
                                  {lineHasUnpaidInvoices ? (
                                    <Tooltip
                                      title={
                                        <Box sx={{ whiteSpace: 'pre-line', p: 1 }}>
                                          {(() => {
                                            const unpaidDetails = getLineUnpaidInvoicesDetails(line);
                                            const totalAmount = unpaidDetails.reduce((total, detail) => total + detail.amount, 0);

                                            return (
                                              <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                  📄 Factures impayées ({totalAmount.toFixed(2)}€)
                                                </Typography>
                                                {unpaidDetails.map((detail, index) => (
                                                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                                    • {detail.month}: {detail.amount.toFixed(2)}€
                                                  </Typography>
                                                ))}
                                              </Box>
                                            );
                                          })()}
                                        </Box>
                                      }
                                      arrow
                                      placement="top"
                                    >
                                      <Chip
                                        label="IMPAYÉ"
                                        color="error"
                                        size="small"
                                        variant="filled"
                                        sx={{ cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Chip
                                      label="À JOUR"
                                      color="success"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Chargement des lignes...
                    </Alert>
                  )}

                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Contenu principal selon l'action sélectionnée */}
          <Grid item xs={12} md={selectedAction === 'pay-advance' ? 6 : 4}>
            {selectedAction === 'overview' && (
              <Stack spacing={3}>
                {/* 🎯 SECTION ADAPTÉE - Vue d'ensemble des sélections */}
                {(() => {
                  // Calculer les informations pour les lignes sélectionnées
                  const selectedLinesData = clientOverview?.lines?.filter(line => selectedLines.includes(line.id)) || [];
                  const selectedLinesWithUnpaid = selectedLinesData.filter(hasUnpaidInvoices);
                  const selectedLinesUnpaidAmount = getSelectedLinesUnpaidInvoicesAmount();

                  // Si aucune ligne sélectionnée, afficher la ligne active
                  const displayLines = selectedLines.length > 0 ? selectedLinesData : [currentSelectedLine].filter(Boolean);
                  const calculatedDisplayAmount = selectedLines.length > 0 ? selectedLinesUnpaidAmount :
                    (realPaymentStatus === 'IMPAYÉ' ? unpaidInvoicesList.reduce((total, invoice) => total + (invoice.amount || 0), 0) : 0);

                  // 🆕 Utiliser le montant manuel si défini et valide, sinon utiliser le montant calculé
                  const manualAmountValue = manualAmount && !isNaN(parseFloat(manualAmount)) ? parseFloat(manualAmount) : null;
                  const displayAmount = manualAmountValue || calculatedDisplayAmount;

                  const hasUnpaid = selectedLines.length > 0 ? selectedLinesWithUnpaid.length > 0 : realPaymentStatus === 'IMPAYÉ';

                  return (
                    <Card sx={{
                      bgcolor: hasUnpaid ? 'error.50' : 'success.50'
                    }}>
                      <CardContent>
                        {/* En-tête adaptatif */}
                        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                          <Typography variant="h5" fontWeight="bold">
                            {selectedLines.length > 0 ? (
                              `📋 ${selectedLines.length} ligne${selectedLines.length > 1 ? 's' : ''} sélectionnée${selectedLines.length > 1 ? 's' : ''}`
                            ) : (
                              `📱 ${currentSelectedLine?.phoneNumber || 'N/A'}`
                            )}
                          </Typography>
                        </Box>

                        {/* Montant principal */}
                        <Box textAlign="center" py={2}>
                          {hasUnpaid ? (
                            <>
                              {/* Montant éditable */}
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                {isEditingAmount ? (
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="h3" color="error.main" fontWeight="bold">
                                      😟
                                    </Typography>
                                    <TextField
                                      value={manualAmount}
                                      onChange={(e) => setManualAmount(e.target.value)}
                                      onBlur={() => {
                                        if (manualAmount === '' || parseFloat(manualAmount) <= 0) {
                                          setManualAmount(calculatedDisplayAmount.toFixed(2));
                                        }
                                        setIsEditingAmount(false);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          if (manualAmount === '' || parseFloat(manualAmount) <= 0) {
                                            setManualAmount(calculatedDisplayAmount.toFixed(2));
                                          }
                                          setIsEditingAmount(false);
                                        }
                                        if (e.key === 'Escape') {
                                          setManualAmount(calculatedDisplayAmount.toFixed(2));
                                          setIsEditingAmount(false);
                                        }
                                      }}
                                      variant="standard"
                                      InputProps={{
                                        style: { fontSize: '2.125rem', fontWeight: 'bold', color: '#d32f2f', textAlign: 'center' },
                                        endAdornment: '€'
                                      }}
                                      sx={{ width: '150px' }}
                                      autoFocus
                                    />
                                  </Box>
                                ) : (
                                  <Typography
                                    variant="h3"
                                    color="error.main"
                                    fontWeight="bold"
                                    onClick={() => {
                                      setManualAmount(calculatedDisplayAmount.toFixed(2));
                                      setIsEditingAmount(true);
                                    }}
                                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'error.50' } }}
                                  >
                                    😟 {displayAmount.toFixed(2)}€
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="h6" color="text.secondary">
                                à payer
                                {selectedLines.length > 0 ? (
                                  ` (${selectedLinesWithUnpaid.length} ligne${selectedLinesWithUnpaid.length > 1 ? 's' : ''})`
                                ) : (
                                  ` (${unpaidInvoicesList.length} facture${unpaidInvoicesList.length > 1 ? 's' : ''})`
                                )}
                              </Typography>
                              {/* Indication pour l'utilisateur */}
                              <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                                Cliquez sur le montant pour le modifier
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="h3" color="success.main" fontWeight="bold">
                                ✅ LIGNE À JOUR
                              </Typography>
                              <Typography variant="h6" color="text.secondary">
                                {selectedLines.length > 0 ?
                                  `${selectedLines.length} ligne${selectedLines.length > 1 ? 's' : ''} à jour` :
                                  'Cette ligne est à jour'
                                }
                              </Typography>
                            </>
                          )}
                        </Box>

                        {/* Détail des lignes sélectionnées */}
                        {selectedLines.length > 0 && selectedLinesWithUnpaid.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                              📱 Numéros sélectionnés:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {selectedLinesWithUnpaid.map((line) => (
                                <Chip
                                  key={line.id}
                                  label={
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Typography variant="body2" fontWeight="bold" color="inherit">
                                        {line.phoneNumber}
                                      </Typography>
                                      <Typography variant="caption" color="inherit">
                                        • {getLineUnpaidAmount(line).toFixed(2)}€
                                      </Typography>
                                    </Box>
                                  }
                                  color="warning"
                                  variant="filled"
                                  size="medium"
                                  sx={{
                                    bgcolor: 'warning.main',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    '& .MuiChip-label': { px: 2, py: 1 }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Détail des mois pour ligne unique */}
                        {selectedLines.length === 0 && realPaymentStatus === 'IMPAYÉ' && unpaidInvoicesList.length > 0 && (
                          <Box mt={1} textAlign="center">
                            {unpaidInvoicesList.map((invoice, index) => (
                              <Chip
                                key={invoice.id}
                                icon={<CalendarIcon />}
                                label={invoice.paymentMonth ? new Date(invoice.paymentMonth + '-01').toLocaleDateString('fr-FR', {
                                  month: 'long',
                                  year: 'numeric'
                                }) : `Facture ${index + 1}`}
                                color="warning"
                                variant="outlined"
                                size="small"
                                sx={{ mx: 0.5, mt: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}
                  

                {/* 🎯 Note discrète si client n'a qu'une ligne */}
                {clientOverview?.lines?.length === 1 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      💡 Ce client n'a qu'une seule ligne
                    </Typography>
                  </Box>
                )}

                {/* 🎯 NOUVELLE SECTION - Boutons d'action de paiement */}
                <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom textAlign="center">
                      💳 Actions de paiement
                    </Typography>

                    <Stack spacing={2}>
                      {(() => {
                        // Calculer s'il y a des lignes sélectionnées avec impayés ou si la ligne active a des impayés
                        const selectedLinesWithUnpaid = clientOverview?.lines?.filter(line =>
                          selectedLines.includes(line.id) && hasUnpaidInvoices(line)
                        ) || [];

                        const hasSelectedUnpaid = selectedLinesWithUnpaid.length > 0;
                        const activeLineHasUnpaid = realPaymentStatus === 'IMPAYÉ';

                        // Afficher les boutons de paiement si des lignes sont sélectionnées OU si la ligne active a des impayés
                        const shouldShowPaymentButtons = hasSelectedUnpaid || (selectedLines.length === 0 && activeLineHasUnpaid);

                        return shouldShowPaymentButtons ? (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="large"
                            fullWidth
                            startIcon={<span>💵</span>}
                            onClick={() => processIndividualLinePayments('cash')}
                            disabled={processingPayments}
                            sx={{ py: 2 }}
                          >
                            <Typography variant="h6">
                              {processingPayments ? 'Traitement en cours...' : 'Paiement Espèces'}
                            </Typography>
                          </Button>

                          <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            startIcon={<PaymentIcon />}
                            onClick={() => processIndividualLinePayments('card')}
                            disabled={processingPayments}
                            sx={{ py: 2 }}
                          >
                            <Typography variant="h6">
                              {processingPayments ? 'Traitement en cours...' : 'Paiement CB'}
                            </Typography>
                          </Button>
                        </>
                        ) : (
                          <Button
                            variant="contained"
                            color="info"
                            size="large"
                            fullWidth
                            startIcon={<TrendingUpIcon />}
                            onClick={() => setSelectedAction('pay-advance')}
                            sx={{ py: 2 }}
                          >
                            <Typography variant="h6">
                              💰 Paiement d'avance
                            </Typography>
                          </Button>
                        );
                      })()}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            )}
            
            {selectedAction === 'invoices' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Factures impayées - Ligne: {currentSelectedLine?.phoneNumber}
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
                          Total à payer: {(() => {
                            const calculatedTotal = unpaidInvoicesList.reduce((sum, inv) => sum + (inv.amount || 0), 0);
                            const manualAmountValue = manualAmount && !isNaN(parseFloat(manualAmount)) ? parseFloat(manualAmount) : null;
                            const finalAmount = manualAmountValue || calculatedTotal;
                            return finalAmount.toFixed(2);
                          })()}€
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
                    📋 Toutes les factures - Ligne: {currentSelectedLine?.phoneNumber}
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
                    💰 Paiement d'avance - {currentSelectedLine?.phoneNumber}
                  </Typography>

                  
                  <Stack spacing={3}>

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

                    {/* Résumé léger */}
                    {(selectedLines.length > 0 && selectedPeriods.length > 0) && (
                      <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                        <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          💸 Total: {calculateAdvanceTotal().toFixed(2)}€
                          <Typography component="span" variant="body2" sx={{ ml: 1, fontWeight: 'normal', opacity: 0.8 }}>
                            ({selectedLines.length} ligne{selectedLines.length > 1 ? 's' : ''} × {selectedPeriods.length} mois)
                          </Typography>
                        </Typography>
                      </Box>
                    )}

                    {/* Boutons de paiement */}
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        fullWidth
                        startIcon={<span>💵</span>}
                        onClick={async () => {
                          const amount = calculateAdvanceTotal();

                          console.log(`💵 PAIEMENT AVANCE ESPECES DIRECT - Montant: ${amount}€, Lignes: ${selectedLines.length}, Périodes: ${selectedPeriods.length}`);

                          try {
                            // Créer le motif pour le paiement
                            const reason = `Paiement d'avance espèces ${amount}€ pour ${selectedLines.length} ligne(s) × ${selectedPeriods.length} mois`;

                            // Appel direct à addLineBalance
                            const balanceData = {
                              phoneId: selectedLineId,
                              clientId: clientId,
                              amount: amount,
                              reason: reason,
                              paymentMethod: 'cash'
                            };

                            console.log('📤 ENVOI addLineBalance ESPECES:', balanceData);
                            const result = await addLineBalance(balanceData).unwrap();

                            console.log('✅ SUCCES addLineBalance ESPECES:', result);

                            setSnackbar({
                              open: true,
                              message: `✅ Paiement d'avance espèces de ${amount}€ ajouté au solde de la ligne ${selectedLine?.phoneNumber} ! Nouveau solde: ${result.newBalance}€`,
                              severity: 'success'
                            });

                            // Rafraîchir les données
                            if (refetchOverview) refetchOverview();
                            if (phoneId && refetchLineData) refetchLineData();

                          } catch (error) {
                            console.error('❌ ERREUR paiement avance espèces:', error);
                            setSnackbar({
                              open: true,
                              message: `❌ Erreur lors du paiement d'avance: ${error.message || error}`,
                              severity: 'error'
                            });
                          }
                        }}
                        disabled={selectedLines.length === 0 || selectedPeriods.length === 0 || isAddingBalance}
                        sx={{ py: 2 }}
                      >
                        <Typography variant="h6">
                          {isAddingBalance ? 'Traitement...' : 'Payer en Espèces'}
                        </Typography>
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        startIcon={<PaymentIcon />}
                        onClick={async () => {
                          const amount = calculateAdvanceTotal();

                          console.log(`💳 PAIEMENT AVANCE CB DIRECT - Montant: ${amount}€, Lignes: ${selectedLines.length}, Périodes: ${selectedPeriods.length}`);

                          try {
                            // Créer le motif pour le paiement
                            const reason = `Paiement d'avance CB ${amount}€ pour ${selectedLines.length} ligne(s) × ${selectedPeriods.length} mois`;

                            // Appel direct à addLineBalance
                            const balanceData = {
                              phoneId: selectedLineId,
                              clientId: clientId,
                              amount: amount,
                              reason: reason,
                              paymentMethod: 'card'
                            };

                            console.log('📤 ENVOI addLineBalance CB:', balanceData);
                            const result = await addLineBalance(balanceData).unwrap();

                            console.log('✅ SUCCES addLineBalance CB:', result);

                            setSnackbar({
                              open: true,
                              message: `✅ Paiement d'avance CB de ${amount}€ ajouté au solde de la ligne ${selectedLine?.phoneNumber} ! Nouveau solde: ${result.newBalance}€`,
                              severity: 'success'
                            });

                            // Rafraîchir les données
                            if (refetchOverview) refetchOverview();
                            if (phoneId && refetchLineData) refetchLineData();

                          } catch (error) {
                            console.error('❌ ERREUR paiement avance CB:', error);
                            setSnackbar({
                              open: true,
                              message: `❌ Erreur lors du paiement d'avance: ${error.message || error}`,
                              severity: 'error'
                            });
                          }
                        }}
                        disabled={selectedLines.length === 0 || selectedPeriods.length === 0 || isAddingBalance}
                        sx={{ py: 2 }}
                      >
                        <Typography variant="h6">
                          {isAddingBalance ? 'Traitement...' : 'Payer en CB'}
                        </Typography>
                      </Button>
                    </Stack>

                  </Stack>
                </CardContent>
              </Card>
            )}

            {selectedAction === 'history' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Historique des paiements - {currentSelectedLine?.phoneNumber}
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

      {/* 🎉 MODAL DE CONFIRMATION DES RÉSULTATS DE PAIEMENT */}
      <Dialog
        open={showPaymentConfirmation}
        onClose={() => setShowPaymentConfirmation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircleIcon color="success" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">
                Résultats des paiements
              </Typography>
            </Box>
            <IconButton
              aria-label="fermer"
              onClick={() => setShowPaymentConfirmation(false)}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  color: 'grey.700',
                  bgcolor: 'grey.100'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Tableau des résultats */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>📱 Ligne</TableCell>
                    <TableCell>💰 Montant</TableCell>
                    <TableCell>📊 Statut</TableCell>
                    <TableCell align="center">📄 Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentResults.map((result, index) => (
                    <TableRow
                      key={result.lineId}
                      sx={{
                        bgcolor: result.success ? 'success.50' : 'error.50',
                        '&:hover': { bgcolor: result.success ? 'success.100' : 'error.100' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {result.success ? '✅' : '❌'} {result.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="bold" color={result.success ? 'success.main' : 'error.main'}>
                          {result.amount.toFixed(2)}€
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {result.success ?
                            'Paiement réussi' :
                            `Erreur: ${result.error}`
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {result.success && (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {(() => {
                              const invoiceIds = result.invoiceIds || result.result?.invoiceIds || [];
                              const hasInvoices = invoiceIds.length > 0;

                              // Si pas d'invoiceIds, bouton générique
                              if (!hasInvoices) {
                                return (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PrintIcon />}
                                    onClick={() => handlePrintPaymentReceipt(result)}
                                  >
                                    Reçu
                                  </Button>
                                );
                              }

                              const buttons = [];

                              // Bouton PDF consolidé si plusieurs factures
                              if (invoiceIds.length > 1) {
                                buttons.push(
                                  <Button
                                    key="consolidated"
                                    size="small"
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PdfIcon />}
                                    onClick={() => handlePrintConsolidatedInvoices(result)}
                                  >
                                    Toutes ({invoiceIds.length})
                                  </Button>
                                );
                              }

                              // Boutons individuels
                              if (invoiceIds.length === 1) {
                                buttons.push(
                                  <Button
                                    key="single"
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PrintIcon />}
                                    onClick={() => handlePrintSingleInvoice(invoiceIds[0], result.phoneNumber)}
                                  >
                                    Facture
                                  </Button>
                                );
                              } else {
                                invoiceIds.forEach((invoiceId, idx) => {
                                  buttons.push(
                                    <Button
                                      key={invoiceId}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<PrintIcon />}
                                      onClick={() => handlePrintSingleInvoice(invoiceId, result.phoneNumber)}
                                    >
                                      F{idx + 1}
                                    </Button>
                                  );
                                });
                              }

                              return buttons;
                            })()}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          {/* Bouton pour imprimer toutes les factures */}
          {paymentResults.filter(r => r.success && r.invoiceIds && r.invoiceIds.length > 0).length > 0 && (
            <Button
              onClick={() => {
                // 🖨️ Générer un PDF consolidé pour tous les résultats de paiement
                const allInvoiceIds = paymentResults
                  .filter(r => r.success && r.invoiceIds && r.invoiceIds.length > 0)
                  .flatMap(result => result.invoiceIds);

                if (allInvoiceIds.length > 0) {
                  // Créer un résultat fictif pour la fonction consolidée
                  const consolidatedResult = {
                    success: true,
                    invoiceIds: allInvoiceIds,
                    phoneNumber: 'multiple'
                  };
                  handlePrintConsolidatedInvoices(consolidatedResult);
                } else {
                  console.warn('Aucune facture à imprimer');
                }
              }}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PdfIcon />}
            >
              PDF Consolidé ({paymentResults.filter(r => r.success && r.invoiceIds && r.invoiceIds.length > 0).reduce((sum, r) => sum + r.invoiceIds.length, 0)} factures)
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default RealInvoiceGenerator;