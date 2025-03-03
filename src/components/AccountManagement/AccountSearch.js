import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Typography, 
  Stack, 
  Chip,
  Paper,
  Collapse,
  Tooltip,
  IconButton,
  Divider,
  Fade,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Business as BusinessIcon,
  FilterAlt as FilterAltIcon,
  Close as CloseIcon,
  Tune as TuneIcon
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
  const theme = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleStatusChange = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    // Ici vous pouvez implémenter la logique de filtre par statut
  };

  const getAgencyChipColor = (agencyId) => {
    // Attribue une couleur unique à chaque agence pour faciliter l'identification visuelle
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    return colors[agencyId % colors.length];
  };
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher par nom ou login"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => onSearchChange('')}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          />
          <Tooltip title="Filtres avancés">
            <IconButton
              color={showAdvanced ? 'primary' : 'default'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{ 
                transition: 'transform 0.2s',
                transform: showAdvanced ? 'rotate(180deg)' : 'none'
              }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {resultCount} compte{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
          </Typography>
          {selectedAgency && (
            <Fade in={selectedAgency !== null}>
              <Chip
                icon={<BusinessIcon fontSize="small" />}
                label={agencies.find(a => a.id === selectedAgency)?.name || 'Agence'}
                size="small"
                color="primary"
                onDelete={() => onAgencyChange(null)}
                variant="outlined"
              />
            </Fade>
          )}
        </Box>
      </Box>

      {/* Filtres avancés avec animation */}
      <Collapse in={showAdvanced}>
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon fontSize="small" />
            Filtres
          </Typography>
          
          {/* Filtres par statut */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Statut du compte
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Tooltip title="Comptes actifs">
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Actif"
                  variant={selectedStatus === 'ACTIF' ? 'filled' : 'outlined'}
                  color="success"
                  size="small"
                  onClick={() => handleStatusChange('ACTIF')}
                  sx={{ m: 0.5 }}
                />
              </Tooltip>
              <Tooltip title="Comptes inactifs">
                <Chip
                  icon={<WarningIcon />}
                  label="Inactif"
                  variant={selectedStatus === 'INACTIF' ? 'filled' : 'outlined'}
                  color="warning"
                  size="small"
                  onClick={() => handleStatusChange('INACTIF')}
                  sx={{ m: 0.5 }}
                />
              </Tooltip>
              <Tooltip title="Comptes bloqués">
                <Chip
                  icon={<BlockIcon />}
                  label="Bloqué"
                  variant={selectedStatus === 'BLOQUÉ' ? 'filled' : 'outlined'}
                  color="error"
                  size="small"
                  onClick={() => handleStatusChange('BLOQUÉ')}
                  sx={{ m: 0.5 }}
                />
              </Tooltip>
            </Stack>
          </Box>

          {/* Filtres par agence avec agences groupées */}
          {agencies.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Agences
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Tooltip title="Afficher toutes les agences">
                  <Chip
                    icon={<BusinessIcon />}
                    label="Toutes"
                    onClick={() => onAgencyChange(null)}
                    variant={selectedAgency === null ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                </Tooltip>
                {agencies.map((agency) => (
                  <Tooltip key={agency.id} title={`Afficher uniquement ${agency.name}`}>
                    <Chip
                      icon={<BusinessIcon />}
                      label={agency.name}
                      onClick={() => onAgencyChange(agency.id)}
                      variant={selectedAgency === agency.id ? 'filled' : 'outlined'}
                      color={getAgencyChipColor(agency.id)}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AccountSearch;