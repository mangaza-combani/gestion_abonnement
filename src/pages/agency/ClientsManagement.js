import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Subscriptions
} from '@mui/icons-material';
import CreateClientModal from '../../components/ClientManagement/CreateClientModal';
import { useGetClientsQuery } from "../../store/slices/clientsSlice";
import { useGetPhonesQuery } from "../../store/slices/linesSlice";
import { useWhoIAmQuery } from "../../store/slices/authSlice";

const ClientCard = ({ client, clientLines = [], onViewDetails, onSubscribe }) => {
  const totalActiveLines = clientLines.length;
  const hasLateLine = clientLines.some(line => line.paymentStatus === 'OVERDUE' || line.phoneStatus === 'SUSPENDED');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={2} alignItems="center">
            <Avatar sx={{ bgcolor: hasLateLine ? 'error.light' : 'primary.light' }}>
              {client.firstname?.[0]?.toUpperCase()}{client.lastname?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {client.firstname} {client.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {client.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => onViewDetails(client)}>
            <VisibilityIcon />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={2} mt={2}>
          <Chip
            icon={<PhoneIcon />}
            label={`${totalActiveLines} ligne${totalActiveLines > 1 ? 's' : ''}`}
            variant="outlined"
            color="primary"
          />
          <Chip
            icon={hasLateLine ? <WarningIcon /> : <CheckCircleIcon />}
            label={hasLateLine ? 'Paiement en retard' : 'À jour'}
            color={hasLateLine ? 'error' : 'success'}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Téléphone: {client.phoneNumber || 'Non renseigné'}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Subscriptions />}
          onClick={() => onSubscribe && onSubscribe(client)}
          color="primary"
        >
          Souscrire une ligne
        </Button>
      </CardActions>
    </Card>
  );
};

