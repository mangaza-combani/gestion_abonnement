import React from 'react';
import { Box, TextField, InputAdornment, Typography, Stack, Chip } from '@mui/material';
import { 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

// Statuts possibles pour les comptes
export const ACCOUNT_STATUSES = {
  ALL: 'TOUS',
  ACTIVE: 'ACTIF',
  INACTIVE: 'INACTIF',
  BLOCKED: 'BLOQUÉ'
};

const AccountSearch = ({ 
  searchTerm, 
  onSearchChange, 
  resultCount,
  selectedAgency,
  onAgencyChange,
  agencies = [] // Liste des agences disponibles
}) => {
  
  return (
    <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Recherche par Nom de Compte ou Login"
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
            {resultCount} compte(s)
          </Typography>
        </Box>

        {/* Filtres par agence (si nécessaire) */}
        {agencies.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Toutes les agences"
              onClick={() => onAgencyChange(null)}
              variant={selectedAgency === null ? 'filled' : 'outlined'}
              color="primary"
            />
            {agencies.map((agency) => (
              <Chip
                key={agency.id}
                label={agency.name}
                onClick={() => onAgencyChange(agency.id)}
                variant={selectedAgency === agency.id ? 'filled' : 'outlined'}
                color="primary"
              />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default AccountSearch;