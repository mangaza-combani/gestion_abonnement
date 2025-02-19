import React from 'react';
import { Chip } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'A JOUR': return 'success';
      case 'EN RETARD': return 'warning';
      case 'DETTE': return 'error';
      case 'PAUSE': return 'info';
      default: return 'default';
    }
  };

  return (
    <Chip
      size="small"
      label={status}
      color={getStatusColor(status)}
      icon={<CircleIcon fontSize="small" />}
    />
  );
};

export default StatusChip;