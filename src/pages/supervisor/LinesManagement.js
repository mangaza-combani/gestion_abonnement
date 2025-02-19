import React, { useState } from 'react';
import { Box ,Tabs, Tab} from '@mui/material';
import { TAB_TYPES, CLIENT_STATUSES, ORDER_FILTERS } from '../../components/ClientManagement/constant';
import ListTab from '../../components/ClientManagement/TabContent/ListTab';
import BlockTab from '../../components/ClientManagement/TabContent//BlockTab';
import UnblockTab from '../../components/ClientManagement/TabContent/UnblockTab';
import OrderTab from '../../components/ClientManagement/TabContent/OrderTab';
import ClientDetails from '../../components/ClientManagement/ClientDetails';
import ClientActions from '../../components/ClientManagement/ClientActions';

// Mock data
const mockClients = [
  { 
    id: 1,
    nom: 'ABDOU',
    prenom: 'Celine',
    telephone: '0639666363',
    status: 'A JOUR',
    compte: 'ABDOU.CELINE',
    email: 'celine.abdou@email.com'
  },
  { 
    id: 2,
    nom: 'ABDOU',
    prenom: 'Omar',
    telephone: '0634466363',
    status: 'EN RETARD',
    compte: 'ABDOU.OMAR',
    email: 'omar.abdou@email.com'
  },
  {
    id: 3,
    nom: 'SAID',
    prenom: 'Marie',
    telephone: '0634466364',
    status: 'DETTE',
    compte: 'SAID.MARIE',
    email: 'marie.said@email.com'
  },
  {
    id: 4,
    nom: 'YASSINE',
    prenom: 'David',
    telephone: '0634466778',
    status: 'PAUSE',
    compte: 'YASSINE.DAVID',
    email: 'david.yassine@email.com'
  },
  {
    id: 5,
    nom: 'MARTIN',
    prenom: 'Sophie',
    telephone: '0634466999',
    status: 'RÉSILIÉ',
    compte: 'MARTIN.SOPHIE',
    email: 'sophie.martin@email.com',
    terminationDate: '2024-01-15'  // Date de résiliation ajoutée
  }
];

const tabs = [
  { id: TAB_TYPES.LIST, label: 'LISTE DES CLIENTS' },
  { id: TAB_TYPES.TO_UNBLOCK, label: 'A DEBLOQUER' },
  { id: TAB_TYPES.TO_BLOCK, label: 'A BLOQUER' },
  { id: TAB_TYPES.TO_ORDER, label: 'A COMMANDER' }
];

const ClientManagement = () => {
  const [currentTab, setCurrentTab] = useState(TAB_TYPES.LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(CLIENT_STATUSES.ALL);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState(null);

  const getFilteredClients = () => {
    return mockClients.filter(client => {
      const matchesSearch = !searchTerm ? true :
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm);
      
      if (currentTab === TAB_TYPES.LIST) {
        const matchesStatus = selectedStatus === CLIENT_STATUSES.ALL || 
          client.status === selectedStatus;
        return matchesSearch && matchesStatus;
      }

      // Filtres spécifiques pour chaque onglet
      switch (currentTab) {
        case TAB_TYPES.TO_BLOCK:
          return matchesSearch && client.status === CLIENT_STATUSES.LATE;
        case TAB_TYPES.TO_UNBLOCK:
          return matchesSearch && client.status === CLIENT_STATUSES.PAUSED;
        case TAB_TYPES.TO_ORDER:
          if (selectedOrderFilter === ORDER_FILTERS.NEW_CLIENT) {
            return matchesSearch && !client.hasSimCard;
          }
          return matchesSearch && client.needsNewSim;
        default:
          return matchesSearch;
      }
    });
  };

  const renderTabContent = () => {
    const filteredClients = getFilteredClients();

    switch (currentTab) {
      case TAB_TYPES.LIST:
        return (
          <ListTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            clients={filteredClients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
        );
      case TAB_TYPES.TO_BLOCK:
        return (
          <BlockTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            clients={filteredClients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
        );
      case TAB_TYPES.TO_UNBLOCK:
        return (
          <UnblockTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            clients={filteredClients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
        );
      case TAB_TYPES.TO_ORDER:
        return (
          <OrderTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedOrderFilter={selectedOrderFilter}
            onOrderFilterChange={setSelectedOrderFilter}
            clients={filteredClients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Tabs 
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              px: 4,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
              }
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          {renderTabContent()}
        </Box>
        {selectedClient && (
  <>
    <ClientDetails 
      client={selectedClient}
      currentTab={currentTab}
    />
    <ClientActions client={selectedClient} />
  </>
)}
      </Box>
    </Box>
  );
};

export default ClientManagement;