import React ,{useEffect}from 'react';
import { 
  Stack, 
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import RedAccountManagement from '../../RedAccountManagement';
import { useGetRedAccountsQuery } from '../../../store/slices/redAccountsSlice';
import { useGetAvailableLinesQuery } from '../../../store/slices/lineReservationsSlice';
import { PHONE_STATUS } from '../constant';

const OrderTab = ({
  searchTerm,
  onSearchChange,
  selectedOrderFilter,
  onOrderFilterChange,
  clients,
  selectedClient,
  onClientSelect
}) => {
  // Récupérer les données des comptes RED et lignes disponibles
  const { data: redAccountsData, isLoading: accountsLoading } = useGetRedAccountsQuery();
  const redAccounts = redAccountsData?.redAccounts || [];
  
  // Récupérer les lignes disponibles pour réservation
  const { data: availableLinesData, isLoading: linesLoading } = useGetAvailableLinesQuery();
  const availableLines = availableLinesData?.data || [];

    useEffect(()=>{
      if (clients && Array.isArray(clients) && clients.length > 0 && !selectedClient) {
        const timer = setTimeout(() => {
          onClientSelect(clients[0]);
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [clients?.length, selectedClient])

  const getStatistics = () => {
    // Vérifier que clients est défini et est un tableau
    if (!clients || !Array.isArray(clients)) {
      console.log('🔍 DEBUG OrderTab - Pas de clients ou clients non array:', clients);
      return {
        needsToBeOrdered: 0,
        reservedExisting: 0,
        reservedNew: 0,
        needsNewAccount: 0,
        linesInDelivery: 0,
        availableAccounts: 0
      };
    }

    console.log('📊 DEBUG OrderTab - Clients reçus:', clients.length, clients);
    clients.forEach((client, index) => {
      console.log(`Client ${index}:`, {
        id: client.id,
        agencyId: client.agencyId,
        phoneStatus: client.phoneStatus,
        user: client.user
      });
    });

    // Statistiques basées sur les vrais statuts
    const needsToBeOrdered = clients.filter(client => 
      client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ORDERED
    ).length;
    
    const reservedExisting = clients.filter(client => 
      client?.phoneStatus === PHONE_STATUS.RESERVED_EXISTING_LINE
    ).length;
    
    const reservedNew = clients.filter(client => 
      client?.phoneStatus === PHONE_STATUS.RESERVED_NEW_LINE
    ).length;
    
    const needsNewAccount = clients.filter(client => 
      client?.phoneStatus === PHONE_STATUS.NEEDS_NEW_ACCOUNT
    ).length;

    // Identifier l'agence des clients en cours
    const currentAgencyIds = [...new Set(clients.map(client => client?.agencyId).filter(Boolean))];
    console.log('🏢 DEBUG OrderTab - AgencyIds extraits:', clients.map(client => client?.agencyId));
    console.log('🏢 DEBUG OrderTab - AgencyIds après Set:', currentAgencyIds);
    
    // Filtrer les lignes en livraison pour cette/ces agence(s) uniquement
    // Les lignes avec agencyId null sont des lignes libres (disponibles pour toutes les agences)
    const filteredLinesInDelivery = (availableLines || []).filter(line => 
      line.agencyId === null || currentAgencyIds.includes(line.agencyId)
    );
    
    const linesInDelivery = !linesLoading ? filteredLinesInDelivery.length : 0;
    
    return {
      needsToBeOrdered,
      reservedExisting,
      reservedNew,
      needsNewAccount,
      linesInDelivery,
      totalPending: needsToBeOrdered + reservedExisting + reservedNew + needsNewAccount,
      loading: accountsLoading
    };
  };

  const stats = getStatistics();

  return (
    <Stack spacing={3}>
      {/* Statistiques détaillées */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Demandes nouvelles */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddIcon color="error" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">{stats.needsToBeOrdered}</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Nouvelles commandes
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Lignes en livraison disponibles */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon color="warning" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">{stats.linesInDelivery}</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Lignes en livraison
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Réservations actives */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccountIcon color="info" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {stats.reservedExisting + stats.reservedNew}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Réservations actives
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions requises */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">{stats.totalPending}</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Total en attente
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aide contextuelle */}
      {stats.linesInDelivery > 0 && (
        <Card sx={{ bgcolor: 'success.light', mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="success.dark">
              💡 <strong>Optimisation possible :</strong> {stats.linesInDelivery} ligne(s) en cours de livraison disponible(s). 
              Vous pouvez les attribuer directement aux clients en attente au lieu de commander de nouvelles lignes.
            </Typography>
          </CardContent>
        </Card>
      )}

      {stats.needsNewAccount > 0 && (
        <Card sx={{ bgcolor: 'warning.light', mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ <strong>Action requise :</strong> {stats.needsNewAccount} client(s) nécessite(nt) la création d'un nouveau compte RED.
              Capacité maximale atteinte sur les comptes existants.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Vue principale avec colonne de suggestion conditionnelle */}
      <Grid container spacing={3}>
        {/* Colonne principale: Vue tableau standard */}
        <Grid item xs={12} md={selectedClient ? 5 : 12}>
          <Stack spacing={3}>
            {/* Barre de recherche */}
            <ClientSearch 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              resultCount={clients?.length || 0}
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
        </Grid>

        {/* Colonne droite: Gestion des comptes RED (uniquement si client sélectionné) */}
        {selectedClient && (
          <Grid item xs={12} md={7}>
            <RedAccountManagement
              client={selectedClient}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default OrderTab;