const ClientDetailsDialog = ({ client, clientLines = [], open, onClose }) => {
  if (!client) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Détails du client
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Informations client */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations personnelles
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Nom:</strong> {client.firstname} {client.lastname}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {client.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Téléphone:</strong> {client.phoneNumber || 'Non renseigné'}
                </Typography>
                <Typography variant="body2">
                  <strong>Rôle:</strong> {client.role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Lignes téléphoniques */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lignes téléphoniques
                </Typography>
                <Stack spacing={2}>
                  {clientLines?.length > 0 ? clientLines.map((line, index) => {
                    const isActive = line.phoneStatus !== 'SUSPENDED' && line.paymentStatus !== 'CANCELLED';
                    const isLate = line.paymentStatus === 'OVERDUE';
                    return (
                      <Box key={index} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1">{line.phoneNumber || 'Numéro à définir'}</Typography>
                          <Chip
                            size="small"
                            label={isActive ? (isLate ? 'En retard' : 'Actif') : 'Suspendu'}
                            color={isActive ? (isLate ? 'warning' : 'success') : 'error'}
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Statut: {line.paymentStatus} | {line.phoneStatus}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color={isActive ? 'warning' : 'primary'}
                            disabled
                          >
                            Gérer
                          </Button>
                        </Box>
                      </Box>
                    );
                  }) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune ligne attribuée
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Historique des paiements */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Historique des paiements
                  </Typography>
                  <Button startIcon={<DownloadIcon />}>
                    Télécharger les factures
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  L'historique des paiements sera disponible prochainement.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const STATUSES = {
  ALL: 'all',
  ACTIVE: 'active',
  LATE: 'late'
};

const ModernClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isSubscribeClientOpen, setIsSubscribeClientOpen] = useState(false);
  const [clientToSubscribe, setClientToSubscribe] = useState(null);
  const [statusFilter, setStatusFilter] = useState(STATUSES.ALL);

  // Récupérer l'utilisateur connecté
  const { data: currentUser, isLoading: userLoading } = useWhoIAmQuery();
  const agencyId = currentUser?.agencyId;
  
  // Récupérer les clients de l'agence
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetClientsQuery(agencyId, {
    skip: !agencyId
  });
  
  
  // Récupérer toutes les lignes pour pouvoir les associer aux clients
  const { data: linesData, isLoading: linesLoading } = useGetPhonesQuery(undefined, {
    skip: !agencyId
  });
  
  const clients = clientsData?.users || [];
  
  // Fonction pour obtenir les lignes d'un client spécifique
  const getClientLines = (clientId) => {
    return linesData?.filter(line => line.clientId === clientId) || [];
  };

  const filteredClients = clients?.filter(client => {
    if (!client) return false;
    
    const matchesSearch = 
      `${client.firstname || ''} ${client.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phoneNumber || '').includes(searchTerm);
    
    if (statusFilter === STATUSES.ALL) {
      return matchesSearch;
    }
    
    // Récupérer les lignes du client pour filtrer par statut
    const clientLines = getClientLines(client.id);
    
    if (statusFilter === STATUSES.ACTIVE) {
      // Client est "à jour" s'il a au moins une ligne active et à jour
      const hasActiveLine = clientLines.some(line => 
        line.phoneStatus !== 'SUSPENDED' && line.paymentStatus === 'UP_TO_DATE'
      );
      return matchesSearch && hasActiveLine;
    }
    
    if (statusFilter === STATUSES.LATE) {
      // Client est "en retard" s'il a au moins une ligne en retard
      const hasLateLine = clientLines.some(line => 
        line.paymentStatus === 'OVERDUE' || line.phoneStatus === 'SUSPENDED'
      );
      return matchesSearch && hasLateLine;
    }
    
    return matchesSearch;
  }) || [];

  const handleNewClient = (clientData) => {
    console.log('Nouveau client:', clientData);
    // Logique pour ajouter le nouveau client
    setIsNewClientOpen(false);
  };

  const handleSubscribeClient = (client) => {
    setClientToSubscribe(client);
    setIsSubscribeClientOpen(true);
  };

  const handleSubscriptionCreated = (result) => {
    console.log('Souscription créée pour le client:', result);
    setClientToSubscribe(null);
    setIsSubscribeClientOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Gestion des Clients
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon color="primary" />
                <Typography variant="body2">
                  {clients?.length || 0} clients
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon color="primary" />
                <Typography variant="body2">
                  {linesData?.length || 0} lignes totales
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<Subscriptions />}
            onClick={() => setIsNewClientOpen(true)}
          >
            Souscrire un abonnement
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un client par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={statusFilter === STATUSES.ALL ? "contained" : "outlined"}
              onClick={() => setStatusFilter(STATUSES.ALL)}
              size="large"
            >
              Tous
            </Button>
            <Button
              variant={statusFilter === STATUSES.ACTIVE ? "contained" : "outlined"}
              onClick={() => setStatusFilter(STATUSES.ACTIVE)}
              color="success"
              size="large"
              startIcon={<CheckCircleIcon />}
            >
              À jour
            </Button>
            <Button
              variant={statusFilter === STATUSES.LATE ? "contained" : "outlined"}
              onClick={() => setStatusFilter(STATUSES.LATE)}
              color="error"
              size="large"
              startIcon={<WarningIcon />}
            >
              En retard
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Loading and error states */}
      {(userLoading || clientsLoading || linesLoading) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Chargement...</Typography>
        </Box>
      )}
      
      {clientsError && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error">
            Erreur lors du chargement des clients: {clientsError.message}
          </Typography>
        </Box>
      )}
      
      {!userLoading && !clientsLoading && !linesLoading && !clientsError && (
        <Grid container spacing={3}>
          {filteredClients.length > 0 ? filteredClients.map(client => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <ClientCard
                client={client}
                clientLines={getClientLines(client.id)}
                onViewDetails={(client) => {
                  setSelectedClient(client);
                  setIsDetailsOpen(true);
                }}
                onSubscribe={handleSubscribeClient}
              />
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {searchTerm || statusFilter !== STATUSES.ALL 
                    ? 'Aucun client ne correspond aux critères de recherche.' 
                    : 'Aucun client dans votre agence.'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialogs */}
      <ClientDetailsDialog
        client={selectedClient}
        clientLines={selectedClient ? getClientLines(selectedClient.id) : []}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedClient(null);
        }}
      />

      <CreateClientModal
        open={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onClientCreated={handleNewClient}
        agencyMode={true}
      />

      <CreateClientModal
        open={isSubscribeClientOpen}
        onClose={() => {
          setIsSubscribeClientOpen(false);
          setClientToSubscribe(null);
        }}
        onClientCreated={handleSubscriptionCreated}
        agencyMode={true}
        preselectedClient={clientToSubscribe}
        useCreateClientRoute={true}
      />
    </Box>
  );
};

export default ModernClientsManagement;