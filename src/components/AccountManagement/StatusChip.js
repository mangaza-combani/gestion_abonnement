import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Block as BlockIcon
} from '@mui/icons-material';

const StatusChip = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'A JOUR':
        return { 
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />,
          label: 'A JOUR'
        };
      case 'EN RETARD':
        return { 
          color: 'warning',
          icon: <WarningIcon fontSize="small" />,
          label: 'EN RETARD'
        };
      case 'DETTE':
        return { 
          color: 'error',
          icon: <ErrorIcon fontSize="small" />,
          label: 'DETTE'
        };
      case 'PAUSE':
      case 'INACTIF':
        return { 
          color: 'info',
          icon: <PauseIcon fontSize="small" />,
          label: status
        };
      case 'RÉSILIÉ':
      case 'BLOQUÉ':
        return { 
          color: 'error',
          icon: <BlockIcon fontSize="small" />,
          label: status
        };
      case 'ACTIF':
        return { 
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />,
          label: 'ACTIF'
        };
      default:
        return { 
          color: 'default',
          icon: null,
          label: status
        };
    }
  };

  const { color, icon, label } = getStatusConfig();

  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size="small"
    />
  );
};

export default StatusChip;