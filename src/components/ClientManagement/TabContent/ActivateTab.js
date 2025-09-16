import React, { useEffect, useState } from 'react';
import {
  Stack,
  Alert,
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  PhoneAndroid as PhoneIcon,
  HourglassEmpty as WaitingIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import { useGetAgenciesQuery } from '../../../store/slices/agencySlice';
import { useWhoIAmQuery } from '../../../store/slices/authSlice';

const ActivateTab = ({
  searchTerm,
  onSearchChange,
  clients,
  lines, // Nouvelle prop pour les lignes
  isLoading,
  selectedClient,
  onClientSelect,
  newReceptions = []
}) => {

  console.log('🚀 ActivateTab RENDU - Props reçues:', {
    clients: clients?.length || 0,
    lines: lines?.length || 0,
    isLoading,
    searchTerm
  });

  // ✅ CORRECTION : Utiliser lines (API spécialisée) en priorité sur clients (données filtrées)
  const dataToDisplay = lines || clients || []
  console.log('📋 dataToDisplay final:', {
    source: lines ? 'lines' : 'clients',
    count: dataToDisplay.length,
    data: dataToDisplay.slice(0, 2) // Premiers 2 clients pour debug
  });

  const [activationFilter, setActivationFilter] = useState('all'); // 'all', 'ready', 'waiting', 'to_pay'
  const { data: agenciesData } = useGetAgenciesQuery();
  const { data: currentUser } = useWhoIAmQuery();
  const isAgency = currentUser?.role === 'AGENCY';

  console.log('🏢 AgenciesData reçue:', {
    hasData: !!agenciesData,
    type: typeof agenciesData,
    isArray: Array.isArray(agenciesData),
    keys: agenciesData ? Object.keys(agenciesData) : null
  });
  
  // ✅ FONCTION IDENTIQUE À LinesManagement pour éviter les incohérences
  const canBeActivated = (client) => {
    // 🔍 DEBUG APPROFONDI: Structure complète du client
    console.log('🔬 STRUCTURE COMPLÈTE CLIENT ActivateTab:', {
      clientId: client?.id,
      rawClient: client,
      clientKeys: client ? Object.keys(client) : null,
      userStructure: client?.user ? {
        userId: client.user.id,
        agencyId: client.user.agencyId,
        userKeys: Object.keys(client.user)
      } : null,
      agencyStructure: client?.agency ? {
        agencyId: client.agency.id,
        name: client.agency.name,
        agencyKeys: Object.keys(client.agency)
      } : null,
      directFields: {
        directAgencyId: client?.agencyId,
        clientAgencyId: client?.client?.agencyId,
        userAgencyId: client?.user?.agencyId
      }
    });

    console.log('🔍 DEBUG ActivateTab canBeActivated:', {
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
      console.log('❌ ActivateTab canBeActivated - agenciesData pas un array:', {
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

    console.log('🔍 ClientAgencyId résolu:', {
      from: 'user.agencyId',
      value: client?.user?.agencyId,
      final: clientAgencyId
    });

    if (!clientAgencyId) {
      console.log('❌ ActivateTab canBeActivated - Pas de clientAgencyId après toutes tentatives');
      return false;
    }

    const agency = agenciesData.find(a => a.id === clientAgencyId);
    if (!agency || !agency.simCards) {
      console.log('❌ ActivateTab canBeActivated - Agency ou simCards manquants:', {
        agencyFound: !!agency,
        hasSimCards: agency?.simCards ? true : false,
        clientAgencyId,
        availableAgencies: agenciesData.map(a => ({ id: a.id, name: a.name, hasSimCards: !!a.simCards }))
      });
      return false;
    }

    const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');

    console.log('🔍 ActivateTab résultat:', {
      clientId: client?.id,
      agencyId: clientAgencyId,
      totalSims: agency.simCards.length,
      availableSims: availableSims.length,
      result: availableSims.length > 0
    });

    return availableSims.length > 0;
  };
  
  // Filtrer les clients selon le filtre d'activation
  const filteredClients = dataToDisplay?.filter(client => {
    const hasReservation = client?.user?.hasActiveReservation || 
                          client?.user?.reservationStatus === 'RESERVED' ||
                          client?.hasActiveReservation || 
                          client?.reservationStatus === 'RESERVED';
    
    const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
    const needsReactivation = client?.phoneStatus === 'PAUSED' || client?.phoneStatus === 'BLOCKED';
    const readyToActivate = hasReservation && canBeActivated(client);
    
    // ✅ CORRECTION: Logique stricte de paiement pour activation
    const hasUnpaidInvoices = client?.paymentStatus === 'EN RETARD' ||
                             client?.paymentStatus === 'OVERDUE' ||
                             client?.paymentStatus === 'PENDING_PAYMENT' ||
                             client?.paymentStatus === 'NEEDS_PAYMENT';

    // ✅ CORRECTION STRICTE: Vérifier qu'il y a VRAIMENT une facture du mois courant payée
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    const hasCurrentMonthPaidInvoice = client?.invoices?.some(invoice => {
      const invoiceMonth = new Date(invoice.createdAt).toISOString().substring(0, 7);
      return invoiceMonth === currentMonth &&
             (invoice.status === 'PAID' || invoice.status === 'À JOUR');
    });

    // Un client est "prêt" SEULEMENT si il a une VRAIE facture du mois courant payée
    const isPaid = hasCurrentMonthPaidInvoice;


    // Il faut payer si : dettes existantes OU AUCUNE facture du mois courant payée
    const needsPayment = hasUnpaidInvoices || !hasCurrentMonthPaidInvoice;

    const simAvailable = canBeActivated(client);

    switch (activationFilter) {
      case 'ready':
        // ✅ Prêt à activer : ICCID pré-assigné OU (SIM disponible ET aucun paiement requis)
        const noPaiementRequiredFromAPI = client.paymentRequired === false;
        const isPaymentUpToDate = client?.paymentStatus === 'À JOUR';
        const isPausedWithPaymentUpToDate = needsReactivation && isPaymentUpToDate;
        const hasPreAssignedIccid = client.isPreAssigned === true; // ⭐ CORRECTION PRINCIPALE
        return hasPreAssignedIccid || ((needsActivation || hasReservation) && simAvailable && noPaiementRequiredFromAPI) || isPausedWithPaymentUpToDate;
      case 'waiting':
        // ✅ En attente de SIM seulement : pas de SIM disponible ET pas d'ICCID pré-assigné
        const hasPreAssignedIccidWaiting = client.isPreAssigned === true;
        const shouldBeInWaiting = ((needsActivation || hasReservation) && !simAvailable && !hasPreAssignedIccidWaiting);
        console.log(`🔍 FILTRE WAITING - Client ${client.id || client.user?.id}:`, {
          needsActivation,
          hasReservation,
          simAvailable,
          hasPreAssignedIccidWaiting,
          shouldBeInWaiting,
          phoneStatus: client?.phoneStatus,
          reservationStatus: client?.reservationStatus || client?.user?.reservationStatus
        });
        return shouldBeInWaiting;
      case 'to_pay':
        // ✅ À payer : SIM disponible MAIS paiement requis (utiliser la vraie réponse API)
        const paymentRequiredFromAPI = client.paymentRequired === true;
        const shouldBeInToPay = ((needsActivation || hasReservation) && simAvailable && paymentRequiredFromAPI);
        console.log(`🔍 FILTRE TO_PAY - Client ${client.id || client.user?.id}:`, {
          needsActivation,
          hasReservation,
          simAvailable,
          paymentRequiredFromAPI,
          shouldBeInToPay,
          phoneStatus: client?.phoneStatus,
          reservationStatus: client?.reservationStatus || client?.user?.reservationStatus,
          clientName: client?.user?.firstname + ' ' + client?.user?.lastname
        });
        return shouldBeInToPay;
      default:
        return true;
    }
  }) || [];
  
  const readyCount = dataToDisplay?.filter(client => {
    const hasReservation = client?.user?.hasActiveReservation ||
                          client?.user?.reservationStatus === 'RESERVED' ||
                          client?.hasActiveReservation ||
                          client?.reservationStatus === 'RESERVED';
    const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
    const needsReactivation = client?.phoneStatus === 'PAUSED' || client?.phoneStatus === 'BLOCKED';

    // ✅ CORRECTION: Vérifier qu'il y a VRAIMENT une facture du mois courant payée
    const currentMonth = new Date().toISOString().substring(0, 7);
    const hasCurrentMonthPaidInvoice = client?.invoices?.some(invoice => {
      const invoiceMonth = new Date(invoice.createdAt).toISOString().substring(0, 7);
      return invoiceMonth === currentMonth &&
             (invoice.status === 'PAID' || invoice.status === 'À JOUR');
    });

    const simAvailable = canBeActivated(client);

    // ✅ Même logique que le filtre 'ready' - inclure les ICCID pré-assignés
    const noPaiementRequiredFromAPI = client.paymentRequired === false;
    const isPaymentUpToDate = client?.paymentStatus === 'À JOUR';
    const isPausedWithPaymentUpToDate = needsReactivation && isPaymentUpToDate;
    const hasPreAssignedIccid = client.isPreAssigned === true; // ⭐ CORRECTION COMPTEUR
    return hasPreAssignedIccid || ((needsActivation || hasReservation) && simAvailable && noPaiementRequiredFromAPI) || isPausedWithPaymentUpToDate;
  }).length || 0;
  
  const waitingCount = dataToDisplay?.filter(client => {
    const hasReservation = client?.user?.hasActiveReservation ||
                          client?.user?.reservationStatus === 'RESERVED' ||
                          client?.hasActiveReservation ||
                          client?.reservationStatus === 'RESERVED';
    const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';

    // ✅ Même logique que le filtre 'waiting' - exclure les ICCID pré-assignés
    const hasPreAssignedIccid = client.isPreAssigned === true;
    return ((needsActivation || hasReservation) && !canBeActivated(client) && !hasPreAssignedIccid);
  }).length || 0;

  // Compter les lignes "À PAYER" (SIM disponible mais paiement en attente)
  const toPayCount = dataToDisplay?.filter(client => {
    const hasReservation = client?.user?.hasActiveReservation ||
                          client?.user?.reservationStatus === 'RESERVED' ||
                          client?.hasActiveReservation ||
                          client?.reservationStatus === 'RESERVED';
    const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';

    const hasUnpaidInvoices = client?.paymentStatus === 'EN RETARD' ||
                             client?.paymentStatus === 'OVERDUE' ||
                             client?.paymentStatus === 'PENDING_PAYMENT' ||
                             client?.paymentStatus === 'NEEDS_PAYMENT';

    // ✅ CORRECTION: Vérifier qu'il y a VRAIMENT une facture du mois courant payée
    const currentMonth = new Date().toISOString().substring(0, 7);
    const hasCurrentMonthPaidInvoice = client?.invoices?.some(invoice => {
      const invoiceMonth = new Date(invoice.createdAt).toISOString().substring(0, 7);
      return invoiceMonth === currentMonth &&
             (invoice.status === 'PAID' || invoice.status === 'À JOUR');
    });

    // ✅ Utiliser la vraie réponse API au lieu de calculer localement
    const paymentRequiredFromAPI = client.paymentRequired === true;
    const simAvailable = canBeActivated(client);

    // ✅ Même logique que le filtre 'to_pay'
    return ((needsActivation || hasReservation) && simAvailable && paymentRequiredFromAPI);
  }).length || 0;


  // ✅ FONCTION CENTRALISÉE pour l'AUTO-SWITCH (SIMPLIFIÉE comme canBeActivated)
  const performAutoSwitch = (forceLog = false) => {
    if (!agenciesData || !Array.isArray(agenciesData) || !dataToDisplay) {
      console.log('❌ AUTO-SWITCH - Données manquantes:', {
        hasAgencies: !!agenciesData,
        isArray: Array.isArray(agenciesData),
        hasData: !!dataToDisplay
      });
      return;
    }

    // 🏭 LOGIQUE GLOBALE: Vérifier le stock SIM total disponible pour toutes les agences
    let totalAvailableSims = 0;

    // Compter le stock SIM total disponible (version simplifiée)
    agenciesData.forEach(agency => {
      if (agency.simCards) {
        const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');
        totalAvailableSims += availableSims.length;
      }
    });

    // Compter les clients en attente
    const clientsInWaiting = dataToDisplay.filter(client => {
      const hasReservation = client?.user?.hasActiveReservation ||
                            client?.user?.reservationStatus === 'RESERVED' ||
                            client?.hasActiveReservation ||
                            client?.reservationStatus === 'RESERVED';
      const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
      const hasPreAssignedIccid = client.isPreAssigned === true;
      return ((needsActivation || hasReservation) && !hasPreAssignedIccid);
    });

    if (forceLog || totalAvailableSims > 0 || clientsInWaiting.length > 0) {
      console.log('📊 STOCK GLOBAL (AUTO-SWITCH):', {
        totalAvailableSims,
        clientsWaiting: clientsInWaiting.length,
        currentFilter: activationFilter,
        trigger: forceLog ? 'PAGE_LOAD' : 'DATA_CHANGE'
      });
    }

    // 🔄 TRANSITIONS GLOBALES:
    console.log('🔍 DEBUG AUTO-SWITCH - Conditions:', {
      totalAvailableSims,
      activationFilter,
      clientsInWaiting: clientsInWaiting.length,
      shouldSwitchToPayment: totalAvailableSims > 0 && (activationFilter === 'waiting' || activationFilter === 'all') && clientsInWaiting.length > 0,
      shouldSwitchToWaiting: totalAvailableSims === 0 && activationFilter === 'to_pay'
    });

    // 🔄 TRANSITION INTELLIGENTE BASÉE SUR paymentRequired :

    // Analyser les types de clients
    const clientsWithPaymentRequired = dataToDisplay.filter(client => {
      const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
      const hasReservation = client?.user?.hasActiveReservation ||
                            client?.reservationStatus === 'RESERVED';
      const simAvailable = canBeActivated(client);

      // 🔍 DEBUG: Vérifier la valeur paymentRequired
      console.log('💰 DEBUG paymentRequired pour client', client?.id, ':', {
        paymentRequired: client.paymentRequired,
        type: typeof client.paymentRequired,
        needsActivation,
        hasReservation,
        simAvailable,
        shouldBeInPaymentRequired: ((needsActivation || hasReservation) && simAvailable && client.paymentRequired === true)
      });

      return ((needsActivation || hasReservation) && simAvailable && client.paymentRequired === true);
    });

    const clientsReadyToActivate = dataToDisplay.filter(client => {
      const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
      const hasReservation = client?.user?.hasActiveReservation ||
                            client?.reservationStatus === 'RESERVED';
      const simAvailable = canBeActivated(client);
      const hasPreAssigned = client.isPreAssigned === true;
      const noPaymentRequired = client.paymentRequired === false;
      return hasPreAssigned || ((needsActivation || hasReservation) && simAvailable && noPaymentRequired);
    });

    console.log('🔍 DEBUG AUTO-SWITCH - Analyse clients:', {
      totalAvailableSims,
      clientsInWaiting: clientsInWaiting.length,
      clientsWithPaymentRequired: clientsWithPaymentRequired.length,
      clientsReadyToActivate: clientsReadyToActivate.length,
      currentFilter: activationFilter
    });

    // TRANSITIONS BASÉES SUR LE CONTENU RÉEL :

    // Si stock disponible ET clients en attente → "waiting" vers "to_pay" ou "ready"
    if (totalAvailableSims > 0 && (activationFilter === 'waiting' || activationFilter === 'all') && clientsInWaiting.length > 0) {
      if (clientsWithPaymentRequired.length > 0) {
        console.log('🔄 AUTO-SWITCH: Stock SIM disponible + clients avec paiement requis → "À payer"');
        setActivationFilter('to_pay');
      } else if (clientsReadyToActivate.length > 0) {
        console.log('🔄 AUTO-SWITCH: Stock SIM disponible + clients prêts → "Prêt à activer"');
        setActivationFilter('ready');
      }
    }
    // Si plus de stock ET on est sur "to_pay" → retour à "waiting"
    else if (totalAvailableSims === 0 && activationFilter === 'to_pay') {
      console.log('⏳ AUTO-SWITCH: Plus de stock SIM → "En attente"');
      setActivationFilter('waiting');
    }
    // Cas spécial : clients avec paiement requis mais filtre sur "ready"
    else if (clientsWithPaymentRequired.length > 0 && activationFilter === 'ready') {
      console.log('💰 AUTO-SWITCH: Clients avec paiement requis détectés → "À payer"');
      setActivationFilter('to_pay');
    }
    // Cas spécial : clients prêts mais filtre sur "to_pay"
    else if (clientsReadyToActivate.length > 0 && clientsWithPaymentRequired.length === 0 && activationFilter === 'to_pay') {
      console.log('✅ AUTO-SWITCH: Clients prêts sans paiement → "Prêt à activer"');
      setActivationFilter('ready');
    }
    else {
      console.log('❌ AUTO-SWITCH: Aucune transition nécessaire');
    }
  };

  // 🚀 AUTO-SWITCH au chargement initial de la page
  useEffect(() => {
    if (agenciesData && dataToDisplay) {
      console.log('🚀 INITIALISATION PAGE À ACTIVER - Déclenchement AUTO-SWITCH initial');
      performAutoSwitch(true); // forceLog = true pour tracer l'initialisation
    }
  }, [agenciesData, dataToDisplay]); // Déclenché uniquement au premier chargement des données

  // 🔄 AUTO-SWITCH lors des changements de données
  useEffect(() => {
    performAutoSwitch(false);
  }, [agenciesData, dataToDisplay, activationFilter]);

  useEffect(() => {
    if (dataToDisplay && dataToDisplay.length > 0 && !selectedClient) {
      const timer = setTimeout(() => {
        onClientSelect(dataToDisplay[0]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dataToDisplay, selectedClient, onClientSelect]);

  return (
    <Stack spacing={3}>
      {/* Notifications des nouvelles réceptions SIM */}
      {newReceptions && newReceptions.length > 0 && (
        <Alert 
          severity="info" 
          icon={<NotificationsIcon />}
          sx={{ 
            backgroundColor: '#E8F5E8',
            borderColor: '#4CAF50',
            '& .MuiAlert-icon': {
              color: '#4CAF50'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            🎉 Nouvelles cartes SIM reçues !
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Les agences suivantes ont déclaré de nouvelles réceptions de cartes SIM :
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {newReceptions.map((reception, index) => (
              <Chip
                key={index}
                icon={<CheckCircleIcon />}
                label={`${reception.agencyName} (+${reception.count})`}
                color="success"
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    color: '#4CAF50'
                  }
                }}
              />
            ))}
          </Stack>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Vous pouvez maintenant activer des lignes avec ces nouvelles cartes SIM disponibles.
          </Typography>
        </Alert>
      )}

      {/* Interface de recherche pour clients à activer */}
      <ClientSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={filteredClients?.length || 0}
        hideFilters
      />

      {/* Filtres d'activation */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="subtitle2">
              Filtrer par statut d'activation :
            </Typography>
          </Box>
        </Box>
        
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={activationFilter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setActivationFilter('all')}
            startIcon={<PhoneIcon />}
          >
            Tous ({dataToDisplay?.length || 0})
          </Button>
          <Button
            variant={activationFilter === 'ready' ? 'contained' : 'outlined'}
            onClick={() => setActivationFilter('ready')}
            startIcon={<CheckCircleIcon />}
            color="success"
          >
            Prêts à activer ({readyCount})
          </Button>
          <Button
            variant={activationFilter === 'waiting' ? 'contained' : 'outlined'}
            onClick={() => setActivationFilter('waiting')}
            startIcon={<WaitingIcon />}
            color="warning"
          >
            En attente SIM ({waitingCount})
          </Button>
          <Button
            variant={activationFilter === 'to_pay' ? 'contained' : 'outlined'}
            onClick={() => setActivationFilter('to_pay')}
            startIcon={<PaymentIcon />}
            color="info"
          >
            À PAYER ({toPayCount})
          </Button>
        </ButtonGroup>
        
        {activationFilter !== 'all' && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {activationFilter === 'ready' && '✅ Clients avec SIM disponible ET facture du mois courant payée - Prêts pour activation immédiate'}
              {activationFilter === 'waiting' && '⏳ Clients avec réservations actives mais sans cartes SIM disponibles - En attente de livraison SIM'}
              {activationFilter === 'to_pay' && '💳 Clients avec SIM disponible MAIS facture d\'activation non générée ou impayée - Génération facture requise'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Liste des clients à activer */}
      <ClientList
        clients={filteredClients || []}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        action="activate"
        isLoading={isLoading}
      />

    </Stack>
  );
};

export default ActivateTab;