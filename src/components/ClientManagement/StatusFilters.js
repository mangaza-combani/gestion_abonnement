import React from 'react';
import { Stack, Chip } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { CLIENT_STATUSES } from './constant';

const StatusFilters = ({ selectedStatus, onStatusChange }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case CLIENT_STATUSES.UP_TO_DATE:
        return <CheckCircleIcon fontSize="small" />;
      case CLIENT_STATUSES.LATE:
        return <WarningIcon fontSize="small" />;
      case CLIENT_STATUSES.DEBT:
        return <ErrorIcon fontSize="small" />;
      case CLIENT_STATUSES.PAUSED:
        return <PauseIcon fontSize="small" />;
      case CLIENT_STATUSES.TERMINATED:
        return <BlockIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case CLIENT_STATUSES.UP_TO_DATE:
        return 'success';
      case CLIENT_STATUSES.LATE:
        return 'warning';
      case CLIENT_STATUSES.DEBT:
        return 'error';
      case CLIENT_STATUSES.PAUSED:
        return 'info';
      case CLIENT_STATUSES.TERMINATED:
        return 'default';
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
            onClick={() => onStatusChange(status)}
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