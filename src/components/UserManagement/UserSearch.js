// src/components/UserManagement/UserSearch.js
import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const UserSearch = ({ 
  searchTerm, 
  onSearchChange, 
  resultCount, 
  selectedAgency, 
  onAgencyChange, 
  agencies 
}) => {
  const theme = useTheme();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 2,
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        },
        backgroundColor: alpha(theme.palette.primary.main, 0.02)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <SearchIcon color="primary" />
        <Typography variant="h6" color="text.primary">
          Recherche d'utilisateurs
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Rechercher un utilisateur"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
          InputProps={{
            startAdornment: <SearchIcon color="disabled" sx={{ mr: 1 }} />
          }}
        />

        <TextField
          select
          fullWidth
          label="Filtrer par agence"
          value={selectedAgency || ''}
          onChange={(e) => onAgencyChange(e.target.value || null)}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        >
          <MenuItem value="">
            <em>Toutes les agences</em>
          </MenuItem>
          {agencies.map((agency) => (
            <MenuItem key={agency.id} value={agency.name}>
              {agency.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box 
        sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Résultats : {resultCount} utilisateur(s)
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserSearch;