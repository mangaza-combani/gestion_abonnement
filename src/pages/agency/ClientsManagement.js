import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
} from '@mui/icons-material';
import NewClientDialog from '../../components/common/NewClientDialog';
import {useGetClientsQuery} from "../../store/slices/clientsSlice";

const activeLines = [
  { number: '06 12 34 56 78', status: 'active', lastPayment: '2024-01-15' },
  { number: '06 98 76 54 32', status: 'late', lastPayment: '2023-12-01' }
]

const paymentHistory = [
  { date: '2024-01-15', amount: 38, status: 'paid' },
  { date: '2023-12-01', amount: 38, status: 'late' }
]

// Mock data avec informations étendues

const ClientCard = ({ client, onViewDetails }) => {
  const totalActiveLines = activeLines.length;
  const hasLateLine = activeLines.some(line => line.status === 'late');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={2} alignItems="center">
            <Avatar sx={{ bgcolor: hasLateLine ? 'error.light' : 'primary.light' }}>
              {client.firstname[0]}{client.lastname[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {client.firstName} {client.lastName}
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
          Dernier paiement: {new Date(paymentHistory[0].date).toLocaleDateString('fr-FR')}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ClientDetailsDialog = ({ client, open, onClose }) => {
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
                <Typography variant="body2">
                  <strong>Adresse:</strong> {client.address}
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
                  {activeLines?.map((line, index) => (
                    <Box key={index} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">{line.number}</Typography>
                        <Chip
                          size="small"
                          label={line.status === 'active' ? 'Actif' : 'En retard'}
                          color={line.status === 'active' ? 'success' : 'error'}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Dernier paiement: {new Date(line.lastPayment).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color={line.status === 'active' ? 'error' : 'primary'}
                        >
                          {line.status === 'active' ? 'Désactiver' : 'Régulariser'}
                        </Button>
                      </Box>
                    </Box>
                  ))}
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
                <Grid container spacing={2}>
                  {paymentHistory?.map((payment, index) => (
                    <Grid item xs={12} key={index}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" 
                           sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2">
                          {new Date(payment.date).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="body2">
                          {payment.amount}€
                        </Typography>
                        <Chip
                          size="small"
                          label={payment.status === 'paid' ? 'Payé' : 'En retard'}
                          color={payment.status === 'paid' ? 'success' : 'error'}
                        />
                        <Button size="small">
                          Voir la facture
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
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
  const [statusFilter, setStatusFilter] = useState(STATUSES.ALL);

  const connectedUser = JSON.parse(localStorage.getItem('user'));
  const fetchClients = useGetClientsQuery(connectedUser?.agencyId)
  const clients = fetchClients?.currentData?.users

  const filteredClients = clients?.filter(client => {
    const matchesSearch = 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === STATUSES.ALL) {
      return matchesSearch;
    }
    
    // Vérifie si le client a au moins une ligne dans l'état filtré
    const hasLineWithStatus = client.activeLines.some(line => line.status === statusFilter);
    return matchesSearch && hasLineWithStatus;
  });

  const handleNewClient = (clientData) => {
    console.log('Nouveau client:', clientData);
    // Logique pour ajouter le nouveau client
    setIsNewClientOpen(false);
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
                  {clients?.reduce((acc, client) => acc + activeLines.length, 0)} lignes actives
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewClientOpen(true)}
          >
            Nouveau Client
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

      {/* Clients grid */}
      <Grid container spacing={3}>
        {filteredClients?.map(client => (
          <Grid item xs={12} sm={6} md={4} key={client.id}>
            <ClientCard
              client={client}
              onViewDetails={(client) => {
                setSelectedClient(client);
                setIsDetailsOpen(true);
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Dialogs */}
      <ClientDetailsDialog
        client={selectedClient}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedClient(null);
        }}
      />

      <NewClientDialog
        open={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onClientCreated={handleNewClient}
        agencyName="Agence Principale"
      />
    </Box>
  );
};

export default ModernClientsManagement;