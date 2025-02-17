import {
    People,
    LockOpen,
    Block,
    SimCard,
    Warning
  } from '@mui/icons-material';
  
  export const STATUS_COLORS = {
    'A JOUR': 'success',
    'EN RETARD': 'warning',
    'DETTE': 'error',
    'PAUSE': 'info',
    'RESILIE': 'default'
  };
  
  export const TABS = [
    { id: 'list', label: 'LISTE DES CLIENTS', icon: People },
    { id: 'unblock', label: 'A DEBLOQUER', icon: LockOpen },
    { id: 'block', label: 'A BLOQUER', icon: Block },
    { id: 'order', label: 'A COMMANDER', icon: SimCard },
    { id: 'late', label: 'RETARD', icon: Warning }
  ];
  
  export const MOCK_CLIENTS = [
    { 
      id: 1,
      nom: 'ABDOU',
      prenom: 'Celine',
      telephone: '0639666363',
      status: 'A JOUR',
      compte: 'ABDOU.CELINE',
      lastPayment: '15/02/2024',
      accountId: 'ACC001',
      simCard: {
        iccid: '8933150319xxxx',
        status: 'active'
      },
      subscription: {
        name: 'RED 120GB',
        price: 39,
        features: ['Clé WIFI et internet', 'Appels illimités', 'SMS/MMS illimités']
      }
    },
    { 
      id: 2,
      nom: 'ABDOU',
      prenom: 'Omar',
      telephone: '0634466363',
      status: 'EN RETARD',
      compte: 'ABDOU.OMAR',
      lastPayment: '01/01/2024',
      accountId: 'ACC002',
      simCard: {
        iccid: '8933150319yyyy',
        status: 'blocked'
      }
    },
    {
      id: 3,
      nom: 'SAID',
      prenom: 'Marie',
      telephone: '0634466364',
      status: 'DETTE',
      compte: 'SAID.MARIE',
      lastPayment: '15/12/2023',
      accountId: 'ACC003',
      simCard: {
        iccid: '8933150319zzzz',
        status: 'blocked'
      }
    },
    {
      id: 4,
      nom: 'YASSINE',
      prenom: 'David',
      telephone: '0634466365',
      status: 'PAUSE',
      compte: 'YASSINE.DAVID',
      lastPayment: '20/02/2024',
      accountId: 'ACC004',
      simCard: null // En attente de commande
    }
  ];
  
  export const getFilteredClients = (clients, currentTab) => {
    switch (currentTab) {
      case 'unblock':
        return clients.filter(client => 
          client.simCard?.status === 'blocked' && client.status !== 'DETTE'
        );
      case 'block':
        return clients.filter(client => 
          client.status === 'EN RETARD' && client.simCard?.status === 'active'
        );
      case 'order':
        return clients.filter(client => !client.simCard);
      case 'late':
        return clients.filter(client => 
          client.status === 'EN RETARD' || client.status === 'DETTE'
        );
      default:
        return clients;
    }
  };