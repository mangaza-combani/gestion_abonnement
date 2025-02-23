import React ,{useEffect}from 'react';
import { 
  Stack, 
  Chip, 
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { 
  Add as AddIcon, 
  SimCard as SimCardIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import { ORDER_FILTERS } from '../constant';

const OrderTab = ({
  searchTerm,
  onSearchChange,
  selectedOrderFilter,
  onOrderFilterChange,
  clients,
  selectedClient,
  onClientSelect
}) => {

    useEffect(()=>{
      onClientSelect(clients[0])
    },[])

  const getStatistics = () => {
    const newClientsCount = clients.filter(client => !client.hasSimCard).length;
    const needsNewSimCount = clients.filter(client => client.needsNewSim).length;
    
    return {
      newClients: newClientsCount,
      simOrders: needsNewSimCount,
      total: newClientsCount + needsNewSimCount
    };
  };

  const stats = getStatistics();

  return (
    <Stack spacing={3}>
      {/* En-tête avec statistiques */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonAddIcon color="primary" />
              <Box>
                <Typography variant="h6">{stats.newClients}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Nouveaux clients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneIcon color="primary" />
              <Box>
                <Typography variant="h6">{stats.simOrders}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cartes SIM à commander
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

      </Box>

      {/* Barre de recherche */}
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={clients.length}
        hideFilters
      />

    

      {/* Liste des clients */}
      <ClientList
        clients={clients}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        action="order"
        showOrderDetails
      />
    </Stack>
  );
};

export default OrderTab;