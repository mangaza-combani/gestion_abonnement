import React, { useEffect, useState } from 'react';
import { Stack, Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { ViewList as ListViewIcon, AccountTree as GroupViewIcon } from '@mui/icons-material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import GroupedBlockList from '../GroupedBlockList';


const BlockTab = ({
  searchTerm,
  onSearchChange,
  clients,
  lines, // Nouvelle prop pour les lignes
  isLoading,
  selectedClient,
  onClientSelect
}) => {
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' ou 'list'

  // Utiliser lines si disponible, sinon clients
  const dataToDisplay = lines || clients || []

  // Pas d'auto-sélection pour l'onglet À BLOQUER
  // Le superviseur doit manuellement sélectionner la ligne à traiter
  
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={dataToDisplay.length}
        hideFilters
      />
      
      {/* Sélecteur de vue */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {dataToDisplay.length} ligne(s) à bloquer
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="grouped" aria-label="vue groupée">
            <GroupViewIcon sx={{ mr: 1 }} />
            Par compte
          </ToggleButton>
          <ToggleButton value="list" aria-label="vue liste">
            <ListViewIcon sx={{ mr: 1 }} />
            Liste détaillée
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Affichage selon le mode sélectionné */}
      {viewMode === 'grouped' ? (
        <GroupedBlockList
          clients={dataToDisplay}
          selectedClient={selectedClient}
          onClientSelect={onClientSelect}
        />
      ) : (
        <ClientList
          clients={dataToDisplay}
          selectedClient={selectedClient}
          onClientSelect={onClientSelect}
          action="block"
          isLoading={isLoading}
        />
      )}
    </Stack>
  );
};

export default BlockTab;