import React from 'react';
import { Chip } from '@mui/material';
import {
  Circle as CircleIcon,
  AccountBalanceWallet as PaymentIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { CLIENT_STATUSES } from './constant'; // Assurez-vous que le chemin est correct

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case CLIENT_STATUSES.UP_TO_DATE: // 'A JOUR'
        return 'success';
      case CLIENT_STATUSES.OVERDUE: // 'EN RETARD'
        return 'warning';
      case CLIENT_STATUSES.SUSPENDED: // 'DETTE'
        return 'error';
      case CLIENT_STATUSES.TERMINATED: // 'RÉSILIÉ'
        return 'default';
      case CLIENT_STATUSES.NEEDS_TO_BE_ACTIVATED: // 'A ACTIVER'
        return 'primary';
      case CLIENT_STATUSES.NEEDS_TO_BE_DEACTIVATED: // 'A DESACTIVER'
        return 'error';
      case CLIENT_STATUSES.NEEDS_TO_BE_REPLACED: // 'A REMPLACER'
        return 'info';
      case CLIENT_STATUSES.NEEDS_TO_BE_ORDERED: // 'A COMMANDER'
        return 'warning';
      case CLIENT_STATUSES.TEMPORARILY_ASSIGNED: // 'ATTRIBUÉ TEMPORAIREMENT'
        return 'info';
      case CLIENT_STATUSES.ACTIVE: // 'ACTIF'
        return 'success';
      case CLIENT_STATUSES.INACTIVE: // 'INACTIF'
        return 'default';
      case CLIENT_STATUSES.CANCELLED: // 'ANNULÉ'
        return 'error';
      case CLIENT_STATUSES.UNATTRIBUTED: // 'NON ATTRIBUÉ'
        return 'default';
      case CLIENT_STATUSES.REIMBURSED: // 'REMBOURSÉ'
        return 'warning';
      case CLIENT_STATUSES.REFUNDED: // 'REMBOURSEMENT'
        return 'info';
      case CLIENT_STATUSES.DISPUTED: // 'CONTESTÉ'
        return 'warning';
      case CLIENT_STATUSES.CHARGEBACK: // 'CHARGEBACK'
        return 'error';
      case CLIENT_STATUSES.FRAUDULENT: // 'FRAUDULEUX'
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    // Icônes pour les statuts de paiement
    if (status === 'À JOUR' || status === 'A JOUR') {
      return <PaymentIcon fontSize="small" />;
    }
    if (status === 'EN RETARD' || status === 'DETTE') {
      return <PaymentIcon fontSize="small" />;
    }

    // Icônes pour les statuts de ligne/téléphone
    if (status === 'ACTIF') {
      return <PhoneIcon fontSize="small" />;
    }
    if (status === 'INACTIF') {
      return <PhoneIcon fontSize="small" />;
    }
    if (status === 'RÉSILIÉ') {
      return <BlockIcon fontSize="small" />;
    }
    if (status === 'PAUSE' || status === 'PAUSÉ') {
      return <PauseIcon fontSize="small" />;
    }

    // Icône par défaut
    return <CircleIcon fontSize="small" />;
  };

  return (
      <Chip
          size="small"
          label={status}
          color={getStatusColor(status)}
          icon={getStatusIcon(status)}
      />
  );
};

export default StatusChip;
