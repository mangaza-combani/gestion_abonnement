import React from 'react';
import { Stack } from '@mui/material';
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
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={dataToDisplay?.length}
      />
      <StatusFilters
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />
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