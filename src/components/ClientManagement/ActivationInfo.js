import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Paper,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  Info as InfoIcon,
  PhoneAndroid as PhoneIcon,
  CheckCircle as CheckIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useGetAgenciesQuery } from '../../store/slices/agencySlice';
import { useAnalyzeIccidForSupervisorQuery, useGetAvailableSimCardsQuery, useGetValidNumbersForAgencyQuery, useActivateWithSimMutation, useProcessInvoicePaymentMutation, lineReservationsApiSlice } from '../../store/slices/lineReservationsSlice';
import { useConfirmReactivationMutation, phoneApiSlice } from '../../store/slices/linesSlice';
import { redAccountsApiSlice } from '../../store/slices/redAccountsSlice';
import { useCheckPaymentBeforeActivationMutation, useMarkPaymentReceivedMutation, useGetClientUnpaidInvoicesQuery } from '../../store/slices/linePaymentsSlice';
import { useWhoIAmQuery } from '../../store/slices/authSlice';

const ActivationInfo = ({ client }) => {
  const dispatch = useDispatch();
  const { data: currentUser } = useWhoIAmQuery();
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showAttributionDialog, setShowAttributionDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSimReplacementConfirmDialog, setShowSimReplacementConfirmDialog] = useState(false); // ✅ NOUVEAU
  const [showPassword, setShowPassword] = useState(false); // Pour masquer/afficher le mot de passe
  const [selectedSimCard, setSelectedSimCard] = useState(null);
  const [iccid, setIccid] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedManualNumber, setSelectedManualNumber] = useState(null);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  // 🆕 États pour la vérification de paiement (showPaymentDialog déjà déclaré ligne 48)
  const [paymentVerificationData, setPaymentVerificationData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [activationDataPending, setActivationDataPending] = useState(null);
  const [currentMonthInvoice, setCurrentMonthInvoice] = useState(null);

  // 🆕 États pour les messages de succès
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Détecter si l'ICCID est déjà renseigné par l'agence (CAS 1) ou pour remplacement SIM (CAS 2)
  const preFilledIccid = client?.preAssignedIccid || client?.activatedWithIccid || client?.user?.activatedWithIccid;
  const replacementIccid = client?.replacementSimIccid; // ✅ NOUVEAU: ICCID de remplacement
  const finalPreFilledIccid = replacementIccid || preFilledIccid; // Prioriser l'ICCID de remplacement
  const isPreFilledMode = client?.isPreAssigned || !!finalPreFilledIccid;

  // Debug: afficher les informations ICCID
  console.log('🔍 DEBUG ICCID - Client data:', {
    clientId: client?.id,
    preAssignedIccid: client?.preAssignedIccid,
    activatedWithIccid: client?.activatedWithIccid,
    userActivatedWithIccid: client?.user?.activatedWithIccid,
    replacementSimIccid: client?.replacementSimIccid,
    activationType: client?.activationType, // 🔑 ACTIVATIONTYPE
    replacementSimReceived: client?.replacementSimReceived, // 🔑 CLEF
    preFilledIccid,
    finalPreFilledIccid, // ✅ NOUVEAU
    isPreFilledMode,
    isReplacementCase: !!replacementIccid, // ✅ NOUVEAU
    fullClient: client // Structure complète pour debugging
  });
  
  const { data: agenciesData } = useGetAgenciesQuery();
  
  // Récupérer les cartes SIM disponibles
  const { data: simCardsData, isLoading: isLoadingSims } = useGetAvailableSimCardsQuery();

  // 🔍 DEBUG: Voir les données SIM reçues
  console.log('🃏 DEBUG simCardsData:', simCardsData);
  console.log('🃏 DEBUG simCardsData?.data:', simCardsData?.data);
  console.log('🃏 DEBUG simCardsData?.data?.sim_cards:', simCardsData?.data?.sim_cards);
  
  // Mutations pour activer la ligne
  const [activateWithSim, { isLoading: isActivating }] = useActivateWithSimMutation();
  const [confirmReactivation, { isLoading: isConfirming }] = useConfirmReactivationMutation();

  // 🆕 Mutations pour la vérification de paiement
  const [checkPaymentBeforeActivation, { isLoading: isCheckingPayment }] = useCheckPaymentBeforeActivationMutation();
  const [markPaymentReceived, { isLoading: isMarkingPayment }] = useMarkPaymentReceivedMutation();
  const [processInvoicePayment, { isLoading: isProcessingPayment }] = useProcessInvoicePaymentMutation();

  // 🔍 Récupérer les factures impayées du client pour afficher les informations réelles
  const {
    data: unpaidInvoices,
    isLoading: isLoadingInvoices,
    error: invoicesError
  } = useGetClientUnpaidInvoicesQuery(client?.user?.id || client?.client?.id, {
    skip: !client?.user?.id && !client?.client?.id
  });
  
  // Récupérer l'ID de l'agence du client
  const getClientAgencyId = () => {
    return client?.user?.agencyId || 
           client?.client?.agencyId || 
           client?.agencyId;
  };
  
  const clientAgencyId = getClientAgencyId();
  
  // Récupérer tous les numéros valides de l'agence pour autocomplete
  const { data: validNumbersData, isLoading: isLoadingNumbers } = useGetValidNumbersForAgencyQuery(
    clientAgencyId,
    { skip: !clientAgencyId }
  );
  
  // Analyse ICCID - utilise l'ICCID pré-rempli (remplacement prioritaire) ou saisi manuellement
  const iccidToAnalyze = isPreFilledMode ? finalPreFilledIccid : iccid;
  const shouldAnalyze = isPreFilledMode || (analysisTriggered && iccid && iccid.trim().length >= 8);
  
  const { data: iccidAnalysis, isLoading: isAnalyzing, error: analysisError } = useAnalyzeIccidForSupervisorQuery(
    iccidToAnalyze, 
    { 
      skip: !shouldAnalyze || !iccidToAnalyze || iccidToAnalyze.trim() === ''
    }
  );
  
  // Filtrer les cartes SIM par l'agence du client
  const getFilteredSimCards = () => {
    console.log('🃏 DEBUG getFilteredSimCards - client:', client);
    console.log('🃏 DEBUG getFilteredSimCards - simCardsData:', simCardsData);
    console.log('🃏 DEBUG getFilteredSimCards - simCardsData?.data:', simCardsData?.data);
    console.log('🃏 DEBUG getFilteredSimCards - simCardsData?.data?.simCards:', simCardsData?.data?.simCards);

    if (!client || !simCardsData?.data?.simCards) {
      console.log('🃏 DEBUG getFilteredSimCards - Early return: client or simCards missing');
      return [];
    }

    const clientAgencyId = getClientAgencyId();
    console.log('🃏 DEBUG getFilteredSimCards - clientAgencyId:', clientAgencyId);

    if (!clientAgencyId) {
      console.log('🃏 DEBUG getFilteredSimCards - No clientAgencyId, returning all available sims');
      return simCardsData.data.simCards.filter(sim => !sim.phoneId);
    }

    const filtered = simCardsData.data.simCards.filter(sim =>
      sim.agencyId === clientAgencyId && !sim.phoneId
    );
    console.log('🃏 DEBUG getFilteredSimCards - filtered result:', filtered);
    return filtered;
  };

  const filteredSimCards = getFilteredSimCards();

  // 🔍 DEBUG: Filtrage des cartes SIM
  console.log('🃏 DEBUG filtrage - clientAgencyId:', getClientAgencyId());
  console.log('🃏 DEBUG filtrage - client:', client);
  console.log('🃏 DEBUG filtrage - filteredSimCards:', filteredSimCards);
  console.log('🃏 DEBUG filtrage - filteredSimCards.length:', filteredSimCards.length);

  // Auto-sélectionner la carte SIM si ICCID pré-rempli (CAS 1) ou remplacement (CAS 2)
  useEffect(() => {
    if (isPreFilledMode && finalPreFilledIccid && filteredSimCards.length > 0) {
      // Chercher la carte SIM correspondant à l'ICCID final (remplacement ou pré-rempli)
      const matchingSimCard = filteredSimCards.find(sim => sim.iccid === finalPreFilledIccid);
      if (matchingSimCard && !selectedSimCard) {
        const caseType = replacementIccid ? 'REMPLACEMENT SIM' : 'PRÉ-REMPLI AGENCE';
        console.log(`🎯 Auto-sélection carte SIM pour ${caseType}:`, matchingSimCard.iccid);
        setSelectedSimCard(matchingSimCard);
        setIccid(finalPreFilledIccid);
        setAnalysisTriggered(true);
      }
    }
  }, [isPreFilledMode, finalPreFilledIccid, replacementIccid, filteredSimCards, selectedSimCard]);

  // 🔍 Analyser les factures pour identifier la facture du mois courant
  useEffect(() => {
    console.log('🔍 ActivationInfo - unpaidInvoices reçues:', {
      unpaidInvoices,
      isArray: Array.isArray(unpaidInvoices),
      type: typeof unpaidInvoices
    });

    if (unpaidInvoices && Array.isArray(unpaidInvoices)) {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const currentMonthInvoice = unpaidInvoices.find(invoice => {
        const invoiceMonth = new Date(invoice.createdAt).toISOString().substring(0, 7);
        return invoiceMonth === currentMonth;
      });

      setCurrentMonthInvoice(currentMonthInvoice);

      console.log('🔍 ActivationInfo - Analyse factures client:', {
        clientId: client?.id,
        totalUnpaidInvoices: unpaidInvoices.length,
        currentMonthInvoice: currentMonthInvoice ? 'EXISTE' : 'AUCUNE',
        currentMonthInvoiceData: currentMonthInvoice,
        invoices: unpaidInvoices.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          status: inv.status,
          createdAt: inv.createdAt,
          month: new Date(inv.createdAt).toISOString().substring(0, 7)
        }))
      });
    } else if (unpaidInvoices) {
      // Si unpaidInvoices n'est pas un tableau, vérifier sa structure
      console.log('⚠️ ActivationInfo - unpaidInvoices n\'est pas un tableau:', unpaidInvoices);
      setCurrentMonthInvoice(null);
    } else {
      setCurrentMonthInvoice(null);
    }
  }, [unpaidInvoices, client]);

  const handleIccidChange = (e) => {
    const newIccid = e.target.value;
    setIccid(newIccid);
    setSelectedLine('');
    
    // Auto-déclencher l'analyse si ICCID est complet (au moins 8 caractères)
    if (newIccid && newIccid.length >= 8) {
      setAnalysisTriggered(true);
      console.log('🔍 Frontend - Déclenchement analyse ICCID:', newIccid);
    } else {
      setAnalysisTriggered(false);
    }
  };

  // 🆕 Fonction utilitaire pour afficher les messages de succès
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);

    // Auto-hide après 5 secondes
    setTimeout(() => {
      setShowSuccessAlert(false);
      setSuccessMessage('');
    }, 5000);
  };

  const handleSimpleConfirmation = async () => {
    try {
      await confirmReactivation({ phoneId: client.id }).unwrap();
      console.log('✅ Réactivation confirmée avec succès');
      setShowConfirmationDialog(false);

      // 🆕 Afficher message de succès
      showSuccessMessage('✅ Réactivation confirmée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de réactivation:', error);
    }
  };

  // 🆕 Fonction pour confirmer l'activation du remplacement SIM
  const handleSimReplacementConfirmation = async () => {
    try {
      console.log('🔄 Activation remplacement SIM:', {
        phoneId: client.id,
        iccid: client.replacementSimIccid,
        clientId: client?.user?.id || client?.client?.id
      });

      await activateWithSim({
        phoneId: client.id,
        iccid: client.replacementSimIccid,
        clientId: client?.user?.id || client?.client?.id
      }).unwrap();

      console.log('✅ Remplacement SIM activé avec succès');

      // Invalider les caches pour mise à jour
      dispatch(lineReservationsApiSlice.util.invalidateTags([
        { type: 'Phone', id: client.id },
        { type: 'Phone', id: 'LIST' },
        'Phone'
      ]));

      setShowSimReplacementConfirmDialog(false);

      // 🆕 Afficher message de succès
      showSuccessMessage('✅ Remplacement SIM activé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'activation du remplacement SIM:', error);
    }
  };

  // 💳 Fonction spécifique pour les agences : Facturation seulement (pas d'activation)
  const handleCheckPaymentForAgency = async () => {
    try {
      // ✅ CORRECTION: Utiliser l'ID de la ligne (phoneId) pas l'ID utilisateur
      const phoneId = client?.id; // ID de la ligne/téléphone
      const clientUserId = client?.user?.id || client?.client?.id; // ID de l'utilisateur

      console.log('💳 Agence - Vérification paiements:', {
        phoneId,
        clientUserId,
        clientData: client
      });

      // Vérifier les paiements requis avec l'ID de la ligne ET du client
      const paymentCheck = await checkPaymentBeforeActivation({ 
        phoneId, 
        clientId: clientUserId 
      }).unwrap();

      console.log('💳 Agence - Résultat vérification paiement:', paymentCheck);

      // Ouvrir directement le modal de paiement avec les données
      setPaymentVerificationData(paymentCheck);
      // Extraire le montant depuis la structure data de la réponse
      const amountDue = paymentCheck.data?.totalAmountDue || paymentCheck.data?.currentMonthInvoice?.amount || paymentCheck.totalAmountDue || 0;
      console.log('💰 Montant extrait pour le modal:', {
        totalAmountDue: paymentCheck.data?.totalAmountDue,
        invoiceAmount: paymentCheck.data?.currentMonthInvoice?.amount,
        fallbackAmount: paymentCheck.totalAmountDue,
        finalAmount: amountDue
      });
      setPaymentAmount(amountDue.toString());
      setActivationDataPending({
        phoneId: phoneId,
        clientId: clientUserId,
        // Pas d'ICCID pour les agences (facturation seulement)
      });
      setShowPaymentDialog(true);

    } catch (error) {
      console.error('❌ Agence - Erreur lors de la vérification de paiement:', error);
    }
  };

  // 🆕 Nouvelle fonction pour vérifier les paiements avant activation
  const handleCheckPaymentAndActivate = async () => {
    const finalIccid = isPreFilledMode ? preFilledIccid : iccid;

    if (!selectedManualNumber && (!finalIccid || !selectedLine)) return;

    try {
      // Détermine le phoneId à partir de la sélection
      let phoneIdToActivate;

      if (selectedManualNumber) {
        phoneIdToActivate = selectedManualNumber.id;
      } else if (selectedLine) {
        phoneIdToActivate = selectedLine;
      }

      if (!phoneIdToActivate) {
        console.error('Impossible d\'identifier le phoneId pour l\'activation');
        return;
      }

      // 🔍 Étape 1: Vérifier les paiements requis
      console.log('🔍 Vérification paiements avant activation pour phoneId:', phoneIdToActivate);
      const paymentCheck = await checkPaymentBeforeActivation({ 
        phoneId: phoneIdToActivate,
        clientId: client?.user?.id || client?.id 
      }).unwrap();

      console.log('💳 Résultat vérification paiement:', paymentCheck);

      if (paymentCheck.requiresPayment) {
        // Si paiement requis, ouvrir le modal de paiement
        setPaymentVerificationData(paymentCheck);
        setPaymentAmount(paymentCheck.totalAmountDue?.toString() || '0');
        setActivationDataPending({
          phoneId: phoneIdToActivate,
          iccid: finalIccid,
          clientId: client?.user?.id || client?.id
        });
        setShowActivationDialog(false);
        setShowPaymentDialog(true);
      } else {
        // Pas de paiement requis, activer directement
        await performActivation({
          phoneId: phoneIdToActivate,
          iccid: finalIccid,
          clientId: client?.user?.id || client?.id
        });
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de paiement:', error);
    }
  };

  // 💰 Gérer la confirmation de paiement (MODIFIÉ pour séparer Agence/Superviseur)
  const handlePaymentConfirmation = async () => {
    if (!activationDataPending || !selectedPaymentMethod || !paymentAmount) return;

    try {
      // Traiter le paiement de la facture générée
      const invoiceId = paymentVerificationData?.data?.currentMonthInvoice?.id;

      await processInvoicePayment({
        phoneId: activationDataPending.phoneId,
        paymentMethod: selectedPaymentMethod,
        paymentAmount: parseFloat(paymentAmount),
        invoiceId: invoiceId,
        iccid: iccid // Passer l'ICCID sélectionné
      }).unwrap();

      console.log('✅ Paiement marqué comme reçu');

      // ✅ LOGIQUE SÉPARÉE PAR RÔLE
      if (isSupervisor) {
        // SUPERVISEUR : Paiement + Activation directe
        await performActivation(activationDataPending);
        console.log('✅ Superviseur: Paiement + Activation effectués');
        // Le message de succès sera affiché par performActivation()
      } else if (isAgency) {
        // AGENCE : Paiement seulement, pas d'activation
        console.log('✅ Agence: Paiement effectué - Ligne prête pour activation superviseur');

        // 🆕 Afficher message de succès pour l'agence
        showSuccessMessage('✅ Paiement enregistré avec succès !');

        // Invalider les caches pour rafraîchir l'affichage
        dispatch(lineReservationsApiSlice.util.invalidateTags([
          { type: 'LineReservation', id: 'RESERVED' },
          { type: 'LineReservation', id: 'AVAILABLE' },
          { type: 'Phone', id: activationDataPending.phoneId },
          { type: 'Phone', id: 'LIST' },
          { type: 'Client', id: activationDataPending.clientId },
          { type: 'Client', id: 'LIST' },
          'LineReservation',
          'Phone',
          'Client'
        ]));

        // Invalider aussi le cache du phoneApiSlice pour les listes d'onglets
        dispatch(phoneApiSlice.util.invalidateTags([
          { type: 'Phone', id: activationDataPending.phoneId },
          { type: 'Phone', id: 'LIST' },
          'Phone'
        ]));

        console.log('🗑️ Caches invalidés après paiement - Les onglets vont se rafraîchir');
      }

      // Fermer le modal de paiement
      setShowPaymentDialog(false);
      setPaymentVerificationData(null);
      setActivationDataPending(null);
      setSelectedPaymentMethod('');
      setPaymentAmount('');

    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de paiement:', error);
    }
  };

  // 🚀 Fonction d'activation réelle (factorisation du code existant)
  const performActivation = async (activationData) => {
    try {
      const { phoneId, iccid, clientId } = activationData;

      // Appel de l'API d'activation
      await activateWithSim({
        phoneId,
        iccid,
        clientId
      }).unwrap();

      console.log('✅ Activation réussie pour:', {
        phoneId,
        iccid,
        client: client?.user?.firstname + ' ' + client?.user?.lastname
      });

      // Invalider tous les caches pertinents pour mise à jour immédiate
      dispatch(lineReservationsApiSlice.util.invalidateTags([
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'Phone', id: phoneId },
        { type: 'Phone', id: 'LIST' },
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
        { type: 'SimCard', id: 'LIST' },
        'LineReservation',
        'Phone',
        'Client'
      ]));

      // Invalider aussi les comptes RED
      dispatch(redAccountsApiSlice.util.invalidateTags([
        { type: 'RedAccount', id: 'LIST' },
        'RedAccount'
      ]));

      // ✅ CRUCIAL : Invalider aussi le phoneApiSlice pour les onglets
      dispatch(phoneApiSlice.util.invalidateTags([
        { type: 'Phone', id: phoneId },
        { type: 'Phone', id: 'LIST' },
        { type: 'Phone', id: 'ACTIVATE' },
        { type: 'Phone', id: 'RESERVED' },
        { type: 'Phone', id: 'AVAILABLE' },
        'Phone'
      ]));

      console.log('✅ Cache invalidé après activation (tous les slices)');

      // Fermer le dialog après succès
      handleCloseDialog();

      // 🆕 Afficher message de succès
      showSuccessMessage('✅ Ligne activée avec succès !');

    } catch (error) {
      console.error('❌ Erreur lors de l\'activation:', error);
    }
  };

  // 🔄 Legacy function pour compatibilité (sera supprimée plus tard)
  const handleActivationConfirm = handleCheckPaymentAndActivate;
  
  const handleCloseDialog = () => {
    setShowActivationDialog(false);
    setShowAttributionDialog(false);
    setSelectedSimCard(null);
    setIccid('');
    setSelectedLine('');
    setSelectedManualNumber(null);
    setAnalysisTriggered(false);
  };
  
  // S'assurer que l'ICCID est nettoyé quand le dialogue se ferme
  const resetAnalysisState = () => {
    setIccid('');
    setAnalysisTriggered(false);
    setSelectedLine('');
    setSelectedManualNumber(null);
  };

  // 🔧 Fonctions utilitaires pour affichage des factures
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour formater l'ICCID avec des espaces (xxxx xxxx xxxx xxxx xxxx)
  const formatICCID = (iccid) => {
    if (!iccid) return '';
    return iccid.replace(/(.{4})/g, '$1 ').trim();
  };

  // ✅ FONCTION IDENTIQUE À ActivateTab pour éviter les incohérences
  const canBeActivated = (client) => {
    console.log('🔍 DEBUG ActivationInfo canBeActivated:', {
      clientId: client?.id,
      agenciesData: !!agenciesData,
      isArray: Array.isArray(agenciesData),
      clientData: {
        userAgencyId: client?.user?.agencyId,
        clientAgencyId: client?.client?.agencyId,
        directAgencyId: client?.agencyId,
        agencyFromObject: client?.agency?.id
      }
    });

    if (!agenciesData || !Array.isArray(agenciesData)) {
      console.log('❌ ActivationInfo canBeActivated - agenciesData pas un array:', {
        hasData: !!agenciesData,
        isArray: Array.isArray(agenciesData),
        type: typeof agenciesData,
        keys: agenciesData ? Object.keys(agenciesData) : null
      });
      return false;
    }

    // ✅ CORRECTION: Essayer toutes les sources possibles d'agencyId
    const clientAgencyId = client?.user?.agencyId ||
                          client?.agency?.id ||
                          client?.client?.agencyId ||
                          client?.agencyId;

    console.log('🔍 ActivationInfo ClientAgencyId résolu:', {
      from: 'user.agencyId',
      value: client?.user?.agencyId,
      final: clientAgencyId
    });

    if (!clientAgencyId) {
      console.log('❌ ActivationInfo canBeActivated - Pas de clientAgencyId après toutes tentatives');
      return false;
    }

    const agency = agenciesData.find(a => a.id === clientAgencyId);
    if (!agency || !agency.simCards) {
      console.log('❌ ActivationInfo canBeActivated - Agency ou simCards manquants:', {
        agencyFound: !!agency,
        hasSimCards: agency?.simCards ? true : false,
        clientAgencyId,
        availableAgencies: agenciesData.map(a => ({ id: a.id, name: a.name, hasSimCards: !!a.simCards }))
      });
      return false;
    }

    const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');

    console.log('🔍 ActivationInfo résultat:', {
      clientId: client?.id,
      agencyId: clientAgencyId,
      totalSims: agency.simCards.length,
      availableSims: availableSims.length,
      result: availableSims.length > 0
    });

    return availableSims.length > 0;
  };

  const hasUnpaidInvoices = client?.paymentStatus === 'EN RETARD' ||
                           client?.paymentStatus === 'OVERDUE' ||
                           client?.paymentStatus === 'PENDING_PAYMENT' ||
                           client?.paymentStatus === 'NEEDS_PAYMENT';

  const hasReservation = client?.user?.hasActiveReservation ||
                        client?.user?.reservationStatus === 'RESERVED' ||
                        client?.hasActiveReservation ||
                        client?.reservationStatus === 'RESERVED';

  const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
  const simAvailable = canBeActivated(client);

  // ✅ LOGIQUE SIMPLIFIÉE : Utiliser directement la réponse de l'API phones
  // ✅ NOUVELLE LOGIQUE BASÉE SUR LES PROPRIÉTÉS API SIMPLIFIÉES
  const canActivateNow = client?.canActivateNow === true;
  const needsPaymentFirst = client?.needsPaymentFirst === true;
  const waitingForSim = client?.waitingForSim === true;
  const lineClassification = client?.lineClassification;

  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  const isAgency = currentUser?.role === 'AGENCY';

  // Garder la logique de vérification de paiement pour compatibilité
  const needsPayment = paymentVerificationData?.paymentRequired !== undefined ?
    paymentVerificationData.paymentRequired :
    needsPaymentFirst;

  // 🔍 DEBUG TEMPORAIRE pour comprendre pourquoi le bouton de paiement n'apparaît pas
  console.log('🔍 ActivationInfo - État du bouton de paiement:', {
    hasClient: !!client,
    clientId: client?.id,
    isSupervisor,
    isAgency,
    needsActivation,
    hasReservation,
    simAvailable,
    needsPayment,
    hasUnpaidInvoices,
    paymentStatus: client?.paymentStatus,
    phoneStatus: client?.phoneStatus,
    currentMonthInvoice: currentMonthInvoice ? 'EXISTE' : 'AUCUNE',
    unpaidInvoicesLength: unpaidInvoices && Array.isArray(unpaidInvoices) ? unpaidInvoices.length : 'NOT_ARRAY',
    // Détail de la logique de needsPayment
    needsPaymentBreakdown: {
      hasUnpaidInvoices,
      noPaymentStatusButHasReservationOrActivation: !client?.paymentStatus && (hasReservation || needsActivation),
      statusNotPaid: client?.paymentStatus !== 'À JOUR' && client?.paymentStatus !== 'PAID',
      noCurrentMonthInvoiceButNeedsActivation: !currentMonthInvoice && (hasReservation || needsActivation),
      finalNeedsPayment: needsPayment
    },
    // Condition finale du bouton pour Agence
    agencyButtonCondition: isAgency && (needsActivation || hasReservation) && simAvailable && needsPayment
  });

  // Logique du bouton
  // ✅ NOUVELLE LOGIQUE BASÉE SUR LES PROPRIÉTÉS API ET RÔLES
  let buttonConfig = {
    show: false,
    text: '',
    color: 'primary',
    icon: <InfoIcon />,
    onClick: () => {}
  };

  if (isSupervisor) {
    // ✅ SUPERVISEUR : Actions selon l'état de la ligne
    if (canActivateNow) {
      // Ligne prête à activer maintenant
      buttonConfig = {
        show: true,
        text: '📞 Attribuer une ligne',
        color: 'success',
        icon: <CheckIcon />,
        onClick: () => setShowActivationDialog(true)
      };
    } else if (needsPaymentFirst) {
      // Ligne nécessite un paiement d'abord (superviseur peut voir l'état mais pas agir)
      buttonConfig = {
        show: true,
        text: '💳 Paiement requis par l\'agence',
        color: 'warning',
        icon: <WarningIcon />,
        onClick: () => {} // Pas d'action, juste informatif
      };
    } else if (waitingForSim) {
      // En attente de SIM
      buttonConfig = {
        show: true,
        text: '📦 En attente de cartes SIM',
        color: 'info',
        icon: <WarningIcon />,
        onClick: () => {} // Pas d'action, juste informatif
      };
    }
  } else if (isAgency) {
    // ✅ AGENCE : Actions selon l'état de la ligne
    if (needsPaymentFirst) {
      // Agence doit encaisser le client d'abord
      buttonConfig = {
        show: true,
        text: '💳 Encaisser le client + Assigner ICCID',
        color: 'warning',
        icon: <PaymentIcon />,
        onClick: () => {
          handleCheckPaymentForAgency();
        }
      };
    } else if (canActivateNow) {
      // Ligne prête, agence attend le superviseur
      buttonConfig = {
        show: true,
        text: '✅ Paiement effectué - En attente superviseur',
        color: 'success',
        icon: <CheckIcon />,
        onClick: () => {} // Pas d'action
      };
    } else if (waitingForSim) {
      // Pas de SIM disponible
      buttonConfig = {
        show: false // Ne rien afficher
      };
    }
  }

  if (!client) {
    return (
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6">
              Informations d'activation
            </Typography>
          </Box>
          <Alert severity="info">
            Aucune information client disponible
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 🔄 Pour les réactivations après pause temporaire, afficher seulement la section spécialisée
  const isReactivationAfterPause = client?.activationType === 'REACTIVATION_AFTER_PAUSE' && client?.phoneStatus === 'PAUSED';

  if (isReactivationAfterPause && isSupervisor) {
    return (
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          {/* 🆕 Section spéciale pour les réactivations après pause temporaire */}
          <Paper sx={{ p: 2, bgcolor: 'info.lighter', border: '2px solid', borderColor: 'info.main', mb: 2 }}>
            <Typography variant="subtitle2" color="info.main" fontWeight="bold" gutterBottom>
              🔄 Réactivation après pause temporaire
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Type d'opération :
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="info.main">
                  📞 Remise en service de la ligne
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Action requise :
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  Réactiver la ligne sur le compte RED puis confirmer l'opération
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Compte RED :
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  🏢 {client.redAccount?.accountName || client.redAccountName || 'Compte RED'}
                </Typography>
              </Box>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Important :</strong> Vérifiez que la ligne est bien réactivée sur le compte RED avant de confirmer.
                </Typography>
              </Alert>

              <Box sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<CheckIcon />}
                  onClick={() => handleSimpleConfirmation()}
                  sx={{ fontWeight: 'bold' }}
                >
                  ✅ Confirmer la réactivation
                </Button>
              </Box>
            </Stack>
          </Paper>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 350 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">
            Informations d'activation
          </Typography>
        </Box>

        {/* 🆕 Message de succès */}
        {showSuccessAlert && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              {successMessage}
            </Typography>
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Informations de base - MASQUÉES pour simplifier l'affichage */}
          
          {/* 🆕 Informations sur le type d'activation et la raison - MASQUÉ pour les remplacements SIM */}
          {(client?.activationType || client?.reactivationReason) && client?.activationType !== 'SIM_REPLACEMENT' && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type d'activation
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    client?.activationType === 'NEW_ACTIVATION' ? 'Nouvelle activation' :
                    client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Réactivation (Pause)' :
                    client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Réactivation (Impayé)' :
                    client?.activationType === 'REACTIVATION' ? 'Réactivation' :
                    client?.activationType === 'SIM_REPLACEMENT' ? 'Remplacement SIM' :
                    'Activation'
                  }
                  size="small"
                  color={
                    client?.activationType === 'NEW_ACTIVATION' ? 'success' :
                    client?.activationType === 'SIM_REPLACEMENT' ? 'warning' :
                    'info'
                  }
                />
              </Stack>
              {client?.reactivationReason && (
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {client.reactivationReason}
                </Typography>
              )}
            </Box>
          )}
          
          {/* Compte RED rattaché - MASQUÉ pour les remplacements SIM */}
          {(client?.redAccountId || client?.lineRequest?.redAccountId) && client?.activationType !== 'SIM_REPLACEMENT' && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Compte RED rattaché
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                🏢 {client?.redAccountName || client?.redAccount?.accountName || client?.lineRequest?.redAccount?.accountName ||
                     `Compte ${client?.redAccountId || client?.lineRequest?.redAccountId}`}
              </Typography>
            </Box>
          )}

          {/* 🆕 Section Informations de Paiement avec données réelles - MASQUÉE pour les remplacements SIM */}
          {client?.activationType !== 'SIM_REPLACEMENT' && (
            <>
              <Divider />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PaymentIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    Informations de Paiement
                  </Typography>
                </Box>

            <Stack spacing={2}>
              {/* Statut de paiement */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Statut de paiement :</Typography>
                <Chip
                  label={client?.paymentStatus || 'Non défini'}
                  size="small"
                  color={
                    client?.paymentStatus === 'À JOUR' || client?.paymentStatus === 'PAID' ? 'success' :
                    client?.paymentStatus === 'EN RETARD' || client?.paymentStatus === 'OVERDUE' ? 'error' :
                    client?.paymentStatus === 'PENDING_PAYMENT' ? 'warning' : 'default'
                  }
                />
              </Box>

              {/* 📋 Informations détaillées de facture du mois courant */}
              {isLoadingInvoices && (
                <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Chargement des informations de facture...</Typography>
                </Alert>
              )}

              {invoicesError && (
                <Alert severity="error">
                  <Typography variant="body2">
                    ❌ Erreur lors du chargement des factures
                  </Typography>
                </Alert>
              )}

              {/* Affichage de la facture du mois courant SI elle existe */}
              {currentMonthInvoice && (
                <Paper sx={{ p: 2, bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.main' }}>
                  <Typography variant="subtitle2" color="warning.main" fontWeight="bold" gutterBottom>
                    📅 Facture du mois courant ({new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})
                  </Typography>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Montant :</Typography>
                      <Typography variant="body1" fontWeight="bold" color="warning.main">
                        {formatCurrency(currentMonthInvoice.amount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Date de création :</Typography>
                      <Typography variant="body2">
                        {formatDate(currentMonthInvoice.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Statut :</Typography>
                      <Chip
                        label={currentMonthInvoice.status}
                        size="small"
                        color={
                          currentMonthInvoice.status === 'PAID' || currentMonthInvoice.status === 'À JOUR' ? 'success' :
                          currentMonthInvoice.status === 'PENDING' || currentMonthInvoice.status === 'EN ATTENTE' ? 'warning' :
                          'error'
                        }
                      />
                    </Box>

                    {currentMonthInvoice.description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Description : {currentMonthInvoice.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}


              {/* Informations sur les autres factures impayées */}
              {unpaidInvoices && Array.isArray(unpaidInvoices) && unpaidInvoices.length > 1 && (
                <Alert severity="warning">
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    ⚠️ Autres factures impayées : {unpaidInvoices.length - (currentMonthInvoice ? 1 : 0)} facture(s)
                  </Typography>
                  <Typography variant="body2">
                    Montant total des arriérés : {formatCurrency(
                      unpaidInvoices
                        .filter(inv => inv.id !== currentMonthInvoice?.id)
                        .reduce((sum, inv) => sum + (inv.amount || 0), 0)
                    )}
                  </Typography>
                </Alert>
              )}

            </Stack>
              </Box>
            </>
          )}

          {/* 🔄 Section spéciale pour les remplacements SIM en attente de réception */}
          {client?.activationType === 'SIM_REPLACEMENT' && client?.replacementSimReceived === false && (
            <Paper sx={{ p: 2, bgcolor: 'warning.lighter', border: '2px solid', borderColor: 'warning.main', mb: 2 }}>
              <Typography variant="subtitle2" color="warning.main" fontWeight="bold" gutterBottom>
                ⏳ Remplacement SIM - En attente de réception
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Statut de la commande :
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="warning.main">
                    📦 SIM commandée - En attente de livraison
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Actions effectuées :
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {client?.supervisorConfirmedRedBlocking && (
                      <Chip label="✅ Blocage RED confirmé" size="small" color="success" variant="outlined" />
                    )}
                    {client?.supervisorConfirmedSimOrder && (
                      <Chip label="✅ Commande SIM confirmée" size="small" color="success" variant="outlined" />
                    )}
                  </Stack>
                </Box>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Étape suivante :</strong> Déclarer la réception de la nouvelle carte SIM une fois qu'elle sera livrée à l'agence.
                  </Typography>
                </Alert>
              </Stack>
            </Paper>
          )}


          {/* 🆕 Section spéciale pour les remplacements SIM avec ICCID reçu */}
          {client?.replacementSimIccid && client?.replacementSimReceived && isSupervisor && (
            <Paper sx={{ p: 2, bgcolor: 'success.lighter', border: '2px solid', borderColor: 'success.main', mb: 2 }}>
              <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                🔄 Remplacement SIM - Prêt à activer
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    SIM de remplacement reçue :
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    📱 {client.replacementSimIccid}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Numéro à activer :
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    📞 {client?.phoneNumber}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Compte RED rattaché :
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    🏢 {client?.redAccountName || client?.redAccount?.accountName || `Compte ${client?.redAccountId}`}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => setShowSimReplacementConfirmDialog(true)}
                  fullWidth
                  size="large"
                >
                  ✅ Confirmer l'activation SIM de remplacement
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Bouton d'action conditionnel - MASQUÉ pour les remplacements SIM */}
          {buttonConfig.show && !client?.replacementSimIccid && (
            <Button
              variant="contained"
              color={buttonConfig.color}
              startIcon={buttonConfig.icon}
              onClick={buttonConfig.onClick}
              fullWidth
            >
              {buttonConfig.text}
            </Button>
          )}

          {/* ✅ NOUVEAUX MESSAGES BASÉS SUR LES PROPRIÉTÉS API - MASQUÉS pour les remplacements SIM */}
          {!buttonConfig.show && !client?.replacementSimIccid && (
            <Alert severity={
              canActivateNow ? 'success' :
              needsPaymentFirst ? 'warning' :
              waitingForSim ? 'info' : 'info'
            }>
              <Typography variant="body2">
                {waitingForSim ? (
                  '⏳ En attente de cartes SIM dans votre agence'
                ) : needsPaymentFirst && isAgency ? (
                  '💳 Veuillez encaisser le client pour le mois en cours'
                ) : canActivateNow && isAgency ? (
                  <>
                    ✅ Paiement effectué - En attente d'activation par le superviseur
                    {finalPreFilledIccid && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          📱 SIM assignée: {finalPreFilledIccid}
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  `⏳ État: ${lineClassification || 'En cours d\'analyse'}`
                )}
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
      
      {/* Dialog d'activation avec analyse ICCID */}
      <Dialog
        open={showActivationDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {client?.activationType === 'NEW_ACTIVATION' ? (
              <PhoneIcon color="primary" />
            ) : (
              <CheckIcon color="success" />
            )}
            {client?.activationType === 'NEW_ACTIVATION'
              ? (needsPayment
                  ? `Activation superviseur - ${client?.user?.firstname} ${client?.user?.lastname}`
                  : `Attribution SIM - ${client?.user?.firstname} ${client?.user?.lastname}`)
              : `Confirmer activation RED - ${client?.user?.firstname} ${client?.user?.lastname}`
            }
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            
            {/* ✅ CAS CONFIRMATION : Réactivation après pause/impayé */}
            {client?.activationType !== 'NEW_ACTIVATION' ? (
              <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ Confirmation d'activation sur RED
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cette ligne nécessite uniquement une confirmation que l'activation a été effectuée sur le compte RED.
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Ligne :</strong> {client?.phoneNumber}<br />
                    <strong>Type :</strong> {
                      client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Retour après pause temporaire' :
                      client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Retour après règlement impayé' :
                      'Réactivation'
                    }<br />
                    <strong>Raison :</strong> {client?.reactivationReason}
                  </Typography>
                </Alert>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Avez-vous activé cette ligne sur le compte RED ?</strong>
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  En confirmant, le statut de la ligne passera à "ACTIVE" dans le système.
                </Typography>
              </Paper>
            ) : (
              /* 🔧 CAS NOUVELLE ACTIVATION : Workflow complet avec ICCID */
              !isPreFilledMode && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <>
                  <Typography variant="subtitle2" gutterBottom>
                    📱 Étape 1: Sélectionner une carte SIM en stock
                  </Typography>
                  
                  {isLoadingSims ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Chargement des cartes SIM...</Typography>
                    </Box>
                  ) : simCardsData?.data ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Pour cette agence (ID: {clientAgencyId}): {filteredSimCards.length} disponible(s)
                      </Typography>
                      
                      {filteredSimCards.length === 0 ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          Aucune carte SIM disponible pour cette agence. 
                          Vérifiez que l'agence a bien des cartes en stock.
                        </Alert>
                      ) : (
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={filteredSimCards}
                          getOptionLabel={(option) => option.iccid}
                          value={selectedSimCard}
                          onChange={(event, newValue) => {
                            setSelectedSimCard(newValue);
                            if (newValue && newValue.iccid && newValue.iccid.trim().length > 0) {
                              setIccid(newValue.iccid);
                              setSelectedManualNumber(null);
                              handleIccidChange({ target: { value: newValue.iccid } });
                            } else {
                              resetAnalysisState();
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Choisir une carte SIM..."
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                            <Box component="li" key={key} {...otherProps}>
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {option.iccid}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.agencyName} - {option.isAlreadyInUse ? '⚠️ Déjà utilisé' : '✅ Disponible'}
                                </Typography>
                              </Box>
                            </Box>
                            );
                          }}
                          noOptionsText="Aucune carte SIM trouvée"
                        />
                      )}
                      
                      {/* Indication analyse automatique */}
                      {selectedSimCard && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <AlertTitle>Analyse automatique déclenchée</AlertTitle>
                          L'ICCID sélectionné est analysé automatiquement pour identifier l'agence et proposer des lignes.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="error">
                      Impossible de charger les cartes SIM disponibles.
                    </Alert>
                  )}
                  </>
                </Paper>
              )
            )}
            
            {/* Interface simplifiée */}
            {iccidAnalysis && iccidAnalysis.potentialMatches && iccidAnalysis.potentialMatches.length > 0 && (
              <Box>
                {(() => {
                  const redAccount = iccidAnalysis.potentialMatches[0].redAccount;
                  const linesAwaitingActivation = iccidAnalysis.potentialMatches[0].linesAwaitingActivation;

                  return (
                    <>
                      {/* ICCID */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">ICCID:</Typography>
                        <Typography variant="h6" fontWeight="bold">{formatICCID(iccid || finalPreFilledIccid)}</Typography>
                      </Box>

                      {/* Identifiants RED */}
                      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Compte RED:</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          {redAccount?.login && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Login: <strong>{redAccount?.login}</strong>
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => navigator.clipboard.writeText(redAccount?.login)}
                                sx={{ minWidth: 'auto', px: 1, py: 0 }}
                              >
                                📋
                              </Button>
                            </Box>
                          )}

                          {redAccount?.password && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Mot de passe: <strong>{showPassword ? redAccount?.password : '••••••••'}</strong>
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => setShowPassword(!showPassword)}
                                sx={{ minWidth: 'auto', px: 1, py: 0 }}
                              >
                                {showPassword ? '🙈' : '👁️'}
                              </Button>
                              <Button
                                size="small"
                                onClick={() => navigator.clipboard.writeText(redAccount?.password)}
                                sx={{ minWidth: 'auto', px: 1, py: 0 }}
                              >
                                📋
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Sélection de numéro */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Numéro à attribuer:
                        </Typography>

                        {/* Saisie avec autocomplete */}
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={iccidAnalysis?.availableForManualSelection || []}
                          getOptionLabel={(option) => option.phoneNumber}
                          value={selectedManualNumber}
                          onChange={(event, newValue) => {
                            setSelectedManualNumber(newValue);
                            if (newValue) {
                              setSelectedLine('');
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Saisissez ou sélectionnez un numéro"
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Typography variant="body2" fontWeight="bold">
                                {option.phoneNumber}
                              </Typography>
                            </Box>
                          )}
                          noOptionsText="Aucun numéro trouvé"
                        />
                      </Box>
                    </>
                  );
                })()}
              </Box>
            )}
            
            
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleActivationConfirm}
            disabled={isActivating || (client?.activationType === 'NEW_ACTIVATION' && (!selectedManualNumber && (!iccid || !selectedLine)))}
            startIcon={isActivating ? <CircularProgress size={20} /> : <CheckIcon />}
            color={client?.activationType === 'NEW_ACTIVATION' ? "primary" : "success"}
          >
            {isActivating ?
              (client?.activationType === 'NEW_ACTIVATION' ?
                (needsPayment ? 'Activation en cours...' : 'Attribution SIM en cours...') :
                'Confirmation en cours...') :
              (client?.activationType === 'NEW_ACTIVATION' ?
                (needsPayment ? 'Activer la ligne' : 'Attribuer la SIM') :
                'Confirmer activation sur RED')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Dialog simple pour confirmations de réactivation */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color="success" />
            Confirmer activation sur RED
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}<br />
                <strong>Ligne :</strong> {client?.phoneNumber}<br />
                <strong>Type :</strong> {
                  client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Retour après pause temporaire' :
                  client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Retour après règlement impayé' :
                  'Réactivation'
                }<br />
                {client?.reactivationReason && (
                  <>
                    <strong>Raison :</strong> {client.reactivationReason}
                  </>
                )}
              </Typography>
            </Alert>

            <Typography variant="h6" sx={{ textAlign: 'center', color: 'success.main' }}>
              Avez-vous activé cette ligne sur le compte RED ?
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              En confirmant, le statut de la ligne passera à "ACTIVE" dans le système.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSimpleConfirmation}
            disabled={isConfirming}
            startIcon={isConfirming ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {isConfirming ? 'Confirmation...' : 'Oui, confirmer l\'activation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Modal d'attribution simple pour lignes prêtes à activer */}
      <Dialog
        open={showAttributionDialog}
        onClose={() => setShowAttributionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon color="primary" />
            Attribution SIM - {client?.user?.firstname} {client?.user?.lastname}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="success">
              <Typography variant="body2">
                ✅ Ligne payée et prête pour attribution SIM
              </Typography>
            </Alert>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}<br />
                <strong>Email :</strong> {client?.user?.email}<br />
                <strong>Ligne :</strong> {client?.phoneNumber}<br />
                <strong>Statut :</strong> Paiement vérifié ✅
              </Typography>
            </Box>

            {/* Affichage ICCID assigné si disponible */}
            {preFilledIccid && (
              <Alert severity="info">
                <Typography variant="body2" fontWeight="bold">
                  📱 SIM déjà assignée: {preFilledIccid}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Cette ligne a déjà été assignée à une carte SIM lors du paiement.
                </Typography>
              </Alert>
            )}

            {/* Sélection SIM si pas encore assignée */}
            {!preFilledIccid && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  📱 Sélectionner une carte SIM en stock
                </Typography>

                {isLoadingSims ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Chargement des cartes SIM...</Typography>
                  </Box>
                ) : filteredSimCards.length === 0 ? (
                  <Alert severity="warning">
                    Aucune carte SIM disponible pour cette agence.
                  </Alert>
                ) : (
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={filteredSimCards}
                    getOptionLabel={(option) => option.iccid}
                    value={selectedSimCard}
                    onChange={(event, newValue) => {
                      setSelectedSimCard(newValue);
                      setIccid(newValue?.iccid || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sélectionner une carte SIM"
                        variant="outlined"
                      />
                    )}
                  />
                )}
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowAttributionDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleActivationConfirm}
            disabled={isActivating || (!preFilledIccid && !selectedSimCard)}
            startIcon={isActivating ? <CircularProgress size={20} /> : <PhoneIcon />}
          >
            {isActivating ? 'Attribution en cours...' : 'Attribuer la SIM'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Modal de vérification et paiement */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            Vérification de paiement avant activation
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>

            {/* Informations client */}
            <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
              <Typography variant="h6" gutterBottom>
                👤 Client: {client?.user?.firstname} {client?.user?.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {client?.user?.email}
              </Typography>
            </Paper>

            {/* Résultats de la vérification */}
            {paymentVerificationData && (
              <>
                {/* Factures impayées */}
                {paymentVerificationData.unpaidInvoices?.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>⚠️ Factures impayées détectées</AlertTitle>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Ce client a {paymentVerificationData.unpaidInvoices.length} facture(s) impayée(s) :
                    </Typography>
                    {paymentVerificationData.unpaidInvoices.map((invoice, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                        • {invoice.month} {invoice.year}: {invoice.amount}€ ({invoice.type})
                      </Typography>
                    ))}
                  </Alert>
                )}

                {/* Facture du mois en cours */}
                {paymentVerificationData.currentMonthInvoice && (
                  <Alert severity="info">
                    <AlertTitle>📅 Facture du mois en cours</AlertTitle>
                    <Typography variant="body2">
                      {paymentVerificationData.currentMonthInvoice.isNew ?
                        '✨ Nouvelle facture générée' :
                        'Facture existante trouvée'
                      } pour {paymentVerificationData.currentMonthInvoice.month} {paymentVerificationData.currentMonthInvoice.year}
                    </Typography>
                    <Typography variant="body2">
                      Montant: <strong>{paymentVerificationData.currentMonthInvoice.amount}€</strong>
                    </Typography>
                    {paymentVerificationData.currentMonthInvoice.prorated && (
                      <Typography variant="body2" color="info.main">
                        💡 Facture au prorata (activation en cours de mois)
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* Montant total à payer */}
                <Paper sx={{ p: 3, bgcolor: 'primary.lighter', border: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" color="primary.main" gutterBottom sx={{ textAlign: 'center' }}>
                    💰 Montant total à payer
                  </Typography>
                  <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
                    {paymentVerificationData.totalAmountDue || paymentAmount}€
                  </Typography>

                  {paymentVerificationData.paymentBreakdown && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Détail du paiement :
                      </Typography>
                      {paymentVerificationData.paymentBreakdown.unpaidAmount > 0 && (
                        <Typography variant="body2">
                          • Arriérés: {paymentVerificationData.paymentBreakdown.unpaidAmount}€
                        </Typography>
                      )}
                      {paymentVerificationData.paymentBreakdown.currentMonthAmount > 0 && (
                        <Typography variant="body2">
                          • Mois en cours: {paymentVerificationData.paymentBreakdown.currentMonthAmount}€
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>

                <Divider />

                {/* Sélection de la carte SIM (ICCID) */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    📱 Carte SIM à utiliser
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Sélectionner une carte SIM en stock</InputLabel>
                    <Select
                      value={iccid}
                      label="Sélectionner une carte SIM en stock"
                      onChange={(e) => setIccid(e.target.value)}
                      disabled={isLoadingSims}
                    >
                      {isLoadingSims ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Chargement des cartes SIM...
                        </MenuItem>
                      ) : (console.log('🃏 DEBUG select - About to render filteredSimCards:', filteredSimCards), filteredSimCards && filteredSimCards.length > 0) ? (
                        filteredSimCards.map((simCard) => (
                          <MenuItem key={simCard.iccid} value={simCard.iccid}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  📱 {simCard.iccid}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Agence: {simCard.agencyName} • Créée: {new Date(simCard.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                              {simCard.phoneId && (
                                <Chip
                                  label="⚠️ Déjà utilisée"
                                  color="warning"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          ⚠️ Aucune carte SIM disponible en stock
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  {iccid && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <AlertTitle>Carte SIM sélectionnée</AlertTitle>
                      ICCID: <strong>{iccid}</strong>
                      <br />
                      Cette carte SIM sera assignée à la ligne après paiement.
                    </Alert>
                  )}
                </Box>

                <Divider />

                {/* Sélection mode de paiement */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    💳 Mode de paiement
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Sélectionner le mode de paiement</InputLabel>
                    <Select
                      value={selectedPaymentMethod}
                      label="Sélectionner le mode de paiement"
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      <MenuItem value="cash">💵 Espèces</MenuItem>
                      <MenuItem value="card">💳 Carte bancaire</MenuItem>
                      <MenuItem value="bank_transfer">🏦 Virement bancaire</MenuItem>
                      <MenuItem value="mobile_money">📱 Mobile Money</MenuItem>
                      <MenuItem value="check">📄 Chèque</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Montant reçu"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    InputProps={{
                      endAdornment: <Typography variant="body2">€</Typography>
                    }}
                    helperText="Confirmez le montant exact reçu du client"
                  />
                </Box>

                {/* Récapitulatif */}
                {selectedPaymentMethod && paymentAmount && iccid && (
                  <Alert severity="success">
                    <AlertTitle>✅ Récapitulatif du paiement</AlertTitle>
                    <Typography variant="body2">
                      Carte SIM: <strong>{iccid}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Mode: <strong>{
                        selectedPaymentMethod === 'cash' ? 'Espèces' :
                        selectedPaymentMethod === 'card' ? 'Carte bancaire' :
                        selectedPaymentMethod === 'bank_transfer' ? 'Virement bancaire' :
                        selectedPaymentMethod === 'mobile_money' ? 'Mobile Money' :
                        selectedPaymentMethod === 'check' ? 'Chèque' : selectedPaymentMethod
                      }</strong>
                    </Typography>
                    <Typography variant="body2">
                      Montant: <strong>{paymentAmount}€</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      En confirmant, ce paiement sera enregistré et l'activation sera effectuée.
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setShowPaymentDialog(false);
              setShowActivationDialog(true); // Retourner au modal d'activation
            }}
            disabled={isProcessingPayment}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePaymentConfirmation}
            disabled={isProcessingPayment || !selectedPaymentMethod || !paymentAmount || !iccid}
            startIcon={isProcessingPayment ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {isProcessingPayment ? 'Confirmation...' :
              isSupervisor ? 'Confirmer paiement et activer' :
              'Confirmer paiement (encaissement)'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Modal de confirmation pour remplacement SIM */}
      <Dialog
        open={showSimReplacementConfirmDialog}
        onClose={() => setShowSimReplacementConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color="success" />
            Confirmer l'activation SIM de remplacement
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body1" gutterBottom>
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Numéro :</strong> {client?.phoneNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>SIM de remplacement :</strong> {client?.replacementSimIccid}
              </Typography>
              <Typography variant="body1">
                <strong>Compte RED :</strong> {client?.redAccountName || client?.redAccount?.accountName || `Compte ${client?.redAccountId}`}
              </Typography>
            </Alert>

            <Paper sx={{ p: 2, bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.main' }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                ⚠️ Confirmation requise
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Avez-vous bien activé cette SIM de remplacement sur le compte RED ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En confirmant, l'ancienne SIM sera définitivement désactivée et la nouvelle SIM sera activée sur ce numéro.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowSimReplacementConfirmDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSimReplacementConfirmation}
            disabled={isActivating}
            startIcon={isActivating ? <CircularProgress size={20} /> : <CheckIcon />}
            size="large"
          >
            {isActivating ? 'Activation en cours...' : 'Oui, confirmer l\'activation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ActivationInfo;