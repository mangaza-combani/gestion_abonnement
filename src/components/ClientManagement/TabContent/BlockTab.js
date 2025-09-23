import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import ClientSearch from '../ClientSearch';
import SeparatedTablesBlockList from '../SeparatedTablesBlockList';


const BlockTab = ({
  searchTerm,
  onSearchChange,
  clients,
  lines, // Nouvelle prop pour les lignes
  isLoading,
  selectedClient,
  onClientSelect
}) => {

  // Utiliser lines si disponible, sinon clients
  const dataToDisplay = lines || clients || []

  // Pas d'auto-sélection pour l'onglet À BLOQUER
  // Le superviseur doit manuellement sélectionner la ligne à traiter

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <ClientSearch
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          resultCount={dataToDisplay.length}
          hideFilters
        />
      </Box>

      {/* Compteur des lignes */}
      <Box sx={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          {dataToDisplay.length} ligne(s) à bloquer
        </Typography>
      </Box>

      {/* Tableaux séparés par compte RED */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <SeparatedTablesBlockList
          clients={dataToDisplay}
        />
      </Box>
    </Box>
  );
};

export default BlockTab;