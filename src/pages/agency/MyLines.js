import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

import ClientList from '../../components/ClientManagement/ClientList';
import ClientSearch from '../../components/ClientManagement/ClientSearch';
import ClientDetailsModal from '../../components/ClientManagement/ClientDetailsModal';

import { useGetClientsQuery } from '../../store/slices/clientsSlice';
import { useWhoIAmQuery } from '../../store/slices/authSlice';

// Constantes pour les onglets (version agence)
const TAB_TYPES = {
  CLIENT_LIST: 'client_list'
};

const MyLines = () => {
  const [activeTab, setActiveTab] = useState(TAB_TYPES.CLIENT_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  // Récupérer l'utilisateur connecté pour filtrer par agence
  const { data: currentUser, isLoading: userLoading } = useWhoIAmQuery();
  const { data: clientsData, isLoading: clientsLoading, error } = useGetClientsQuery();

  // Filtrer les clients par agence
  const agencyClients = clientsData?.filter(client => 
    currentUser?.agencyId && client?.agencyId === currentUser.agencyId
  ) || [];

  useEffect(() => {
    if (agencyClients.length > 0 && !selectedClient) {
      setSelectedClient(agencyClients[0]);
    }
  }, [agencyClients, selectedClient]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleClientDetailsOpen = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleClientDetailsClose = () => {
    setShowClientDetails(false);
  };

  // Filtrer les clients selon le terme de recherche
  const filteredClients = agencyClients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client?.firstname?.toLowerCase().includes(searchLower) ||
      client?.lastname?.toLowerCase().includes(searchLower) ||
      client?.email?.toLowerCase().includes(searchLower) ||
      client?.phoneNumber?.includes(searchTerm)
    );
  });

  const tabs = [
    { id: TAB_TYPES.CLIENT_LIST, label: 'LISTE DES CLIENTS', icon: PhoneIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case TAB_TYPES.CLIENT_LIST:
        return (
          <Box>
            {/* Barre de recherche */}
            <Box sx={{ mb: 3 }}>
              <ClientSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                placeholder="Rechercher un client par nom, email ou téléphone..."
              />
            </Box>

            {/* Information sur l'agence */}
            {currentUser && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Mon Agence :</strong> {currentUser.agencyId ? `Agence ID: ${currentUser.agencyId}` : 'Agence non définie'}
                </Typography>
                <Typography variant="body2">
                  <strong>Total clients :</strong> {agencyClients.length}
                </Typography>
              </Alert>
            )}

            {/* Liste des clients */}
            {clientsLoading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Chargement des clients...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Erreur lors du chargement des clients : {error.message}
              </Alert>
            ) : filteredClients.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                {searchTerm ? 'Aucun client trouvé pour cette recherche.' : 'Aucun client dans votre agence.'}
              </Alert>
            ) : (
              <ClientList
                clients={filteredClients}
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                onClientDetailsOpen={handleClientDetailsOpen}
                showDetailsButton={true}
                agencyMode={true} // Mode agence - lecture seule
              />
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  if (userLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Mes Lignes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consultation des lignes attribuées aux clients de votre agence
        </Typography>
      </Box>

      {/* Onglets */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }
          }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComponent fontSize="small" />
                    {tab.label}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Contenu des onglets */}
      <Box>
        {renderTabContent()}
      </Box>

      {/* Modal de détails client */}
      <ClientDetailsModal
        client={selectedClient}
        open={showClientDetails}
        onClose={handleClientDetailsClose}
        readOnly={true} // Mode lecture seule pour les agences
      />
    </Box>
  );
};

export default MyLines;