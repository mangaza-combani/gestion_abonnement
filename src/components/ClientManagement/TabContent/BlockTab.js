import React,{useEffect} from 'react';
import { Stack } from '@mui/material';
import ClientSearch from '../ClientSearch';
import ClientList from '../ClientList';


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

  useEffect(()=>{
    if (dataToDisplay && dataToDisplay.length > 0 && !selectedClient) {
      const timer = setTimeout(() => {
        onClientSelect(dataToDisplay[0]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dataToDisplay?.length, selectedClient])
  
  return (
    <Stack spacing={2}>
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        resultCount={dataToDisplay.length}
        hideFilters
      />
      <ClientList
        clients={dataToDisplay}
        selectedClient={selectedClient}
        onClientSelect={onClientSelect}
        action="block"
        isLoading={isLoading}
      />
    </Stack>
  );
};

export default BlockTab;