import React from 'react';
import { Box, TextField, InputAdornment, Typography } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ClientSearch = ({ searchTerm, onSearchChange, resultCount }) => {
  return (
    <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
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
        <Typography variant="body2" color="text.secondary">
          {resultCount} résultat(s)
        </Typography>
      </Box>
    </Box>
  );
};

export default ClientSearch;