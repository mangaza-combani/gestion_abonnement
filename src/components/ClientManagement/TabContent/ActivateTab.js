import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';

const ActivateTab = ({
  searchTerm,
  onSearchChange,
  clients,
  selectedClient,
  onClientSelect
}) => {
  useEffect(() => {
    onClientSelect(clients[0]);
  }, []);

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
        action="activate"
      />
    </Stack>
  );
};

export default ActivateTab;