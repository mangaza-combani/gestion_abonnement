import React, { useState } from 'react';
import { 
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Block as BlockIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import StatusChip from './StatusChip';
import {formatPaymentAndStatusToHumanReadable} from "../../utils/helper";

const ClientList = ({ clients, selectedClient, onClientSelect, isOrderView = false, action = null }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Déterminer si on doit afficher la colonne de raison de blocage
  const showBlockReason = action === 'block';

  return (
    <Card sx={{ flex: 1 }}>
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: isOrderView ? '15%' : (showBlockReason ? '15%' : '18%') }}>NOM</TableCell>
              <TableCell sx={{ width: isOrderView ? '15%' : (showBlockReason ? '15%' : '18%') }}>PRENOM</TableCell>
              {isOrderView && (
                <TableCell sx={{ width: '20%' }}>TELEPHONE</TableCell>
              )}
              <TableCell sx={{ width: isOrderView ? '15%' : (showBlockReason ? '12%' : '16%') }}>COMPTE RED</TableCell>
              <TableCell sx={{ width: isOrderView ? '17.5%' : (showBlockReason ? '15%' : '24%') }}>ETAT PAIEMENT</TableCell>
              <TableCell sx={{ width: isOrderView ? '17.5%' : (showBlockReason ? '15%' : '24%') }}>ETAT TÉLÉPHONE</TableCell>
              {showBlockReason && (
                <TableCell sx={{ width: '23%' }}>RAISON DU BLOCAGE</TableCell>
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
                onMouseEnter={() => setHoveredRow(client.id)}
                onMouseLeave={() => setHoveredRow(null)}
                sx={{ cursor: 'pointer', position: 'relative' }}
              >
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {client?.user?.lastname}
                    {/* Marqueur pour remplacement SIM vol/perte */}
                    {(client?.replacementReason === 'SIM_LOST_THEFT' || client?.trackingNotes?.includes('REMPLACEMENT SIM')) && (
                      <Tooltip title="Remplacement SIM - Vol/Perte">
                        <WarningIcon sx={{ color: 'error.main', fontSize: 16 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client?.user?.firstname}</TableCell>
                {isOrderView &&(
                        <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.phoneNumber || 'N/C'}</TableCell>
                )}
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client?.redAccountName || client?.redAccount?.accountName || client?.lineRequest?.redAccount?.accountName ? (
                    <Chip 
                      label={client?.redAccountName || client?.redAccount?.accountName || client?.lineRequest?.redAccount?.accountName}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                  ) : (client?.redAccountId || client?.lineRequest?.redAccountId) ? (
                    <Chip 
                      label={`Compte ${client?.redAccountId || client?.lineRequest?.redAccountId}`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <StatusChip status={formatPaymentAndStatusToHumanReadable(client.paymentStatus)} />
                </TableCell>
                <TableCell>
                  <StatusChip status={formatPaymentAndStatusToHumanReadable(client.phoneStatus)} />
                </TableCell>
                {showBlockReason && (
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.blockReasonLabel ? (
                      <Chip 
                        label={client.blockReasonLabel}
                        size="small"
                        color={
                          client.blockReason === 'PAUSE' ? 'warning' :
                          client.blockReason === 'SIM_LOST' ? 'error' :
                          client.blockReason === 'TERMINATION' ? 'secondary' :
                          'default'
                        }
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">N/A</Typography>
                    )}
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