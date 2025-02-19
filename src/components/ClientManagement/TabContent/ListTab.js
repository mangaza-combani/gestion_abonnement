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
  selectedClient,
  onClientSelect
}) => {
  return (
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={clients.length}
      />
      <StatusFilters
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />
      <ClientList
        clients={clients}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
      />
    </Stack>
  );
};

export default ListTab;