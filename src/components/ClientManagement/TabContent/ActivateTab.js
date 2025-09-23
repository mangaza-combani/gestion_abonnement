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

  // ✅ CORRECTION : Extraire les lignes de la nouvelle structure API
  const actualLines = lines?.lines || lines || clients || []
  const dataToDisplay = Array.isArray(actualLines) ? actualLines : []

  console.log('📋 dataToDisplay final:', {
    source: lines?.lines ? 'lines.lines' : lines ? 'lines' : 'clients',
    count: dataToDisplay.length,
    linesStructure: lines ? Object.keys(lines) : null,
    isArray: Array.isArray(dataToDisplay),
    data: Array.isArray(dataToDisplay) ? dataToDisplay.slice(0, 2) : dataToDisplay // Premiers 2 clients pour debug
  });

  const [activationFilter, setActivationFilter] = useState('all'); // 'all', 'ready', 'waiting', 'to_pay'
  const { data: agenciesData } = useGetAgenciesQuery();
  const { data: currentUser } = useWhoIAmQuery();
  const isAgency = currentUser?.role === 'AGENCY';
  const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

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
  
  // ✅ FILTRAGE SIMPLIFIÉ BASÉ SUR LES NOUVELLES PROPRIÉTÉS API
  const filteredClients = dataToDisplay?.filter(client => {
    switch (activationFilter) {
      case 'ready':
        // Prêt à activer maintenant (ICCID pré-assigné OU SIM disponible + facture payée)
        return client.canActivateNow === true
      case 'waiting':
        // En attente de SIM (pas de SIM disponible)
        return client.waitingForSim === true
      case 'to_pay':
        // SIM disponible mais doit payer d'abord
        return client.needsPaymentFirst === true
      default:
        return true
    }
  }) || []
  
  // ✅ COMPTEURS SIMPLIFIÉS BASÉS SUR LES NOUVELLES PROPRIÉTÉS API
  const readyCount = dataToDisplay?.filter(client => client.canActivateNow === true).length || 0
  const waitingCount = dataToDisplay?.filter(client => client.waitingForSim === true).length || 0
  const toPayCount = dataToDisplay?.filter(client => client.needsPaymentFirst === true).length || 0


  // ✅ LOGIQUE AUTO-SWITCH SIMPLIFIÉE BASÉE SUR LA NOUVELLE API
  const performAutoSwitch = (forceLog = false) => {
    if (!dataToDisplay || !lines) return

    // Utiliser les nouvelles propriétés de l'API
    const stockInfo = lines.stockInfo || {}
    const summary = lines.summary || {}
    const totalAvailableSims = stockInfo.totalStockAvailable || 0

    const clientsReadyToActivate = dataToDisplay.filter(client => client.canActivateNow)
    const clientsWaitingForSim = dataToDisplay.filter(client => client.waitingForSim)
    const clientsNeedingPayment = dataToDisplay.filter(client => client.needsPaymentFirst)

    if (forceLog) {
      console.log('📊 AUTO-SWITCH NOUVELLE LOGIQUE:', {
        totalAvailableSims,
        readyToActivate: clientsReadyToActivate.length,
        waitingForSim: clientsWaitingForSim.length,
        needingPayment: clientsNeedingPayment.length,
        currentFilter: activationFilter
      })
    }

    // 🔄 TRANSITIONS INTELLIGENTES :

    // ⚠️ IMPORTANT: Ne pas forcer le switch si l'utilisateur a sélectionné manuellement un filtre
    // Cela permet de voir les lignes de remplacement SIM qui restent "en attente"

    // Seulement faire l'auto-switch si on est sur "all" (pas de sélection manuelle)
    if (activationFilter === 'all') {
      // Si stock disponible + clients en attente → switch vers paiement ou prêt
      if (totalAvailableSims > 0) {
        if (clientsNeedingPayment.length > 0) {
          console.log('🔄 AUTO-SWITCH: Stock SIM disponible → clients doivent payer → "À payer"')
          setActivationFilter('to_pay')
        } else if (clientsReadyToActivate.length > 0) {
          console.log('🔄 AUTO-SWITCH: Stock SIM disponible + clients prêts → "Prêt à activer"')
          setActivationFilter('ready')
        }
      }
      // Si plus de stock → retour en attente
      else if (totalAvailableSims === 0 && clientsWaitingForSim.length > 0) {
        console.log('⏳ AUTO-SWITCH: Plus de stock SIM → "En attente SIM"')
        setActivationFilter('waiting')
      }
    }
  }

  // 🚀 AUTO-SWITCH au chargement initial de la page
  useEffect(() => {
    if (agenciesData && dataToDisplay) {
      console.log('🚀 INITIALISATION PAGE À ACTIVER - Déclenchement AUTO-SWITCH initial');
      performAutoSwitch(true); // forceLog = true pour tracer l'initialisation
    }
  }, [agenciesData, dataToDisplay]); // Déclenché uniquement au premier chargement des données

  // 🔄 AUTO-SWITCH lors des changements de données (seulement si filtre = 'all')
  useEffect(() => {
    if (activationFilter === 'all') {
      performAutoSwitch(false);
    }
  }, [agenciesData, dataToDisplay]); // Retirer activationFilter des dépendances

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

      {/* Interface de recherche pour clients à activer */}
      <ClientSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={filteredClients?.length || 0}
        hideFilters
      />

      {/* Filtres d'activation - Masqués pour les superviseurs */}
      {!isSupervisor && (
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
      )}

      {/* Compteur simple pour les superviseurs */}
      {isSupervisor && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1, border: 1, borderColor: 'success.main' }}>
          <Typography variant="body2" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon fontSize="small" />
            <strong>{dataToDisplay?.length || 0} ligne(s) prête(s) à activer</strong>
          </Typography>
        </Box>
      )}

      {/* Liste des clients à activer */}
      <ClientList
        clients={isSupervisor ? dataToDisplay || [] : filteredClients || []}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        action="activate"
        isLoading={isLoading}
      />

    </Stack>
  );
};

export default ActivateTab;