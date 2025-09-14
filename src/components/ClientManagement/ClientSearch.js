import React from 'react';
import { Box, TextField, InputAdornment, Typography, Stack, Chip } from '@mui/material';
import { 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Block as BlockIcon
} from '@mui/icons-material';

import { CLIENT_STATUSES } from './constant';

const ClientSearch = ({
    searchTerm,
    onSearchChange,
    resultCount,
    selectedStatus,
    onStatusChange,
    hideFilters = false,
    selectedFilter,
    onFilterChange,
    filterOptions = []
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'A JOUR':
        return <CheckCircleIcon fontSize="small" />;
      case 'EN RETARD':
        return <WarningIcon fontSize="small" />;
      case 'DETTE':
        return <ErrorIcon fontSize="small" />;
      case 'PAUSE':
        return <PauseIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'A JOUR':
        return 'success';
      case 'EN RETARD':
        return 'warning';
      case 'DETTE':
        return 'error';
      case 'PAUSE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Recherche par Nom ou Prénom ou Téléphone"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {resultCount} résultat(s)
          </Typography>
        </Box>

        {/* Filtres pour la vue commande */}
        {!hideFilters && filterOptions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filterOptions.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                onClick={() => onFilterChange(filter.value)}
                color={selectedFilter === filter.value ? 'primary' : 'default'}
                variant={selectedFilter === filter.value ? 'filled' : 'outlined'}
                size="small"
                icon={filter.icon}
              />
            ))}
          </Box>
        )}

      </Stack>
    </Box>
  );
};

export default ClientSearch;