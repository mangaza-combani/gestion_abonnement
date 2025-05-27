import React, { useState } from 'react';
import { Box, Tabs, Tab, Tooltip, IconButton } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { TAB_TYPES, CLIENT_STATUSES, ORDER_FILTERS } from '../../components/ClientManagement/constant';
import ListTab from '../../components/ClientManagement/TabContent/ListTab';
import BlockTab from '../../components/ClientManagement/TabContent//BlockTab';
import UnblockTab from '../../components/ClientManagement/TabContent/UnblockTab';
import OrderTab from '../../components/ClientManagement/TabContent/OrderTab';
import ClientDetails from '../../components/ClientManagement/ClientDetails';
import ClientActions from '../../components/ClientManagement/ClientActions';
import ActivateTab from '../../components/ClientManagement/TabContent/ActivateTab';
import CreateClientModal from '../../components/ClientManagement/CreateClientModal';
import {useGetPhonesQuery, useCreatePhoneMutation} from "../../store/slices/linesSlice";
import {useGetAllUsersQuery} from "../../store/slices/clientsSlice";
import { useCreateClientMutation } from "../../store/slices/clientsSlice";
import { useCreateSimCardMutation } from "../../store/slices/simCardsSlice";
import { PHONE_STATUS, PAYMENT_STATUS} from "../../components/ClientManagement/constant";

// Mock data
const tabs = [
  { id: TAB_TYPES.LIST, label: 'LISTE DES CLIENTS' },
  { id: TAB_TYPES.TO_UNBLOCK, label: 'A DEBLOQUER' },
  { id: TAB_TYPES.TO_BLOCK, label: 'EN RETARD' },
  { id: TAB_TYPES.TO_ORDER, label: 'A COMMANDER' },
  { id: TAB_TYPES.TO_ACTIVATE, label: 'A ACTIVER' },
];

