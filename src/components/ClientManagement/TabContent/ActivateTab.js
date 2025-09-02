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
  HourglassEmpty as WaitingIcon
} from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import { useGetAgenciesQuery } from '../../../store/slices/agencySlice';

const ActivateTab = ({
  searchTerm,
  onSearchChange,
  clients,
  selectedClient,
  onClientSelect,
  newReceptions = []
}) => {
  const [activationFilter, setActivationFilter] = useState('all'); // 'all', 'ready', 'waiting'
  const { data: agenciesData } = useGetAgenciesQuery();
  
  // Fonction pour vérifier si un client peut être activé (a des SIM disponibles)
  const canBeActivated = (client) => {
    if (!agenciesData) return false;
    
    const clientAgencyId = client?.user?.agencyId || 
                          client?.client?.agencyId || 
                          client?.agencyId;
    
    if (!clientAgencyId) return false;
    
    const agency = agenciesData.find(a => a.id === clientAgencyId);
    if (!agency || !agency.simCards) return false;
    
    const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');
    return availableSims.length > 0;
  };
  
  // Filtrer les clients selon le filtre d'activation
  const filteredClients = clients?.filter(client => {
    const hasReservation = client?.user?.hasActiveReservation || 
                          client?.user?.reservationStatus === 'RESERVED' ||
                          client?.hasActiveReservation || 
                          client?.reservationStatus === 'RESERVED';
    
    const needsActivation = client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
    const readyToActivate = hasReservation && canBeActivated(client);
    
    switch (activationFilter) {
      case 'ready':
        return needsActivation || readyToActivate;
      case 'waiting':
        return hasReservation && !canBeActivated(client);
      default:
        return true;
    }
  }) || [];
  
  const readyCount = clients?.filter(client => 
    client?.phoneStatus === 'NEEDS_TO_BE_ACTIVATED' || 
    (client?.user?.hasActiveReservation || client?.user?.reservationStatus === 'RESERVED' ||
     client?.hasActiveReservation || client?.reservationStatus === 'RESERVED') && canBeActivated(client)
  ).length || 0;
  
  const waitingCount = clients?.filter(client => 
    (client?.user?.hasActiveReservation || client?.user?.reservationStatus === 'RESERVED' ||
     client?.hasActiveReservation || client?.reservationStatus === 'RESERVED') && !canBeActivated(client)
  ).length || 0;
  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClient) {
      const timer = setTimeout(() => {
        onClientSelect(clients[0]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [clients, selectedClient, onClientSelect]);

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
            Tous ({clients?.length || 0})
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
        </ButtonGroup>
        
        {activationFilter !== 'all' && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {activationFilter === 'ready' && '✅ Clients avec cartes SIM disponibles dans leur agence - Peuvent être activés immédiatement'}
              {activationFilter === 'waiting' && '⏳ Clients avec réservations actives mais sans cartes SIM disponibles - En attente de livraison'}
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
      />
    </Stack>
  );
};

export default ActivateTab;