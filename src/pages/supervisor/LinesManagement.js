import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Search as SearchIcon,
  VisibilityOutlined as VisibilityIcon,
  EuroSymbol as EuroIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  SimCard as SimCardIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

const months = [
  ['JANVIER', 'FEVRIER', 'MARS'],
  ['AVRIL', 'MAI', 'JUIN'],
  ['JUILLET', 'AOUT', 'SEPTEMBRE'],
  ['OCTOBRE', 'NOVEMBRE', 'DECEMBRE']
];

const ClientManagement = () => {
  const [currentTab, setCurrentTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);

  const tabs = [
    { id: 'list', label: 'LISTE DES CLIENTS' },
    { id: 'unblock', label: 'A DEBLOQUER' },
    { id: 'block', label: 'A BLOQUER' },
    { id: 'order', label: 'A COMMANDER' },
    { id: 'late', label: 'RETARD' }
  ];

  const clients = [
    { 
      id: 1,
      nom: 'ABDOU',
      prenom: 'Celine',
      telephone: '0639666363',
      status: 'A JOUR',
      compte: 'ABDOU.CELINE',
      email: 'celine.abdou@email.com'
    },
    { 
      id: 2,
      nom: 'ABDOU',
      prenom: 'Omar',
      telephone: '0634466363',
      status: 'EN RETARD',
      compte: 'ABDOU.OMAR',
      email: 'omar.abdou@email.com'
    },
    {
      id: 3,
      nom: 'SAID',
      prenom: 'Marie',
      telephone: '0634466364',
      status: 'DETTE',
      compte: 'SAID.MARIE',
      email: 'marie.said@email.com'
    },
    {
      id: 4,
      nom: 'YASSINE',
      prenom: 'David',
      telephone: '0634466778',
      status: 'PAUSE',
      compte: 'YASSINE.DAVID',
      email: 'david.yassine@email.com'
    }
  ];

  // Fonction de filtrage des clients
  const getFilteredClients = () => {
    return clients.filter(client => {
      if (!searchTerm) return true;
      
      const searchValue = searchTerm.toLowerCase();
      return (
        client.nom.toLowerCase().includes(searchValue) ||
        client.prenom.toLowerCase().includes(searchValue) ||
        client.telephone.includes(searchValue)
      );
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'A JOUR': return 'success';
      case 'EN RETARD': return 'warning';
      case 'DETTE': return 'error';
      case 'PAUSE': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'A JOUR': return <CircleIcon fontSize="small" color="success" />;
      case 'EN RETARD': return <CircleIcon fontSize="small" color="warning" />;
      case 'DETTE': return <CircleIcon fontSize="small" color="error" />;
      case 'PAUSE': return <CircleIcon fontSize="small" color="info" />;
      default: return <CircleIcon fontSize="small" color="disabled" />;
    }
  };

  const renderClientDetails = () => {
    if (!selectedClient) return null;

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Card sx={{ mb: 3, p: 2, bgcolor: 'primary.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
              {selectedClient.prenom[0]}{selectedClient.nom[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" color="primary.main" gutterBottom>
                {selectedClient.prenom} {selectedClient.nom}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  icon={getStatusIcon(selectedClient.status)}
                  label={selectedClient.status}
                  color={getStatusColor(selectedClient.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedClient.telephone}
                </Typography>
              </Stack>
            </Box>
            <Button
              startIcon={<VisibilityIcon />}
              variant="contained"
              size="small"
            >
              Détails
            </Button>
          </Box>
        </Card>

        {/* Forfait */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6">FORFAIT/ABONNEMENT</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  39€
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  par mois
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                Gestion de compte et abonnement RED 120GB
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                Clé WIFI et internet
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Facturation */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">FACTURATION</Typography>
              <Button 
                variant="outlined"
                size="small"
                endIcon={<CalendarIcon />}
              >
                {selectedYear}
              </Button>
            </Box>
            <Grid container spacing={1}>
              {months.map((row, rowIndex) => (
                <Grid item xs={12} key={rowIndex}>
                  <Grid container spacing={1}>
                    {row.map((month) => (
                      <Grid item xs={4} key={month}>
                        <Paper
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            bgcolor: month === 'JANVIER' || month === 'FEVRIER' ? 'success.light' : 'grey.100',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                          }}
                        >
                          {(month === 'JANVIER' || month === 'FEVRIER') && (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          <Typography variant="body2">
                            {month}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              NOTES /EVENEMENT EN COURS
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  20/10/2024
                </Typography>
                <Typography>
                  A mettre en pause avant la prochaine échéance.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  03/10/2024
                </Typography>
                <Typography>
                  Le client demande une nouvelle carte SIM
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Typography variant="h5">GESTION CLIENTS ET ABONNEMENTS</Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Tabs 
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              px: 4,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
              }
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Recherche par Nom ou Prénom ou Téléphone"
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
          <Typography variant="body2" color="text.secondary">
            {getFilteredClients().length} résultat(s)
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
        {/* Client List */}
        <Card sx={{ flex: 1 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>NOM</TableCell>
                  <TableCell>PRENOM</TableCell>
                  <TableCell>TELEPHONE</TableCell>
                  <TableCell>ETAT CLIENT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredClients().map((client) => (
                  <TableRow
                    key={client.id}
                    hover
                    selected={selectedClient?.id === client.id}
                    onClick={() => setSelectedClient(client)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{client.nom}</TableCell>
                    <TableCell>{client.prenom}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={client.status}
                        color={getStatusColor(client.status)}
                        icon={getStatusIcon(client.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Client Details */}
        <Card sx={{ width: '600px' }}>
          {renderClientDetails()}
        </Card>

        {/* Actions */}
        {selectedClient && (
          <Paper sx={{ width: '200px', p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6">ACTIONS</Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<EuroIcon />}
              >
                Facturer
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
              >
                A débloquer
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
              >
                A bloquer
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="info"
                startIcon={<SimCardIcon />}
              >
                Commander SIM
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
              >
                Nouveau Client
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ClientManagement;