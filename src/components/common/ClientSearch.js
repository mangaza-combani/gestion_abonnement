import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
  ListItemSecondary,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  Block as BlockIcon,
  CreditCard as CreditCardIcon,
  PauseCircle as PauseCircleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  SimCard as SimCardIcon
} from '@mui/icons-material';

const ClientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);

  // Données mockées enrichies
  const mockClients = [
    { 
      id: 1, 
      nom: 'Dupont', 
      prenom: 'Jean', 
      telephone: '0601020304',
      status: 'active',
      lastPayment: '2024-01-15',
      address: '123 rue de Paris',
      email: 'jean.dupont@email.com',
      simCard: 'active',
      subscriptionDate: '2023-05-20'
    },
    { 
      id: 2, 
      nom: 'Martin', 
      prenom: 'Sophie', 
      telephone: '0602030405',
      status: 'unpaid',
      lastPayment: '2023-12-15',
      address: '45 avenue des Champs-Élysées',
      email: 'sophie.martin@email.com',
      simCard: 'active',
      subscriptionDate: '2023-08-10'
    },
    { 
      id: 3, 
      nom: 'Bernard', 
      prenom: 'Michel', 
      telephone: '0603040506',
      status: 'blocked',
      lastPayment: '2023-11-20',
      address: '78 boulevard Saint-Michel',
      email: 'michel.bernard@email.com',
      simCard: 'lost',
      subscriptionDate: '2023-06-15'
    },
    { 
      id: 4, 
      nom: 'Petit', 
      prenom: 'Marie', 
      telephone: '0604050607',
      status: 'active',
      lastPayment: '2024-02-01',
      address: '15 rue de la République',
      email: 'marie.petit@email.com',
      simCard: 'active',
      subscriptionDate: '2023-09-05'
    },
    { 
      id: 5, 
      nom: 'Durand', 
      prenom: 'Pierre', 
      telephone: '0605060708',
      status: 'suspended',
      lastPayment: '2024-01-05',
      address: '92 rue du Commerce',
      email: 'pierre.durand@email.com',
      simCard: 'active',
      subscriptionDate: '2023-07-22'
    },
    { 
      id: 6, 
      nom: 'Moreau', 
      prenom: 'Claire', 
      telephone: '0606070809',
      status: 'active',
      lastPayment: '2024-02-05',
      address: '33 avenue Victor Hugo',
      email: 'claire.moreau@email.com',
      simCard: 'active',
      subscriptionDate: '2023-10-15'
    },
    { 
      id: 7, 
      nom: 'msa', 
      prenom: 'mohamadi', 
      telephone: '0639778600',
      status: 'unpaid',
      lastPayment: '2023-12-01',
      address: '17 rue des Lilas',
      email: 'thomas.lambert@email.com',
      simCard: 'active',
      subscriptionDate: '2023-11-30'
    },
    { 
      id: 8, 
      nom: 'Robert', 
      prenom: 'Emma', 
      telephone: '0608091011',
      status: 'active',
      lastPayment: '2024-01-28',
      address: '55 rue de la Paix',
      email: 'emma.robert@email.com',
      simCard: 'active',
      subscriptionDate: '2023-12-05'
    }
  ];

  const mockInvoices = [
    { 
      id: 1,
      clientId: 1,
      date: '2024-02-01',
      montant: '19.00',
      status: 'paid',
      numero: 'FAC-2024-002-001'
    },
    { 
      id: 2,
      clientId: 1,
      date: '2024-01-01',
      montant: '19.00',
      status: 'paid',
      numero: 'FAC-2024-001-001'
    },
    { 
      id: 3,
      clientId: 1,
      date: '2023-12-01',
      montant: '19.00',
      status: 'paid',
      numero: 'FAC-2023-012-001'
    },
    { 
      id: 4,
      clientId: 2,
      date: '2024-02-01',
      montant: '19.00',
      status: 'unpaid',
      numero: 'FAC-2024-002-002'
    },

  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 2) {
      const filteredClients = mockClients.filter(client => 
        client.telephone.includes(value) ||
        client.nom.toLowerCase().includes(value.toLowerCase()) ||
        client.prenom.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredClients);
    } else {
      setSearchResults([]);
    }
  };

  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleHistoryOpen = (client) => {
    setSelectedClient(client);
    setOpenHistoryModal(true);
    handleMenuClose();
  };

  const getStatusInfo = (client) => {
    const statusConfig = {
      active: {
        icon: <CheckCircleIcon color="success" />,
        label: 'Actif',
        chipColor: 'success'
      },
      blocked: {
        icon: <BlockIcon color="error" />,
        label: 'Bloqué',
        chipColor: 'error'
      },
      unpaid: {
        icon: <WarningIcon color="warning" />,
        label: 'Impayé',
        chipColor: 'warning'
      },
      suspended: {
        icon: <PauseCircleIcon color="info" />,
        label: 'Suspendu',
        chipColor: 'info'
      }
    };

    const simStatusConfig = {
      active: {
        icon: <SimCardIcon color="success" />,
        label: 'SIM Active'
      },
      lost: {
        icon: <SimCardIcon color="error" />,
        label: 'SIM Perdue'
      }
    };

    return {
      status: statusConfig[client.status] || statusConfig.active,
      simStatus: simStatusConfig[client.simCard] || simStatusConfig.active
    };
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Payée" color="success" size="small" />;
      case 'unpaid':
        return <Chip label="Impayée" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher par nom, prénom ou numéro de téléphone..."
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {searchTerm.length > 2 && (
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          {searchResults.length} résultat(s) trouvé(s)
        </Typography>
      )}

      {searchResults.length > 0 && (
        <Paper elevation={2} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {searchResults.map((client) => (
              <React.Fragment key={client.id}>
                <ListItem
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {client.nom} {client.prenom}
                            </Typography>
                            {getStatusInfo(client).status.icon}
                            <Chip 
                              size="small" 
                              label={getStatusInfo(client).status.label}
                              color={getStatusInfo(client).status.chipColor}
                            />
                            {getStatusInfo(client).simStatus.icon}
                            <Chip 
                              size="small" 
                              label={getStatusInfo(client).simStatus.label}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Tél: {client.telephone}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Email: {client.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Adresse: {client.address}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleHistoryOpen(client)}>
                        <HistoryIcon />
                      </IconButton>
                      <IconButton onClick={(e) => handleMenuOpen(e, client)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <CreditCardIcon sx={{ mr: 1 }} /> Régulariser
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SimCardIcon sx={{ mr: 1 }} /> Déclarer carte SIM perdue
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PauseCircleIcon sx={{ mr: 1 }} /> Demande de suspension
        </MenuItem>
      </Menu>

      {/* Modal Historique */}
      <Modal
        open={openHistoryModal}
        onClose={() => setOpenHistoryModal(false)}
        aria-labelledby="modal-history"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}>
          <Typography variant="h6" gutterBottom>
            Historique des factures - {selectedClient?.nom} {selectedClient?.prenom}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Facture</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.numero}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.montant} €</TableCell>
                  <TableCell>{getStatusChip(invoice.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Modal>
    </Box>
  );
};

export default ClientSearch;