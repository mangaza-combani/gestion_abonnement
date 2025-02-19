import React from 'react';
import { 
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip 
} from '@mui/material';
import StatusChip from './StatusChip';

const ClientList = ({ clients, selectedClient, onClientSelect }) => {
  return (
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
            {clients.map((client) => (
              <TableRow
                key={client.id}
                hover
                selected={selectedClient?.id === client.id}
                onClick={() => onClientSelect(client)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{client.nom}</TableCell>
                <TableCell>{client.prenom}</TableCell>
                <TableCell>{client.telephone}</TableCell>
                <TableCell>
                  <StatusChip status={client.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ClientList;