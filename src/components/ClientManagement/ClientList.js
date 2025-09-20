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
              <TableCell sx={{ width: showBlockReason ? '25%' : (showActivateActions ? '23%' : '25%') }}>NOM</TableCell>
              <TableCell sx={{ width: '18%' }}>TELEPHONE</TableCell>
              <TableCell sx={{ width: showBlockReason ? '12%' : (showActivateActions ? '13%' : '14%') }}>COMPTE RED</TableCell>
              <TableCell sx={{ width: '13%' }}>STATUT LIGNE</TableCell>
              <TableCell sx={{ width: '13%' }}>STATUT PAIEMENT</TableCell>
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
                selected={(() => {
                  // Logique de sélection plus robuste pour gérer différentes structures
                  const selectedId = selectedClient?.id || selectedClient?.user?.id;
                  const clientId = client?.id || client?.user?.id;
                  const isSelected = selectedId === clientId;

                  // Debug pour comprendre les structures
                  if (client.id && client.id.toString().includes('1')) {
                    console.log('🔍 Selection debug:', {
                      selectedClient,
                      client,
                      selectedId,
                      clientId,
                      isSelected
                    });
                  }

                  return isSelected;
                })()}
                onClick={() => {
                  console.log('🔄 Client clicked:', client);
                  onClientSelect(client);
                }}
                onMouseEnter={() => setHoveredRow(client.id)}
                onMouseLeave={() => setHoveredRow(null)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  '&.Mui-selected': {
                    backgroundColor: '#2196f3 !important',
                    color: 'white !important',
                    border: '2px solid #1976d2 !important',
                    '& .MuiTableCell-root': {
                      color: 'white !important',
                      backgroundColor: 'transparent !important',
                    },
                    '& .MuiChip-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
                      color: 'white !important',
                      borderColor: 'rgba(255, 255, 255, 0.4) !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    }
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:hover:not(.Mui-selected)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {client?.user?.lastname} {client?.user?.firstname}
                    </Typography>
                    {/* Marqueur pour remplacement SIM vol/perte */}
                    {(client?.replacementReason === 'SIM_LOST_THEFT' || client?.trackingNotes?.includes('REMPLACEMENT SIM')) && (
                      <Tooltip title="Remplacement SIM - Vol/Perte">
                        <WarningIcon sx={{ color: 'error.main', fontSize: 16 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.phoneNumber || client?.user?.phoneNumber || 'N/C'}
                </TableCell>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(() => {
                    // Le nom du compte RED est dans redAccountId, pas dans accountName
                    const accountName = client?.redAccountName ||
                                      client?.redAccount?.redAccountId ||
                                      client?.redAccount?.accountName ||
                                      client?.lineRequest?.redAccount?.redAccountId ||
                                      client?.lineRequest?.redAccount?.accountName;

                    return (
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                        {accountName || 'N/A'}
                      </Typography>
                    );
                  })()}
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
                      minWidth: 'fit-content',
                      ...((() => {
                        const selectedId = selectedClient?.id || selectedClient?.user?.id;
                        const clientId = client?.id || client?.user?.id;
                        const isSelected = selectedId === clientId;
                        return isSelected ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.9) !important',
                          color: '#2196f3 !important',
                          borderColor: 'rgba(255, 255, 255, 0.8) !important',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)'
                        } : {};
                      })())
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
                      minWidth: 'fit-content',
                      ...((() => {
                        const selectedId = selectedClient?.id || selectedClient?.user?.id;
                        const clientId = client?.id || client?.user?.id;
                        const isSelected = selectedId === clientId;
                        return isSelected ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.9) !important',
                          color: '#2196f3 !important',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)'
                        } : {};
                      })())
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