import React, { useEffect, useState } from 'react';
import {
  Stack,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterListIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import RedAccountManagement from '../../RedAccountManagement';
import ConfirmSimOrderModal from '../ConfirmSimOrderModal';
import ConfirmReplacementSimModal from '../ConfirmReplacementSimModal';
import NewLineDialog from '../../AccountManagement/NewLineDialog';
import { useGetRedAccountsQuery } from '../../../store/slices/redAccountsSlice';
import { useGetAvailableLinesQuery } from '../../../store/slices/lineReservationsSlice';
import { useWhoIAmQuery } from '../../../store/slices/authSlice';
import { useConfirmPortabilityLineMutation } from '../../../store/slices/clientsSlice';
import { PHONE_STATUS } from '../constant';

// Fonction pour détecter si c'est un remplacement SIM
const isSimReplacementClient = (client) => {
  // 🆕 CAS 1: Nouvelle structure avec orderType (SIM commandées via "Commander SIM")
  if (client?.orderType === 'REPLACEMENT_SIM') {
    return true;
  }

  // CAS 2: Vérifier les notes de la LineRequest pour détecter REPLACEMENT_SIM (cas existants)
  const hasReplacementNotes = client?.notes && client.notes.includes('REPLACEMENT_SIM');
  const hasSimLostNotes = client?.notes && (
    client.notes.toLowerCase().includes('sim perdue') ||
    client.notes.toLowerCase().includes('sim volée') ||
    client.notes.toLowerCase().includes('vol/perte')
  );

  return hasReplacementNotes || hasSimLostNotes;
};

// Composant Panel pour les portabilités RIO
const PortabilityPanel = ({ client, onConfirmLineCreated, isSupervisor = false }) => {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwapHorizIcon color="secondary" />
              <Typography variant="h6">Portabilité de Numéro (RIO)</Typography>
              <Chip label="Conservation numéro" color="secondary" size="small" />
            </Box>

            {/* Informations RIO */}
            <Box sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'secondary.main'
            }}>
              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: 'secondary.main' }}>
                <SwapHorizIcon fontSize="small" />
                Informations de Portabilité
              </Typography>

              <Stack spacing={1.5}>
                {/* Numéro à conserver */}
                {client?.phoneNumberToKeep && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Numéro à conserver :
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        mt: 0.5,
                        fontSize: '1.1rem',
                        color: 'primary.dark'
                      }}
                    >
                      📞 {client.phoneNumberToKeep}
                    </Typography>
                  </Box>
                )}

                {/* Code RIO */}
                {client?.rioCode && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Code RIO :
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        mt: 0.5,
                        fontSize: '1rem',
                        color: 'secondary.dark'
                      }}
                    >
                      {client.rioCode}
                    </Typography>
                  </Box>
                )}

                {/* Numéro de pièce d'identité */}
                {client?.identityNumber && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Numéro de pièce d'identité :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: 'white',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        mt: 0.5
                      }}
                    >
                      {client.identityNumber}
                    </Typography>
                  </Box>
                )}

                {/* Adresse pour portabilité */}
                {client?.portabilityAddress && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Adresse pour la portabilité :
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: 'white',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        mt: 0.5,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {client.portabilityAddress}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Bouton de confirmation */}
            <Box sx={{ pt: 2 }}>
              {isSupervisor ? (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onConfirmLineCreated(client)}
                  sx={{ py: 1.5 }}
                >
                  Confirmer - Ligne Créée avec RIO
                </Button>
              ) : (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  Actions disponibles pour les superviseurs uniquement
                </Alert>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

// Composant Panel pour les remplacements SIM
const SimReplacementPanel = ({ client, onConfirmSimOrder, isSupervisor = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  // DEBUG: Voir les données client
  console.log('🔍 DEBUG SimReplacementPanel - Client data:', {
    client,
    redAccount: client?.redAccount,
    redAccountId: client?.redAccountId,
    phoneNumber: client?.phoneNumber,
    trackingNotes: client?.trackingNotes
  });

  // Fonction pour copier dans le presse-papiers
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    // TODO: Ajouter une notification toast
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon color="warning" />
              <Typography variant="h6">Remplacement de Carte SIM</Typography>
              <Chip label="Urgence" color="error" size="small" />
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Client existant :</strong> {client.user?.firstname} {client.user?.lastname}
              </Typography>
              <Typography variant="body2">
                <strong>Ligne concernée :</strong> {client.phoneNumber || client.user?.phoneNumber || 'Numéro non disponible'}
              </Typography>
              <Typography variant="body2">
                <strong>Raison :</strong> {client.notes || 'Remplacement SIM'}
              </Typography>
            </Alert>

            {/* Identifiants compte RED - Version compacte */}
            {client.redAccount && (
              <Box sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                  <AccountIcon fontSize="small" color="primary" />
                  Identifiants Compte RED
                </Typography>

                <Stack spacing={1}>
                  {/* Identifiant */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                      Identifiant :
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        flex: 1,
                        fontSize: '0.85rem'
                      }}
                    >
                      {client.redAccount.redAccountId || client.redAccount.accountName}
                    </Typography>
                    <Tooltip title="Copier">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(client.redAccount.redAccountId || client.redAccount.accountName, 'Identifiant')}
                        sx={{ p: 0.5 }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Mot de passe */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                      Mot de passe :
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        flex: 1,
                        fontSize: '0.85rem'
                      }}
                    >
                      {showPassword ? (client.redAccount.password || '••••••••') : '••••••••'}
                    </Typography>
                    <Tooltip title={showPassword ? "Masquer" : "Afficher"}>
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ p: 0.5 }}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copier">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(client.redAccount.password || '', 'Mot de passe')}
                        disabled={!showPassword}
                        sx={{ p: 0.5 }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              </Box>
            )}


            {/* Bouton de confirmation */}
            <Box sx={{ pt: 2 }}>
              {isSupervisor ? (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onConfirmSimOrder(client)}
                  sx={{ py: 1.5 }}
                >
                  Confirmer Commande SIM de Remplacement
                </Button>
              ) : (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  Actions disponibles pour les superviseurs uniquement
                </Alert>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

const OrderTab = ({
  searchTerm,
  onSearchChange,
  selectedOrderFilter,
  onOrderFilterChange,
  clients,
  selectedClient,
  onClientSelect
}) => {
  // Vérifier le rôle utilisateur
  const { data: connectedUser } = useWhoIAmQuery();
  const isSupervisor = connectedUser?.role === 'SUPERVISOR' || connectedUser?.role === 'ADMIN' || connectedUser?.role === 'SUPER_ADMIN';

  // State pour le filtre des types
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Options de filtre
  const filterOptions = [
    { value: 'all', label: 'Tout', icon: <FilterListIcon /> },
    { value: 'new', label: 'Nouvelles lignes', icon: <PersonAddIcon /> },
    { value: 'replacement', label: 'Remplacements', icon: <SwapHorizIcon /> }
  ];

  // Filtrer les clients selon le filtre sélectionné
  const filteredClients = React.useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];

    console.log('🔍 DEBUG Filtering - Type sélectionné:', selectedFilter);
    console.log('🔍 DEBUG Filtering - Clients avant filtre:', clients.length);

    let filtered = [];
    switch (selectedFilter) {
      case 'new':
        // Filtrer pour ne garder que les nouveaux clients (LineRequests)
        filtered = clients.filter(client => {
          const isNewClient = client.lineRequestId && !isSimReplacementClient(client);
          console.log(`Client ${client.id}: lineRequestId=${client.lineRequestId}, isSimReplacement=${isSimReplacementClient(client)}, isNewClient=${isNewClient}`);
          return isNewClient;
        });
        break;
      case 'replacement':
        // Filtrer pour ne garder que les remplacements SIM
        filtered = clients.filter(client => {
          const isReplacement = isSimReplacementClient(client);
          console.log(`Client ${client.id}: isSimReplacement=${isReplacement}, orderType=${client.orderType}`);
          return isReplacement;
        });
        break;
      case 'all':
      default:
        filtered = clients;
        break;
    }

    console.log('🔍 DEBUG Filtering - Clients après filtre:', filtered.length);
    return filtered;
  }, [clients, selectedFilter]);
  // States pour la modal de confirmation SIM
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedLineRequest, setSelectedLineRequest] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // States pour la modal de confirmation SIM de remplacement
  const [confirmReplacementModalOpen, setConfirmReplacementModalOpen] = useState(false);
  const [selectedReplacementClient, setSelectedReplacementClient] = useState(null);

  // States pour la modal de création de ligne
  const [newLineModalOpen, setNewLineModalOpen] = useState(false);
  const [selectedRedAccountForNewLine, setSelectedRedAccountForNewLine] = useState(null);

  // RTK Query mutation pour confirmer la portabilité
  const [confirmPortabilityLine, { isLoading: isConfirmingPortability }] = useConfirmPortabilityLineMutation();

  // Récupérer les données des comptes RED et lignes disponibles
  const { data: redAccountsData, isLoading: accountsLoading } = useGetRedAccountsQuery();
  const redAccounts = redAccountsData?.redAccounts || [];

  // Récupérer les lignes disponibles pour réservation
  const { data: availableLinesData, isLoading: linesLoading } = useGetAvailableLinesQuery();
  const availableLines = availableLinesData?.data || [];

    useEffect(()=>{
      if (filteredClients && Array.isArray(filteredClients) && filteredClients.length > 0 && !selectedClient) {
        const timer = setTimeout(() => {
          onClientSelect(filteredClients[0]);
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [filteredClients?.length, selectedClient])

  // Handlers pour la confirmation de commande SIM
  const handleConfirmSimOrder = (lineRequest) => {
    console.log('🔍 DEBUG handleConfirmSimOrder - lineRequest:', lineRequest);

    // Vérifier si c'est un remplacement SIM
    if (isSimReplacementClient(lineRequest)) {
      console.log('🔄 Ouverture modal remplacement SIM');
      setSelectedReplacementClient(lineRequest);
      setConfirmReplacementModalOpen(true);
    } else {
      console.log('📱 Ouverture modal nouvelle ligne');
      setSelectedLineRequest(lineRequest);
      setConfirmModalOpen(true);
    }
  };

  const handleModalClose = (success) => {
    setConfirmModalOpen(false);
    setSelectedLineRequest(null);

    if (success) {
      setSuccessMessage('Commande SIM confirmée avec succès! Elle sera traitée par l\'équipe logistique.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleReplacementModalClose = (success) => {
    setConfirmReplacementModalOpen(false);
    setSelectedReplacementClient(null);

    if (success) {
      setSuccessMessage('Commande SIM de remplacement confirmée avec succès! La ligne va passer dans "À ACTIVER".');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Handlers pour la création de nouvelle ligne
  const handleCreateNewLine = (redAccount) => {
    setSelectedRedAccountForNewLine(redAccount);
    setNewLineModalOpen(true);
  };

  const handleNewLineSubmit = async (lineData) => {
    try {
      // La logique de création est gérée par le composant NewLineDialog
      setNewLineModalOpen(false);
      setSelectedRedAccountForNewLine(null);
      setSuccessMessage('Nouvelle ligne créée avec succès!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Erreur lors de la création de ligne:', error);
    }
  };

  const handleNewLineModalClose = () => {
    setNewLineModalOpen(false);
    setSelectedRedAccountForNewLine(null);
  };

  // Handler pour la confirmation de portabilité
  const handleConfirmPortabilityLine = async (client) => {
    if (!client || !client.lineRequestId) {
      console.error('❌ Client ou lineRequestId manquant');
      return;
    }

    try {
      console.log('🔍 Confirmation portabilité pour:', client);

      const result = await confirmPortabilityLine({
        lineRequestId: client.lineRequestId
      }).unwrap();

      console.log('✅ Portabilité confirmée:', result);

      setSuccessMessage(result.message || 'Portabilité confirmée ! La ligne a été assignée au client.');
      setTimeout(() => setSuccessMessage(''), 5000);

      // Désélectionner le client après confirmation
      onClientSelect(null);
    } catch (error) {
      console.error('❌ Erreur confirmation portabilité:', error);

      const errorMessage = error?.data?.message || 'Erreur lors de la confirmation de la portabilité';
      setSuccessMessage(''); // Clear success message

      // Afficher l'erreur à l'utilisateur
      alert(errorMessage);
    }
  };

  const getStatistics = () => {
    // Vérifier que clients est défini et est un tableau
    if (!clients || !Array.isArray(clients)) {
      console.log('🔍 DEBUG OrderTab - Pas de clients ou clients non array:', clients);
      return {
        needsToBeOrdered: 0,
        simReplacementCount: 0,
        reservedExisting: 0,
        reservedNew: 0,
        needsNewAccount: 0,
        linesInDelivery: 0,
        totalPending: 0,
        loading: false
      };
    }

    console.log('📊 DEBUG OrderTab - Clients reçus:', clients.length, clients);
    clients.forEach((client, index) => {
      console.log(`Client ${index}:`, {
        id: client.id,
        lineRequestId: client.lineRequestId,
        phoneId: client.phoneId,
        orderType: client.orderType,
        agencyId: client.agencyId,
        user: client.user
      });
    });

    // Séparer les types de demandes dans "À COMMANDER"
    const newClientRequests = clients.filter(client =>
      client.lineRequestId && !isSimReplacementClient(client)
    );

    const simReplacementRequests = clients.filter(client =>
      isSimReplacementClient(client)
    );

    const needsToBeOrdered = newClientRequests.length;
    const simReplacementCount = simReplacementRequests.length;

    // Les autres statuts ne sont pas pertinents dans l'onglet "À COMMANDER"
    // car il ne contient que les demandes en attente de confirmation superviseur
    const reservedExisting = 0;
    const reservedNew = 0;
    const needsNewAccount = 0;

    // Identifier l'agence des clients en cours
    const currentAgencyIds = [...new Set(clients.map(client => client?.agencyId).filter(Boolean))];
    console.log('🏢 DEBUG OrderTab - AgencyIds extraits:', clients.map(client => client?.agencyId));
    console.log('🏢 DEBUG OrderTab - AgencyIds après Set:', currentAgencyIds);

    // Filtrer les lignes en livraison pour cette/ces agence(s) uniquement
    const filteredLinesInDelivery = (availableLines || []).filter(line =>
      line.agencyId === null || currentAgencyIds.includes(line.agencyId)
    );

    const linesInDelivery = !linesLoading ? filteredLinesInDelivery.length : 0;

    return {
      needsToBeOrdered,
      simReplacementCount,
      reservedExisting,
      reservedNew,
      needsNewAccount,
      linesInDelivery,
      totalPending: needsToBeOrdered + simReplacementCount,
      loading: accountsLoading
    };
  };

  const stats = getStatistics();

  // Statistiques filtrées selon le filtre sélectionné
  const getFilteredStats = () => {
    const filteredStats = {
      needsToBeOrdered: 0,
      simReplacementCount: 0,
      totalDisplayed: filteredClients.length
    };

    if (selectedFilter === 'all') {
      return {
        ...stats,
        totalDisplayed: filteredClients.length
      };
    } else if (selectedFilter === 'new') {
      filteredStats.needsToBeOrdered = filteredClients.length;
    } else if (selectedFilter === 'replacement') {
      filteredStats.simReplacementCount = filteredClients.length;
    }

    return {
      ...stats,
      ...filteredStats,
      totalDisplayed: filteredClients.length
    };
  };

  const displayStats = getFilteredStats();

  return (
    <Stack spacing={3}>
      {/* Statistiques détaillées */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Demandes nouvelles */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedFilter === 'all' ? stats.needsToBeOrdered :
                     selectedFilter === 'new' ? displayStats.totalDisplayed : stats.needsToBeOrdered}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Nouveaux clients
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Remplacements SIM */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon color="error" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedFilter === 'all' ? stats.simReplacementCount :
                     selectedFilter === 'replacement' ? displayStats.totalDisplayed : stats.simReplacementCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    Remplacements SIM
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Lignes en livraison disponibles */}
        <Grid item xs={12} sm={6} md={2.4}>
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
        <Grid item xs={12} sm={6} md={2.4}>
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
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ minHeight: 80 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedFilter === 'all' ? stats.totalPending : displayStats.totalDisplayed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                    {selectedFilter === 'all' ? 'Total en attente' : 'Affichés'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Aide contextuelle */}
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
        <Grid item xs={12} md={selectedClient ? 6 : 12}>
          <Stack spacing={3}>
            {/* Barre de recherche */}
            <ClientSearch
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              resultCount={filteredClients?.length || 0}
              hideFilters={false}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              filterOptions={filterOptions}
            />

            {/* Message de succès */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {/* Liste des clients */}
            <ClientList
              clients={filteredClients}
              selectedClient={selectedClient}
              onClientSelect={onClientSelect}
              isOrderView={true}
              action={{
                onConfirmSimOrder: handleConfirmSimOrder
              }}
            />
          </Stack>
        </Grid>

        {/* Colonne droite: Panel adapté selon le type de demande */}
        {selectedClient && (
          <Grid item xs={12} md={6}>
            {selectedClient?.isPortability ? (
              // Afficher le panel de portabilité RIO
              <PortabilityPanel
                client={selectedClient}
                onConfirmLineCreated={handleConfirmPortabilityLine}
                isSupervisor={isSupervisor}
              />
            ) : isSimReplacementClient(selectedClient) ? (
              // Afficher le panel de remplacement SIM
              <SimReplacementPanel
                client={selectedClient}
                onConfirmSimOrder={handleConfirmSimOrder}
                isSupervisor={isSupervisor}
              />
            ) : (
              // Afficher le panel normal de gestion compte RED
              <RedAccountManagement client={selectedClient} />
            )}
          </Grid>
        )}
      </Grid>

      {/* Modal de confirmation de commande SIM */}
      <ConfirmSimOrderModal
        open={confirmModalOpen}
        onClose={handleModalClose}
        lineRequest={selectedLineRequest}
      />

      {/* Modal de confirmation de commande SIM de remplacement */}
      <ConfirmReplacementSimModal
        open={confirmReplacementModalOpen}
        onClose={handleReplacementModalClose}
        client={selectedReplacementClient}
      />
    </Stack>
  );
};

export default OrderTab;