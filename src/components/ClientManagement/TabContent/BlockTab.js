import React from 'react';
import { Stack } from '@mui/material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';

const BlockTab = ({
  searchTerm,
  onSearchChange,
  clients,
  selectedClient,
  onClientSelect
}) => {
  return (
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={clients.length}
        hideFilters
      />
      <ClientList
        clients={clients}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        action="block"
      />
    </Stack>
  );
};

export default BlockTab;