const ClientManagement = () => {
  const [currentTab, setCurrentTab] = useState(TAB_TYPES.LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(CLIENT_STATUSES.ALL);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const [createClient] = useCreateClientMutation();
    const [createPhone] = useCreatePhoneMutation();
    const [createSimCard] = useCreateSimCardMutation();

  const {
    data: linesData,
  } = useGetPhonesQuery()

  const handleNewClient = async (data) => {
   let newId = 0;
    if(data?.client?.id) {
      // si le client à déjà un id on ne fait pas de requête pour le créer
      // on le sélectionne directement
      const fullData = linesData.find(client => client.id === data?.client?.id);
      setSelectedClient(fullData);
    } else {
        // sinon on simule la création d'un nouveau client
        // en ajoutant un id aléatoire pour la démo
        const newClient = {
            user: data.client,
            id: Math.random().toString(36).substr(2, 9), // Génération d'un ID aléatoire
            phoneStatus: PHONE_STATUS.NEEDS_TO_BE_ACTIVATED, // Par défaut, le statut du téléphone est actif
            paymentStatus: PAYMENT_STATUS.UP_TO_DATE, // Par défaut, le statut de paiement est à jour
        };

        // utilisation de la mutation pour créer l'user
        const newClientData = await createClient({
          ...data.client,
          password: "wezo976", // mot de passe par défaut pour la démo
        });

        console.log('New client created:', newClientData);

        newId = newClientData?.data?.user?.id

        setSelectedClient(newClient)
    }

    if(data?.payment) {
      // si on as des informations de paiement, on vas créer un enregistrement dans la facturation
      console.log('Ready for create billing record', data.payment);
    }

    if(data?.simCard?.simCCID) {
        // if yes, associate it with the new phone of client
        const existingSimCard = linesData.find(sim => sim.iccid === data.simCard.simCCID);

        if(existingSimCard && data.simCard.simCCID !== 'in_attribution') {
                alert('Cette carte SIM est déjà attribuée à un autre client.');
        }
    } else {
        const newSimCard = {
            iccid: 'in_attribution', // Indique que la carte SIM est en attribution
            status: "INACTIVE", // Par défaut, le statut de la carte SIM est en attribution
            agencyId: JSON?.parse(localStorage.getItem('user'))?.agencyId || 1, // Agence par défaut
        }

        const newSimCardData = await createSimCard(newSimCard);

        // si on n'as pas de carte SIM, on crée un téléphone sans carte SIM
        const newPhone = {
            phoneNumber: data?.client?.phoneNumber || '0000000000', // Numéro de téléphone par défaut
            userId: newId || data?.client?.id || null,
            simCardId: newSimCardData?.data?.id, // Associer la nouvelle carte SIM au téléphone
            phoneStatus: PHONE_STATUS.NEEDS_TO_BE_ACTIVATED, // Par défaut, le statut du téléphone est à activer
            redAccountId: 5,
            phoneType: "POSTPAID", // Type de téléphone par défaut
        };
        const createdPhone = await createPhone(newPhone);

        console.log('New phone created:', createdPhone);
        console.log("data", data);

    }
  };

  const handleChangeTabs = (e, newValue)=> {
    setSelectedClient(null)
    setCurrentTab(newValue)
  }

  const getFilteredClients = () => {
    return linesData?.filter(client => {
      const matchesSearch = !searchTerm ? true :
        client?.user?.firstname.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        client?.user?.lastname.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        client?.user?.email.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        client?.user?.phoneNumber?.includes(searchTerm);

      if (currentTab === TAB_TYPES.LIST) {
        // Pour la vue liste, on garde la logique existante si nécessaire
        const matchesStatus = selectedStatus === CLIENT_STATUSES.ALL ||
          client?.phoneStatus === selectedStatus || client?.paymentStatus === selectedStatus;
        return matchesSearch && matchesStatus;
      }

      //TODO : mettre a jour les filtres pour les autres onglets
      // Filtres basés sur les actions pour chaque onglet
      switch (currentTab) {
        case TAB_TYPES.LIST:
            return matchesSearch && (client?.phoneStatus === PHONE_STATUS.ACTIVE || client?.paymentStatus === PAYMENT_STATUS.UP_TO_DATE);
        case TAB_TYPES.LATE:
            return matchesSearch && (client?.phoneStatus === PHONE_STATUS.SUSPENDED && (client.paymentStatus === PAYMENT_STATUS.PAST_DUE || client.paymentStatus === PAYMENT_STATUS.OVERDUE));
        case TAB_TYPES.TO_BLOCK:
          return matchesSearch && (client?.phoneStatus === PHONE_STATUS.SUSPENDED && client.paymentStatus === PAYMENT_STATUS.OVERDUE);
        case TAB_TYPES.TO_UNBLOCK:
          return matchesSearch && (client?.phoneStatus === PHONE_STATUS.SUSPENDED && client.paymentStatus === PAYMENT_STATUS.UP_TO_DATE);
        case TAB_TYPES.TO_ORDER:
          return matchesSearch && (client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ORDERED && client.paymentStatus === PAYMENT_STATUS.UNATTRIBUTED);
        case TAB_TYPES.TO_ACTIVATE:
          return matchesSearch && (client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED && client.paymentStatus === PAYMENT_STATUS.UNATTRIBUTED);
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
            setCurrentTab={setCurrentTab}
            tabs={tabs}
            currentTab={currentTab}
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
      <Box sx={{ bgcolor: 'white', boxShadow: 1, position: 'relative' }}>
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
          {tabs?.map((tab) => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </Tabs>
        <Tooltip title="Créer un nouveau client" placement="left">
          <IconButton
            color="primary"
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
            }}
            onClick={() => setIsNewClientModalOpen(true)}
          >
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
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
            <ClientActions
              client={selectedClient}
              currentTab={currentTab}
            />
          </>
        )}
      </Box>

      {/* Modal de création/sélection de client */}
      <CreateClientModal
        open={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={handleNewClient}
      />
    </Box>
  );
};

export default ClientManagement;