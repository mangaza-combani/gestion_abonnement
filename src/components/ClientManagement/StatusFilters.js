import React from 'react';
import { Stack, Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Pause as PauseIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  SwapHoriz as SwapHorizIcon,
  AttachMoney as AttachMoneyIcon,
  Replay as ReplayIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { CLIENT_STATUSES } from './constant';
import { getKeyFromValue } from "../../utils/helper";

const StatusFilters = ({ selectedStatus, onStatusChange }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case CLIENT_STATUSES.UP_TO_DATE:
        return <CheckCircleIcon fontSize="small" />;
      case CLIENT_STATUSES.OVERDUE:
        return <WarningIcon fontSize="small" />;
      case CLIENT_STATUSES.SUSPENDED:
        return <PauseIcon fontSize="small" />;
      case CLIENT_STATUSES.TERMINATED:
        return <BlockIcon fontSize="small" />;
      case CLIENT_STATUSES.NEEDS_TO_BE_ACTIVATED:
        return <PlayArrowIcon fontSize="small" />;
      case CLIENT_STATUSES.NEEDS_TO_BE_DEACTIVATED:
        return <StopIcon fontSize="small" />;
      case CLIENT_STATUSES.NEEDS_TO_BE_REPLACED:
        return <RefreshIcon fontSize="small" />;
      case CLIENT_STATUSES.NEEDS_TO_BE_ORDERED:
        return <ShoppingCartIcon fontSize="small" />;
      case CLIENT_STATUSES.ACTIVE:
        return <CheckIcon fontSize="small" />;
      case CLIENT_STATUSES.INACTIVE:
        return <CloseIcon fontSize="small" />;
      case CLIENT_STATUSES.CANCELLED:
        return <CloseIcon fontSize="small" />;
      case CLIENT_STATUSES.UNATTRIBUTED:
        return <HelpIcon fontSize="small" />;
      case CLIENT_STATUSES.REIMBURSED:
        return <AttachMoneyIcon fontSize="small" />;
      case CLIENT_STATUSES.REFUNDED:
        return <ReplayIcon fontSize="small" />;
      case CLIENT_STATUSES.DISPUTED:
        return <GavelIcon fontSize="small" />;
      case CLIENT_STATUSES.CHARGEBACK:
        return <SwapHorizIcon fontSize="small" />;
      case CLIENT_STATUSES.FRAUDULENT:
        return <SecurityIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case CLIENT_STATUSES.UP_TO_DATE:
        return 'success';
      case CLIENT_STATUSES.OVERDUE:
        return 'warning';
      case CLIENT_STATUSES.SUSPENDED:
        return 'info';
      case CLIENT_STATUSES.TERMINATED:
        return 'default';
      case CLIENT_STATUSES.NEEDS_TO_BE_ACTIVATED:
        return 'primary';
      case CLIENT_STATUSES.NEEDS_TO_BE_DEACTIVATED:
        return 'secondary';
      case CLIENT_STATUSES.NEEDS_TO_BE_REPLACED:
        return 'info';
      case CLIENT_STATUSES.NEEDS_TO_BE_ORDERED:
        return 'warning';
      case CLIENT_STATUSES.ACTIVE:
        return 'success';
      case CLIENT_STATUSES.INACTIVE:
        return 'default';
      case CLIENT_STATUSES.CANCELLED:
        return 'error';
      case CLIENT_STATUSES.UNATTRIBUTED:
        return 'default';
      case CLIENT_STATUSES.REIMBURSED:
        return 'success';
      case CLIENT_STATUSES.REFUNDED:
        return 'info';
      case CLIENT_STATUSES.DISPUTED:
        return 'warning';
      case CLIENT_STATUSES.CHARGEBACK:
        return 'error';
      case CLIENT_STATUSES.FRAUDULENT:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
            label={CLIENT_STATUSES.ALL}
            onClick={() => onStatusChange(CLIENT_STATUSES.ALL)}
            variant={selectedStatus === CLIENT_STATUSES.ALL ? 'filled' : 'outlined'}
            color={selectedStatus === CLIENT_STATUSES.ALL ? 'primary' : 'default'}
        />
        {Object.values(CLIENT_STATUSES)
            .filter(status => status !== CLIENT_STATUSES.ALL)
            .map((status) => (
                <Chip
                    key={status}
                    label={status}
                    icon={getStatusIcon(status)}
                    onClick={() => onStatusChange(getKeyFromValue(CLIENT_STATUSES, status))}
                    variant={selectedStatus === status ? 'filled' : 'outlined'}
                    color={getStatusColor(status)}
                    sx={{
                      '&:hover': {
                        backgroundColor: selectedStatus === status ? undefined : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                />
            ))}
      </Stack>
  );
};

export default StatusFilters;
