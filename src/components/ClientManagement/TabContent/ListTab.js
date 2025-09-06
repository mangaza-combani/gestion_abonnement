import React from 'react';
import { Stack, Box } from '@mui/material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';
import StatusFilters from '../StatusFilters';

const ListTab = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  clients,
  lines, // Nouvelle prop pour les lignes
  isLoading,
  selectedClient,
  onClientSelect,
  setCurrentTab,
  currentTab,
  tabs
}) => {

  // Utiliser lines si disponible, sinon clients
  const dataToDisplay = lines || clients || []
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: '1200px' }}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
          <ClientSearch 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            resultCount={dataToDisplay?.length}
          />
        </Box>
        <Box sx={{ flex: '1 1 600px', minWidth: '600px' }}>
          <StatusFilters
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
          />
        </Box>
      </Stack>
      <ClientList
        clients={dataToDisplay}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        isLoading={isLoading}
      />
    </Stack>
  );
};

export default ListTab;