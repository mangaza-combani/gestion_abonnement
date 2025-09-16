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

  // ✅ CORRECTION : Utiliser lines (API spécialisée) en priorité sur clients (données filtrées)
  const dataToDisplay = lines || clients || []
  const [activationFilter, setActivationFilter] = useState('all'); // 'all', 'ready', 'waiting', 'to_pay'
  const { data: agenciesData } = useGetAgenciesQuery();
  const { data: currentUser } = useWhoIAmQuery();
  const isAgency = currentUser?.role === 'AGENCY';
  
  // Fonction pour vérifier si un client peut être activé (a des SIM disponibles)
  const canBeActivated = (client) => {
    if (!agenciesData) {
      return false;
    }

    // ✅ GÉRER LES DEUX CAS: Admin (array) et Non-Admin (relation object)
    let agenciesArray = [];

    if (Array.isArray(agenciesData)) {
      // Cas Admin: tableau d'agences
      agenciesArray = agenciesData;
    } else if (typeof agenciesData === 'object' && agenciesData && (agenciesData.simCards || agenciesData.parent)) {
      // Cas Non-Admin: objet relation avec simCards directement OU structure parent
      if (agenciesData.simCards) {
        // Cas direct: l'objet agence a directement les simCards
        agenciesArray = [agenciesData];
      } else if (agenciesData.parent && agenciesData.parent.simCards) {
        // Cas parent: l'agence est dans parent
        agenciesArray = [agenciesData.parent];
      }
    } else {
      return false;
    }

    const clientAgencyId = client?.user?.agencyId ||
                          client?.client?.agencyId ||
                          client?.agencyId;

    if (!clientAgencyId) return false;

    const agency = agenciesArray.find(a => a.id === clientAgencyId);
    if (!agency || !agency.simCards) return false;

    const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');

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
        return ((needsActivation || hasReservation) && !simAvailable && !hasPreAssignedIccidWaiting);
      case 'to_pay':
        // ✅ À payer : SIM disponible MAIS paiement requis (utiliser la vraie réponse API)
        const paymentRequiredFromAPI = client.paymentRequired === true;
        return ((needsActivation || hasReservation) && simAvailable && paymentRequiredFromAPI);
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