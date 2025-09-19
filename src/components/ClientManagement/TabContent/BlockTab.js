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
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={dataToDisplay.length}
        hideFilters
      />
      
      {/* Compteur des lignes */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {dataToDisplay.length} ligne(s) à bloquer
        </Typography>
      </Box>


      {/* Tableaux séparés par compte RED */}
      <SeparatedTablesBlockList
        clients={dataToDisplay}
      />
    </Stack>
  );
};

export default BlockTab;