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
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{
        flexShrink: 0,
        display: 'flex',
        gap: 2,
        mb: 2,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
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
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ClientList
          clients={dataToDisplay}
          selectedClient={selectedClient}
          onClientSelect={onClientSelect}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
};

export default ListTab;