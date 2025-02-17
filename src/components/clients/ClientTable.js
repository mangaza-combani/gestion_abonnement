import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Block as BlockIcon,
  LockOpen as UnblockIcon,
  SimCard as SimCardIcon,
} from '@mui/icons-material';

const ClientTable = ({ clients = [], currentTab = 'list', onClientSelect = () => {}, onAction = () => {} }) => {
  const getStatusColor = (status) => {
    const colors = {
      'A JOUR': 'success',
      'EN RETARD': 'warning',
      'DETTE': 'error',
      'PAUSE': 'info',
      'RESILIE': 'default'
    };
    return colors[status] || 'default';
  };

  const getActionButton = (client) => {
    const handleAction = (e, action) => {
      e.stopPropagation();
      onAction(client, action);
    };

    switch (currentTab) {
      case 'unblock':
        return (
          <Tooltip title="Débloquer la ligne">
            <IconButton 
              color="success"
              onClick={(e) => handleAction(e, 'unblock')}
              size="small"
            >
              <UnblockIcon />
            </IconButton>
          </Tooltip>
        );
      case 'block':
        return (
          <Tooltip title="Bloquer la ligne">
            <IconButton 
              color="error"
              onClick={(e) => handleAction(e, 'block')}
              size="small"
            >
              <BlockIcon />
            </IconButton>
          </Tooltip>
        );
      case 'order':
        return (
          <Tooltip title="Commander une carte SIM">
            <IconButton 
              color="primary"
              onClick={(e) => handleAction(e, 'order')}
              size="small"
            >
              <SimCardIcon />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  if (!Array.isArray(clients) || clients.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Aucun client trouvé
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Compte</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id}
              hover
              onClick={() => onClientSelect(client)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    {client.prenom?.[0]}{client.nom?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {client.nom} {client.prenom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dernier paiement: {client.lastPayment || 'Non disponible'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{client.telephone}</TableCell>
              <TableCell>
                <Chip 
                  label={client.status}
                  color={getStatusColor(client.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption">
                  {client.compte}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {getActionButton(client)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientTable;