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
import SimReplacementReceivedButton from './SimReplacementReceivedButton';
import OrderSimButton from './OrderSimButton'; // 🆕 BOUTON COMMANDER SIM
import RequestActivationButton from './RequestActivationButton'; // 🆕 BOUTON DEMANDE ACTIVATION

// Fonction pour obtenir la couleur du statut de ligne
const getPhoneStatusColor = (phoneStatus) => {
  switch (phoneStatus) {
    case 'ACTIVE':
      return 'success';
    case 'NEEDS_TO_BE_ACTIVATED':
      return 'warning';
    case 'NEEDS_TO_BE_ORDERED':
      return 'info';
    case 'BLOCKED':
    case 'NEEDS_TO_BE_DEACTIVATED':
      return 'error';
    case 'PAUSED':
      return 'secondary';
    default:
      return 'default';
  }
};

// Fonction pour obtenir la couleur du statut de paiement
const getPaymentStatusColor = (paymentStatus) => {
  switch (paymentStatus) {
    case 'À JOUR':
    case 'PAID':
      return 'success';
    case 'OVERDUE':
    case 'EN RETARD':
      return 'warning';
    case 'TO_BLOCK':
    case 'BLOCKED_NONPAYMENT':
      return 'error';
    case 'PENDING_PAYMENT':
      return 'info';
    case 'UNATTRIBUTED':
      return 'secondary';
    default:
      return 'default';
  }
};

// Fonction pour formater les statuts pour l'affichage
const formatPhoneStatus = (phoneStatus) => {
  switch (phoneStatus) {
    case 'ACTIVE':
      return 'ACTIF';
    case 'NEEDS_TO_BE_ACTIVATED':
      return 'À ACTIVER';
    case 'NEEDS_TO_BE_ORDERED':
      return 'À COMMANDER';
    case 'BLOCKED':
      return 'BLOQUÉ';
    case 'NEEDS_TO_BE_DEACTIVATED':
      return 'À DÉSACTIVER';
    case 'PAUSED':
      return 'EN PAUSE';
    default:
      return phoneStatus || 'N/A';
  }
};

const formatPaymentStatus = (paymentStatus) => {
  switch (paymentStatus) {
    case 'À JOUR':
    case 'PAID':
      return 'À JOUR';
    case 'OVERDUE':
      return 'EN RETARD';
    case 'TO_BLOCK':
      return 'À BLOQUER';
    case 'BLOCKED_NONPAYMENT':
      return 'BLOQUÉ IMPAYÉ';
    case 'PENDING_PAYMENT':
      return 'EN ATTENTE';
    case 'UNATTRIBUTED':
      return 'NON ATTRIBUÉ';
    default:
      return paymentStatus || 'N/A';
  }
};

const ClientList = ({ clients, selectedClient, onClientSelect, isOrderView = false, action = null }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Déterminer si on doit afficher la colonne de raison de blocage
  const showBlockReason = action === 'block';

  // Déterminer si on doit afficher la colonne action pour l'onglet activate
  const showActivateActions = action === 'activate';

  // 🆕 Déterminer si on doit afficher les actions pour l'onglet liste des lignes
  const showListActions = action === 'list' || action === 'ALL_LINES';

  return (
    <Card sx={{ flex: 1 }}>
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: isOrderView ? '20%' : (showBlockReason ? '20%' : (showActivateActions ? '18%' : '20%')) }}>NOM</TableCell>
              <TableCell sx={{ width: isOrderView ? '20%' : (showBlockReason ? '20%' : (showActivateActions ? '18%' : '20%')) }}>PRENOM</TableCell>
              {isOrderView && (
                <TableCell sx={{ width: '15%' }}>TELEPHONE</TableCell>
              )}
              <TableCell sx={{ width: isOrderView ? '15%' : (showBlockReason ? '15%' : (showActivateActions ? '16%' : '20%')) }}>COMPTE RED</TableCell>
              <TableCell sx={{ width: '15%' }}>STATUT LIGNE</TableCell>
              <TableCell sx={{ width: '15%' }}>STATUT PAIEMENT</TableCell>
              {showBlockReason && (
                <TableCell sx={{ width: '15%' }}>RAISON DU BLOCAGE</TableCell>
              )}
              {showActivateActions && (
                <TableCell sx={{ width: '18%' }}>ACTION</TableCell>
              )}
              {showListActions && (
                <TableCell sx={{ width: '18%' }}>ACTION</TableCell>
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
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  }
                }}
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
                {/* Statut de ligne */}
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Chip
                    label={formatPhoneStatus(client?.phoneStatus)}
                    size="small"
                    color={getPhoneStatusColor(client?.phoneStatus)}
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      minWidth: 'fit-content'
                    }}
                  />
                </TableCell>
                {/* Statut de paiement */}
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Chip
                    label={formatPaymentStatus(client?.paymentStatus)}
                    size="small"
                    color={getPaymentStatusColor(client?.paymentStatus)}
                    variant="filled"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      minWidth: 'fit-content'
                    }}
                  />
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
                {showActivateActions && (
                  <TableCell sx={{ padding: '4px 8px' }}>
                    <SimReplacementReceivedButton
                      client={client}
                      disabled={false}
                      size="small"
                    />
                  </TableCell>
                )}
                {showListActions && (
                  <TableCell sx={{ padding: '4px 8px' }}>
                    {/* 🆕 Logique pour afficher le bon bouton selon le cas */}
                    {client?.isPausedForLostSim && (
                      <OrderSimButton
                        client={client}
                        size="small"
                      />
                    )}
                    {client?.canRequestActivation && (
                      <RequestActivationButton
                        client={client}
                        size="small"
                      />
                    )}
                    {/* Si aucun cas spécial, pas de bouton */}
                    {!client?.isPausedForLostSim && !client?.canRequestActivation && (
                      <Typography variant="caption" color="text.secondary">
                        Aucune action disponible
                      </Typography>
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