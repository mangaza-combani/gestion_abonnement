import React, { useState } from 'react';
import { Box ,Tabs, Tab} from '@mui/material';
import { TAB_TYPES, CLIENT_STATUSES, ORDER_FILTERS } from '../../components/ClientManagement/constant';
import ListTab from '../../components/ClientManagement/TabContent/ListTab';
import BlockTab from '../../components/ClientManagement/TabContent//BlockTab';
import UnblockTab from '../../components/ClientManagement/TabContent/UnblockTab';
import OrderTab from '../../components/ClientManagement/TabContent/OrderTab';
import ClientDetails from '../../components/ClientManagement/ClientDetails';
import ClientActions from '../../components/ClientManagement/ClientActions';
import ActivateTab from '../../components/ClientManagement/TabContent/ActivateTab';

// Mock data
const mockClients = [
 
  {
    id: 1,
    nom: "ABDOU",
    prenom: "Céline",
    telephone: "0612346363",
    status: "A JOUR",
    compte: "celine.abdou",
    email: "celine.abdou@gmail.com",
    red: {
      id: "celine.id.dtct",
      psw: "t5743L2K",
      status: 'active',
      lastPaymentDate: '2024-02-15',
      basePrice: 19,
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
  {
    id: 2,
    nom: "ABDOU",
    prenom: "Omar",
    telephone: "0644446363",
    status: "EN RETARD",
    compte: "ABDOU.OMAR",
    email: "omar.abdou@gmail.com",
    red: {
      id: "djos.id.dtct",
      psw: "t5743L2K",
      status: 'late',
      dueAmount: 38,
      basePrice: 19,
      lastPaymentDate: '2024-01-15',
      unpaidMonths: [
        { month: 'Janvier', year: 2024, amount: 19 },
        { month: 'Février', year: 2024, amount: 19 }
      ],
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
  {
    id: 3,
    nom: "SAID",
    prenom: "Mohamed",
    telephone: "0644466364",
    status: "DETTE",
    compte: "mohamed.msa",
    email: "momo.said@gmail.com",
    actions: [{
      type: 'to_block',
      reason: 'Nouveau client en attente de carte SIM',
      priority: 1
    }],
    red: {
      id: "mohamed.msa",
      psw: "t5743L2K",
      status: 'blocked',
      dueAmount: 57,
      basePrice: 19,
      lastPaymentDate: '2023-12-15',
      unpaidMonths: [
        { month: 'Décembre', year: 2023, amount: 19 },
        { month: 'Janvier', year: 2024, amount: 19 },
        { month: 'Février', year: 2024, amount: 19 }
      ],
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
  {
    id: 6,
    nom: "YASSINE",
    prenom: "David",
    telephone: "0644465778",
    compte: "yassine.david",
    status: "PAUSE",
    email: "david.yassine@gmail.com",
    actions: [{
      type: 'to_unblock',
      reason: 'Nouveau client en attente de carte SIM',
      priority: 1
    },
    ],
    red: {
      id: "yassine.david",
      psw: "t2343und1",
      status: 'terminated',
      basePrice: 19,
      lastPaymentDate: '2024-02-10',
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
  {
    id: 5,
    nom: "MARTIN",
    prenom: "Sophie",
    telephone: "0644466999",
    status: "RESILIE",
    compte: "yassine.david",
    email: "sophie.martin@gmail.com",
    actions: [],
    terminationDate: "2024-01-15", // Date de résiliation ajoutée
    red: {
      id: "yassine.david",
      psw: "t2343und2",
      status: 'terminated',
      basePrice: 19,
      terminationDate: '2024-01-15',
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },

  {
    id: 10,
    nom: "ISSOUF",
    prenom: "VOLA",
    telephone: "",
    status: "NOUVEAU CLIENT",
    agency: {
      id: 'COMBANI_01',
    },
    compte: "yassine.david",
    email: "david.yassine@gmail.com",
    actions: [{
      type: 'to_order',
      reason: 'NOUVEAU CLIENT',
      iccid : undefined,
    },
  ],
    red: {
      id: "yassine.david",
      psw: "t2343und1",
      lineStatus: 'pending',
      paymentStatus: 'pending',
      basePrice: 19,
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
  ,

  {
    id: 4,
    nom: "YASSINE",
    prenom: "David",
    telephone: "",
    status: "NOUVEAU CLIENT",
    agency: {
      id: 'COMBANI_01',
    },
    compte: "yassine.david",
    email: "david.yassine@gmail.com",
    simCCID: "8933150319xxxx",
    actions: [{
      type: 'to_activate',
      reason: 'NOUVEAU CLIENT',
      iccid : undefined,
    },
  ],
    red: {
      id: "yassine.david",
      psw: "t2343und1",
      lineStatus: 'pending',
      paymentStatus: 'pending',
      basePrice: 19,
      features: [
        "Appels illimités en France",
        "SMS/MMS illimités",
        "Internet 100Go"
      ]
    }
  },
];

const tabs = [
  { id: TAB_TYPES.LIST, label: 'LISTE DES CLIENTS' },
  { id: TAB_TYPES.TO_UNBLOCK, label: 'A DEBLOQUER' },
  { id: TAB_TYPES.TO_BLOCK, label: 'A BLOQUER' },
  { id: TAB_TYPES.TO_ORDER, label: 'A COMMANDER' },
  { id: TAB_TYPES.TO_ACTIVATE, label: 'A ACTIVER' },
];

const ClientManagement = () => {
  const [currentTab, setCurrentTab] = useState(TAB_TYPES.LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(CLIENT_STATUSES.ALL);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState(null);


  const handleChangeTabs = (e, newValue)=>{
    setSelectedClient(null)
    setCurrentTab(newValue)
  }

  const getFilteredClients = () => {
    return mockClients.filter(client => {
      const matchesSearch = !searchTerm ? true :
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm);
      
      if (currentTab === TAB_TYPES.LIST) {
        // Pour la vue liste, on garde la logique existante si nécessaire
        const matchesStatus = selectedStatus === CLIENT_STATUSES.ALL || 
          client.status === selectedStatus;
        return matchesSearch && matchesStatus;
      }
  
      // Vérifie si le client a des actions
      const hasActions = Array.isArray(client.actions) && client.actions.length > 0;
      
      // Filtres basés sur les actions pour chaque onglet
      switch (currentTab) {
        case TAB_TYPES.TO_BLOCK:
          return matchesSearch && hasActions && client.actions.some(action => action.type === 'to_block');
        case TAB_TYPES.TO_UNBLOCK:
          return matchesSearch && hasActions && client.actions.some(action => action.type === 'to_unblock');
        case TAB_TYPES.TO_ORDER:
          return matchesSearch && hasActions && client.actions.some(action => action.type === 'to_order');
        case TAB_TYPES.TO_ACTIVATE:
          return matchesSearch && hasActions && client.actions.some(action => action.type === 'to_activate');
        default:
          // Pour l'onglet par défaut, on affiche tous les clients qui correspondent à la recherche
          // y compris ceux qui n'ont pas d'actions
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
      case TAB_TYPES.TO_ACTIVATE:
        return (
          <ActivateTab
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
          onChange={(e, newValue) => handleChangeTabs(e, newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              px: 4,
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
    <ClientActions client={selectedClient}  currentTab={currentTab}/>
  </>
)}
      </Box>
    </Box>
  );
};

export default ClientManagement;