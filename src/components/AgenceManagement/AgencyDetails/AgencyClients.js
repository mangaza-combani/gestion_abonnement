// src/components/agencies/AgencyDetails/AgencyClients.jsx
import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Paper,
  Box,
  Chip
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const AgencyClients = ({ clients }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell align="right">Dette</TableCell>
            <TableCell align="center">Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle2">{client.name}</Typography>
              </TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell align="right">
                {client.debt > 0 ? `${client.debt}€` : '0€'}
              </TableCell>
              <TableCell align="center">
                {client.debt > 0 ? (
                  <Chip 
                    icon={<WarningIcon />} 
                    label="Dette" 
                    color="error" 
                    size="small" 
                  />
                ) : (
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label="À jour" 
                    color="success" 
                    size="small" 
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {clients.length === 0 && (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary">
            Aucun client
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default AgencyClients;