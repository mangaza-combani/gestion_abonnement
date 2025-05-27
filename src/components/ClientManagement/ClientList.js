import React from 'react';
import { 
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip 
} from '@mui/material';
import StatusChip from './StatusChip';
import {formatPaymentAndStatusToHumanReadable} from "../../utils/helper";

const ClientList = ({ clients, selectedClient, onClientSelect, isOrderView = false }) => {

  return (
    <Card sx={{ flex: 1 }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>NOM</TableCell>
              <TableCell>PRENOM</TableCell>
              {isOrderView &&(
                <TableCell>TELEPHONE</TableCell>
              )}
            
              <TableCell>ETAT PAIEMENT</TableCell>
              <TableCell>ETAT TÉLÉPHONE</TableCell>
              {!isOrderView && (
                <TableCell>ACTION</TableCell>
              )}

            </TableRow>
          </TableHead>
          <TableBody>
            {clients?.map((client) => (
              <TableRow
                key={client.id}
                hover
                selected={selectedClient?.id === client?.user?.id}
                onClick={() => onClientSelect(client)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{client?.user?.lastname}</TableCell>
                <TableCell>{client?.user?.firstname}</TableCell>
                {isOrderView &&(
                        <TableCell>{client.phoneNumber || 'N/C'}</TableCell>
                )}
                <TableCell>
                  <StatusChip status={formatPaymentAndStatusToHumanReadable(client.paymentStatus)} />
                </TableCell>
                <TableCell>
                  <StatusChip status={formatPaymentAndStatusToHumanReadable(client.phoneStatus)} />
                </TableCell>
                {!isOrderView &&(
                           <TableCell>
                          
                         </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ClientList;