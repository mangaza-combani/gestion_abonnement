import React, {useState, useEffect} from 'react';
import {Box, Tabs, Tab, Tooltip, IconButton, Badge} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import {PersonAdd as PersonAddIcon, Notifications as NotificationsIcon} from '@mui/icons-material';
import {TAB_TYPES, CLIENT_STATUSES, ORDER_FILTERS} from '../../components/ClientManagement/constant';
import ListTab from '../../components/ClientManagement/TabContent/ListTab';
import BlockTab from '../../components/ClientManagement/TabContent//BlockTab';
import UnblockTab from '../../components/ClientManagement/TabContent/UnblockTab';
import OrderTab from '../../components/ClientManagement/TabContent/OrderTab';
import ClientDetails from '../../components/ClientManagement/ClientDetails';
import ClientActions from '../../components/ClientManagement/ClientActions';
import ActivateTab from '../../components/ClientManagement/TabContent/ActivateTab';
import CreateClientModal from '../../components/ClientManagement/CreateClientModal';
import ActivationInfo from '../../components/ClientManagement/ActivationInfo';
import {useGetPhonesQuery, useCreatePhoneMutation, useGetPhoneWithPaymentStatusQuery, useGetPhonesToBlockQuery, useGetPhonesOverdueQuery, useGetPhonesToActivateQuery} from "../../store/slices/linesSlice";
import {useGetAllUsersQuery, useGetClientsToOrderQuery} from "../../store/slices/clientsSlice";
import {useCreateClientMutation} from "../../store/slices/clientsSlice";
import {useCreateSimCardMutation} from "../../store/slices/simCardsSlice";
import {useGetAgenciesQuery} from "../../store/slices/agencySlice";
import {PHONE_STATUS, PAYMENT_STATUS} from "../../components/ClientManagement/constant";

// Onglets pour la gestion des lignes et paiements
const tabs = [
        {id: TAB_TYPES.LIST, label: 'LISTE DES LIGNES'},
        {id: TAB_TYPES.TO_BLOCK, label: 'A BLOQUER'}, // Lignes en dette (> 1 mois impayé)
        {id: TAB_TYPES.OVERDUE, label: 'EN RETARD'}, // Lignes en retard de paiement (< 1 mois)
        {id: TAB_TYPES.TO_ORDER, label: 'A COMMANDER'},
        {id: TAB_TYPES.TO_ACTIVATE, label: 'A ACTIVER'},
];

const ClientManagement = () => {
        const [searchParams] = useSearchParams();
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
                isLoading: linesLoading,
                refetch: refetchLines
        } = useGetPhonesQuery(undefined, {
                pollingInterval: 30000, // Rafraîchissement toutes les 30 secondes
                refetchOnFocus: true,   // Rafraîchissement quand la fenêtre reprend le focus
                refetchOnReconnect: true // Rafraîchissement lors de la reconnexion
        })
        
        const {
                data: agenciesData,
                isLoading: agenciesLoading,
                refetch: refetchAgencies
        } = useGetAgenciesQuery()

        // Hook pour récupérer les clients à commander (basé sur LineRequests PENDING)
        const {
                data: clientsToOrderData,
                isLoading: clientsToOrderLoading,
                refetch: refetchClientsToOrder
        } = useGetClientsToOrderQuery(undefined, {
                pollingInterval: 30000, // Rafraîchissement toutes les 30 secondes
                refetchOnFocus: true,   // Rafraîchissement quand la fenêtre reprend le focus
                refetchOnReconnect: true // Rafraîchissement lors de la reconnexion
        })

        // Hooks pour les nouveaux onglets de paiement
        const {
                data: phonesToBlockData,
                isLoading: phonesToBlockLoading,
                refetch: refetchPhonesToBlock
        } = useGetPhonesToBlockQuery(undefined, {
                pollingInterval: 30000,
                refetchOnFocus: true,
                refetchOnReconnect: true
        })

        const {
                data: phonesOverdueData,
                isLoading: phonesOverdueLoading,
                refetch: refetchPhonesOverdue
        } = useGetPhonesOverdueQuery(undefined, {
                pollingInterval: 30000,
                refetchOnFocus: true,
                refetchOnReconnect: true
        })

        const {
                data: phonesToActivateData,
                isLoading: phonesToActivateLoading,
                refetch: refetchPhonesToActivate
        } = useGetPhonesToActivateQuery(undefined, {
                pollingInterval: 30000,
                refetchOnFocus: true,
                refetchOnReconnect: true
        })

        // 🧪 MODE TEST - Hook pour récupérer toutes les lignes avec statut de paiement pour la LISTE
        const {
                data: allLinesWithPaymentStatus,
                isLoading: allLinesLoading
        } = useGetPhoneWithPaymentStatusQuery(undefined, {
                pollingInterval: 30000,
                refetchOnFocus: true,
                refetchOnReconnect: true
        })
        
        // Handle URL parameters for navigation from AccountDetails
        useEffect(() => {
                const tab = searchParams.get('tab');
                const selectedLineId = searchParams.get('selectedLine');
                
                // Set tab based on URL parameter
                if (tab === 'list') {
                        setCurrentTab(TAB_TYPES.LIST);
                }
                
                // Select line based on URL parameter
                if (selectedLineId && linesData && !linesLoading) {
                        const lineToSelect = linesData.find(line => line.id?.toString() === selectedLineId);
                        if (lineToSelect) {
                                setSelectedClient(lineToSelect);
                        }
                }
        }, [searchParams, linesData, linesLoading]);

        // Rafraîchissement automatique spécifique pour TO_ORDER et TO_ACTIVATE
        useEffect(() => {
                let interval;
                
                if (currentTab === TAB_TYPES.TO_ORDER || currentTab === TAB_TYPES.TO_ACTIVATE) {
                        // Rafraîchissement plus fréquent sur ces onglets critiques
                        interval = setInterval(() => {
                                refetchLines();
                                refetchClientsToOrder();
                        }, 15000); // 15 secondes
                }
                
                return () => {
                        if (interval) {
                                clearInterval(interval);
                        }
                };
        }, [currentTab, refetchLines, refetchClientsToOrder]);

        // Rafraîchissement quand la page regagne le focus
        useEffect(() => {
                const handleFocus = () => {
                        if (currentTab === TAB_TYPES.TO_ORDER || currentTab === TAB_TYPES.TO_ACTIVATE) {
                                refetchLines();
                                refetchClientsToOrder();
                        }
                };

                window.addEventListener('focus', handleFocus);
                return () => window.removeEventListener('focus', handleFocus);
        }, [currentTab, refetchLines, refetchClientsToOrder]);

        // Actualisation automatique des données toutes les 30 secondes
        React.useEffect(() => {
                const interval = setInterval(() => {
                        refetchAgencies();
                        refetchClientsToOrder();
                        refetchLines();
                }, 30000); // 30 secondes
                
                return () => clearInterval(interval);
        }, [refetchAgencies, refetchClientsToOrder, refetchLines]);
        
        // Debug temporaire pour voir les données
        React.useEffect(() => {
                if (linesData && !linesLoading) {
                        console.log('🔍 DONNÉES REÇUES du backend:', {
                                totalLines: linesData.length,
                                sampleLines: linesData.slice(0, 3),
                                statusBreakdown: linesData.reduce((acc, line) => {
                                        acc[line.phoneStatus || 'UNDEFINED'] = (acc[line.phoneStatus || 'UNDEFINED'] || 0) + 1;
                                        return acc;
                                }, {}),
                                reservationBreakdown: linesData.reduce((acc, line) => {
                                        const hasReservation = line?.user?.hasActiveReservation || line?.user?.reservationStatus === 'RESERVED';
                                        acc[hasReservation ? 'HAS_RESERVATION' : 'NO_RESERVATION'] = (acc[hasReservation ? 'HAS_RESERVATION' : 'NO_RESERVATION'] || 0) + 1;
                                        return acc;
                                }, {})
                        });
                        
                        // Debug spécifique pour xanderr imran
                        const xanderrClient = linesData.find(client => 
                                client?.user?.firstname?.toLowerCase().includes('xanderr') || 
                                client?.user?.lastname?.toLowerCase().includes('imran')
                        );
                        
                        if (xanderrClient) {
                                console.log('🔍 CLIENT XANDERR TROUVÉ:', {
                                        nom: `${xanderrClient.user?.firstname} ${xanderrClient.user?.lastname}`,
                                        phoneStatus: xanderrClient.phoneStatus,
                                        paymentStatus: xanderrClient.paymentStatus,
                                        hasActiveReservation: xanderrClient.user?.hasActiveReservation,
                                        reservationStatus: xanderrClient.user?.reservationStatus,
                                        clientReservationStatus: xanderrClient.reservationStatus,
                                        clientHasActiveReservation: xanderrClient.hasActiveReservation,
                                        fullClient: xanderrClient
                                });
                        } else {
                                console.log('❌ CLIENT XANDERR NON TROUVÉ dans les données');
                        }
                }
        }, [linesData, linesLoading]);

        // Calcul des notifications pour les cartes SIM disponibles
        const notificationData = React.useMemo(() => {
                if (!agenciesData || !linesData) return { count: 0, newReceptions: [] };
                
                // Compter les lignes réservées
                const reservedLines = linesData.filter(line => {
                        const hasActiveReservation = line?.user?.hasActiveReservation === true ||
                                                   line?.user?.reservationStatus === 'RESERVED' ||
                                                   line?.hasActiveReservation === true ||
                                                   line?.reservationStatus === 'RESERVED';
                        return hasActiveReservation;
                });
                
                // Compter les cartes SIM disponibles et identifier les nouvelles réceptions
                let totalAvailableSimCards = 0;
                const newReceptions = [];
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                agenciesData.forEach(agency => {
                        if (agency.simCards) {
                                const availableSims = agency.simCards.filter(sim => sim.status === 'IN_STOCK');
                                totalAvailableSimCards += availableSims.length;
                                
                                // Identifier les nouvelles réceptions (dernières 24h)
                                const recentSims = agency.simCards.filter(sim => {
                                        if (!sim.createdAt) return false;
                                        const simDate = new Date(sim.createdAt);
                                        return simDate >= yesterday && sim.status === 'IN_STOCK';
                                });
                                
                                if (recentSims.length > 0) {
                                        newReceptions.push({
                                                agencyName: agency.name,
                                                agencyId: agency.id,
                                                count: recentSims.length,
                                                sims: recentSims
                                        });
                                }
                        }
                });
                
                // Retourner le minimum entre lignes réservées et cartes SIM disponibles
                const activatableLines = Math.min(reservedLines.length, totalAvailableSimCards);
                
                console.log('🔔 Calcul notification:', {
                        reservedLinesCount: reservedLines.length,
                        totalAvailableSimCards,
                        activatableLines,
                        newReceptionsCount: newReceptions.length,
                        newReceptions
                });
                
                return { 
                        count: activatableLines,
                        newReceptions,
                        hasNewReceptions: newReceptions.length > 0
                };
        }, [agenciesData, linesData]);

        const handleNewClient = async (data) => {
                // Vérification préventive de l'authentification
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (!token || !userData) {
                        alert('Vous devez être connecté pour créer un client. Redirection...');
                        window.location.href = '/login';
                        return;
                }
                
                let newId = 0;
                
                // Déterminer les statuts appropriés dès le début
                let clientPhoneStatus, clientPaymentStatus;
                
                if (data?.simCard?.simCCID && data.simCard.simCCID !== 'in_attribution') {
                        // Avec carte SIM - prêt à activer
                        clientPhoneStatus = PHONE_STATUS.NEEDS_TO_BE_ACTIVATED;
                        clientPaymentStatus = PAYMENT_STATUS.UP_TO_DATE; // Client peut payer normalement
                } else {
                        // Sans carte SIM - à commander
                        clientPhoneStatus = PHONE_STATUS.NEEDS_TO_BE_ORDERED;
                        clientPaymentStatus = PAYMENT_STATUS.UNATTRIBUTED; // Pas encore de service actif
                }
                
                if (data?.client?.id) {
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
                                phoneStatus: clientPhoneStatus, // Statut dynamique
                                paymentStatus: clientPaymentStatus, // Statut dynamique
                        };

                        // utilisation de la mutation pour créer l'user
                        const clientPayload = {
                                ...data.client,
                                password: "wezo976", // mot de passe par défaut pour la démo
                        };
                        console.log('Payload envoyé à createClient:', clientPayload);
                        
                        const newClientData = await createClient(clientPayload);

                        console.log('New client created:', newClientData);

                        newId = newClientData?.data?.user?.id

                        setSelectedClient(newClient)
                }

                if (data?.payment) {
                        // si on as des informations de paiement, on vas créer un enregistrement dans la facturation
                        console.log('Ready for create billing record', data.payment);
                }

                // Récupérer l'agencyId de manière sûre
                // L'admin appartient aussi à une agence (par défaut agence 1)
                const getAgencyId = () => {
                        try {
                                const userData = localStorage.getItem('user');
                                console.log('User data from localStorage:', userData);
                                if (userData) {
                                        const parsedUser = JSON.parse(userData);
                                        console.log('Parsed user:', parsedUser);
                                        const agencyId = parsedUser?.agencyId;
                                        console.log('AgencyId récupéré:', agencyId, 'Type:', typeof agencyId);
                                        
                                        // Si l'admin n'a pas d'agencyId défini, on lui assigne l'agence 1 par défaut
                                        if (!agencyId || agencyId === 'null' || agencyId === null) {
                                                console.log('Admin sans agencyId, assignation à agence 1');
                                                return 1;
                                        }
                                        return parseInt(agencyId);
                                }
                                console.log('Pas de userData, assignation à agence 1');
                                return 1;
                        } catch (error) {
                                console.error('Invalid user data in localStorage:', error);
                                return 1;
                        }
                };

                const agencyId = getAgencyId();
                console.log('AgencyId final pour SIM card:', agencyId);

                let newSimCardData = null;
                let phoneStatus = clientPhoneStatus; // Utiliser le statut défini plus haut
                
                // Vérifier si une carte SIM est disponible/fournie
                if (data?.simCard?.simCCID && data.simCard.simCCID !== 'in_attribution') {
                        // Carte SIM disponible - créer la carte SIM
                        const newSimCard = {
                                iccid: data.simCard.simCCID,
                                status: "INACTIVE",
                                agencyId: agencyId
                        };
                        newSimCardData = await createSimCard(newSimCard);
                        phoneStatus = PHONE_STATUS.NEEDS_TO_BE_ACTIVATED; // Ligne prête à activer
                } else if (data?.simCard?.simCCID === 'in_attribution') {
                        // Carte SIM en cours de livraison - vérifier s'il y a des lignes non attribuées disponibles
                        console.log('Carte SIM en cours de livraison - vérification des lignes disponibles');
                        
                        // TODO: Ici on pourrait vérifier s'il y a des lignes disponibles via l'API
                        // Pour l'instant, on crée une demande mais le superviseur pourra attribuer une ligne existante
                        phoneStatus = PHONE_STATUS.NEEDS_TO_BE_ACTIVATED; // Ligne prête pour attribution par superviseur
                        newSimCardData = null;
                } else {
                        // Pas de carte SIM disponible - créer une DEMANDE DE LIGNE (pas encore de ligne physique)
                        console.log('Aucune carte SIM disponible - création d\'une demande de ligne');
                        
                        // Pour une demande de ligne, on crée quand même un enregistrement "téléphone" 
                        // mais avec un statut spécial et sans redAccountId (sera assigné plus tard par le superviseur)
                        phoneStatus = PHONE_STATUS.NEEDS_TO_BE_ORDERED;
                        newSimCardData = null;
                }

                let createdPhone;

                if (phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ORDERED) {
                        // DEMANDE DE LIGNE : Pas encore de ligne physique, juste une demande
                        const lineRequest = {
                                // Pas de phoneNumber - sera assigné lors de la commande
                                phoneNumber: null, 
                                userId: newId || data?.client?.id || null,
                                simCardId: null, // Pas de carte SIM
                                phoneStatus: PHONE_STATUS.NEEDS_TO_BE_ORDERED,
                                redAccountId: null, // Sera choisi par le superviseur
                                phoneType: "POSTPAID",
                                agencyId: agencyId, // Agence qui fait la demande
                                // Utiliser trackingNotes pour stocker des infos sur la demande
                                trackingNotes: `Demande de ligne pour ${data.client?.firstname} ${data.client?.lastname} - Créée le ${new Date().toLocaleDateString()}`
                        };
                        
                        console.log('Création demande de ligne:', lineRequest);
                        
                        try {
                                createdPhone = await createPhone(lineRequest);
                                console.log('Demande de ligne créée avec succès:', createdPhone);
                        } catch (error) {
                                console.error('Erreur lors de la création de la demande:', error);
                                throw error;
                        }
                } else {
                        // LIGNE AVEC CARTE SIM : Création normale
                        const generateTempPhoneNumber = () => {
                                const timestamp = Date.now().toString();
                                return `TEMP${timestamp.slice(-8)}`;
                        };

                        const newPhone = {
                                phoneNumber: data?.client?.phoneNumber || generateTempPhoneNumber(),
                                userId: newId || data?.client?.id || null,
                                simCardId: newSimCardData?.data?.id,
                                phoneStatus: phoneStatus,
                                redAccountId: 1, // Pour les lignes avec SIM, on utilise un compte par défaut
                                phoneType: "POSTPAID",
                        };
                        
                        console.log('Création ligne avec SIM:', newPhone);
                        
                        try {
                                createdPhone = await createPhone(newPhone);
                                console.log('Ligne avec SIM créée avec succès:', createdPhone);
                        } catch (error) {
                                console.error('Erreur lors de la création de la ligne:', error);
                                throw error;
                        }
                }
                
                console.log('Processus terminé avec succès');
                console.log("Données originales:", data);

        };

        const handleChangeTabs = (e, newValue) => {
                // Utiliser un timeout pour éviter les conflits de rendu
                setTimeout(() => {
                        setSelectedClient(null)
                        setCurrentTab(newValue)
                        
                        // Rafraîchir les données quand on change d'onglet
                        if (newValue === TAB_TYPES.TO_ORDER || newValue === TAB_TYPES.TO_ACTIVATE) {
                                refetchLines();
                                refetchClientsToOrder();
                        }
                }, 0)
        }

        const getFilteredClients = () => {
                // Pour l'onglet À COMMANDER, utiliser les données spécifiques
                if (currentTab === TAB_TYPES.TO_ORDER) {
                        if (!clientsToOrderData || clientsToOrderLoading) return [];
                        return clientsToOrderData.data || [];
                }
                
                if (!linesData) return [];
                
                const now = new Date();
                const currentDay = now.getDate();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const filteredClients = linesData?.filter(client => {
                        // Exclure les lignes non attribuées SAUF pour l'onglet À COMMANDER et À ACTIVER (si réservation)
                        // Les demandes de lignes peuvent être UNATTRIBUTED mais doivent être visibles pour être commandées
                        // Les clients avec réservations actives doivent être visibles dans À ACTIVER même si UNATTRIBUTED
                        const hasActiveReservation = client?.user?.hasActiveReservation === true ||
                                                   client?.user?.reservationStatus === 'RESERVED' ||
                                                   client?.hasActiveReservation === true ||
                                                   client?.reservationStatus === 'RESERVED';
                        
                        if (client?.paymentStatus === PAYMENT_STATUS.UNATTRIBUTED && 
                            currentTab !== TAB_TYPES.TO_ORDER && 
                            !(currentTab === TAB_TYPES.TO_ACTIVATE && hasActiveReservation)) {
                                return false;
                        }

                        const matchesSearch = !searchTerm ? true :
                            client?.user?.firstname.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                            client?.user?.lastname.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                            client?.user?.email.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                            client?.user?.phoneNumber?.includes(searchTerm);

                        if (currentTab === TAB_TYPES.LIST) {
                                // Vue liste - TOUTES les lignes attribuées avec abonnement (même bloquées, en pause, résiliées)
                                const matchesStatus = selectedStatus === CLIENT_STATUSES.ALL ||
                                    client?.phoneStatus === selectedStatus || client?.paymentStatus === selectedStatus;
                                // Vérifier si la ligne a un abonnement (peu importe le statut de la ligne)
                                const hasSubscription = client?.phoneSubscriptions > 0 || client?.activeSubscription;
                                // Inclure même les lignes BLOCKED, PAUSED, TERMINATED car elles restent visibles dans la liste
                                return matchesSearch && matchesStatus && hasSubscription;
                        }

                        // Filtres basés sur la logique métier
                        switch (currentTab) {
                                case TAB_TYPES.TO_UNBLOCK:
                                        // Lignes impayées 2 mois consécutifs après le 30 du mois
                                        // Logique: si on est après le 30 et le client n'a pas payé pendant 2 mois
                                        const hasUnpaidFor2Months = client?.unpaidMonthsCount >= 2;
                                        const isAfter30th = currentDay > 30 || (currentDay === 30 && now.getHours() >= 23);
                                        return matchesSearch && hasUnpaidFor2Months && isAfter30th &&
                                               client?.phoneStatus === PHONE_STATUS.SUSPENDED;
                                
                                case TAB_TYPES.TO_BLOCK:
                                        // En retard - clients qui n'ont pas payé au 27 du mois
                                        const isAfter27th = currentDay >= 27;
                                        const hasNotPaid = client?.paymentStatus === PAYMENT_STATUS.OVERDUE || 
                                                          client?.paymentStatus === PAYMENT_STATUS.PAST_DUE;
                                        return matchesSearch && isAfter27th && hasNotPaid &&
                                               client?.phoneStatus !== PHONE_STATUS.SUSPENDED;
                                
                                case TAB_TYPES.TO_ORDER:
                                        // À commander: SEULEMENT les nouvelles demandes non traitées
                                        // 1. Lignes avec statut NEEDS_TO_BE_ORDERED (pas de carte SIM disponible)
                                        // 2. Lignes avec statut NEEDS_TO_BE_REPLACED (remplacements vol/perte)
                                        // 3. Demandes nécessitant nouveau compte (NEEDS_NEW_ACCOUNT)
                                        // ❌ EXCLUT: Les lignes réservées (elles passent dans "À activer")
                                        const needsSimCard = client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ORDERED;
                                        const needsReplacement = client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_REPLACED;
                                        const needsNewAccount = client?.phoneStatus === PHONE_STATUS.NEEDS_NEW_ACCOUNT;
                                        const isSimReplacement = client?.replacementReason === 'THEFT' || 
                                                               client?.replacementReason === 'LOSS';
                                        
                                        // Vérifier que la ligne N'EST PAS réservée
                                        // Une ligne réservée ne doit JAMAIS apparaître dans "À commander"
                                        const hasActiveReservation = client?.user?.hasActiveReservation === true ||
                                                                    client?.user?.reservationStatus === 'RESERVED' ||
                                                                    client?.hasActiveReservation === true ||
                                                                    client?.reservationStatus === 'RESERVED' ||
                                                                    client?.phoneStatus === PHONE_STATUS.RESERVED_EXISTING_LINE ||
                                                                    client?.phoneStatus === PHONE_STATUS.RESERVED_NEW_LINE;
                                        
                                        const isNotReserved = !hasActiveReservation;
                                        
                                        // Debug pour vérifier l'exclusion des lignes réservées
                                        if (hasActiveReservation && (needsSimCard || needsReplacement || needsNewAccount)) {
                                                console.log('🚨 DEBUG ligne réservée exclue de À COMMANDER:', {
                                                        name: client?.user?.firstname + ' ' + client?.user?.lastname,
                                                        phoneStatus: client?.phoneStatus,
                                                        reservationStatus: client?.reservationStatus || client?.user?.reservationStatus,
                                                        hasActiveReservation: client?.hasActiveReservation || client?.user?.hasActiveReservation,
                                                        isNotReserved,
                                                        hasActiveReservation: client?.hasActiveReservation,
                                                        userReservationStatus: client?.user?.reservationStatus,
                                                        userHasActiveReservation: client?.user?.hasActiveReservation,
                                                        isNotReserved,
                                                        needsSimCard,
                                                        needsReplacement, 
                                                        needsNewAccount,
                                                        isSimReplacement,
                                                        matchesSearch,
                                                        fullClient: client,
                                                        finalResult: matchesSearch && (needsSimCard || needsReplacement || needsNewAccount || isSimReplacement) && isNotReserved
                                                });
                                        }
                                        
                                        return matchesSearch && (needsSimCard || needsReplacement || needsNewAccount || isSimReplacement) && isNotReserved;
                                
                                case TAB_TYPES.TO_ACTIVATE:
                                        // À activer: 
                                        // 1. Lignes avec statut NEEDS_TO_BE_ACTIVATED
                                        // 2. Lignes avec réservation active MAIS PAS ENCORE ACTIVÉES (éviter les lignes déjà activées)
                                        const needsActivation = client?.phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED;
                                        const hasReservation = client?.user?.hasActiveReservation === true ||
                                                              client?.user?.reservationStatus === 'RESERVED' ||
                                                              client?.hasActiveReservation === true ||
                                                              client?.reservationStatus === 'RESERVED';
                                        
                                        // Exclure les lignes déjà activées (statut ACTIVE)
                                        const isAlreadyActive = client?.phoneStatus === PHONE_STATUS.ACTIVE;
                                        
                                        const qualifies = (needsActivation || hasReservation) && !isAlreadyActive;
                                        
                                        // Identifier le type de ligne pour À ACTIVER
                                        const isWaitingForSim = client.trackingNotes?.includes('EN ATTENTE DE SIM');
                                        const hasIccid = client.activatedWithIccid || client.phoneNumber;
                                        
                                        // Debug détaillé pour comprendre la logique
                                        if (needsActivation || hasReservation) {
                                          console.log('🔍 LIGNE ANALYSÉE pour À ACTIVER:', {
                                            id: client.id,
                                            phoneNumber: client.phoneNumber,
                                            needsActivation,
                                            hasReservation,
                                            isAlreadyActive,
                                            phoneStatus: client.phoneStatus,
                                            isWaitingForSim,
                                            hasIccid,
                                            qualifies: qualifies,
                                            trackingNotes: client.trackingNotes,
                                            user: {
                                              id: client.user?.id,
                                              firstname: client.user?.firstname,
                                              lastname: client.user?.lastname,
                                              hasActiveReservation: client.user?.hasActiveReservation,
                                              reservationStatus: client.user?.reservationStatus
                                            }
                                          });
                                        }
                                        
                                        // Afficher toutes les lignes qui ont besoin d'activation ou qui sont réservées
                                        return matchesSearch && qualifies;
                                
                                default:
                                        return matchesSearch;
                        }
                });
                
                // Log temporaire pour debug
                console.log(`🔍 FILTRAGE onglet ${currentTab}:`, {
                        totalLines: linesData?.length || 0,
                        filteredCount: filteredClients?.length || 0,
                        tab: currentTab,
                        sampleFiltered: filteredClients?.slice(0, 3)
                });
                
                return filteredClients;
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
                                        lines={allLinesWithPaymentStatus || []}
                                        isLoading={allLinesLoading}
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
                                        lines={phonesToBlockData || []}
                                        isLoading={phonesToBlockLoading}
                                        selectedClient={selectedClient}
                                        onClientSelect={setSelectedClient}
                                    />
                                );
                        case TAB_TYPES.OVERDUE:
                                return (
                                    <BlockTab
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        lines={phonesOverdueData || []}
                                        isLoading={phonesOverdueLoading}
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
                                        lines={phonesToActivateData || []}
                                        isLoading={phonesToActivateLoading}
                                        clients={filteredClients}
                                        selectedClient={selectedClient}
                                        onClientSelect={setSelectedClient}
                                        newReceptions={notificationData.newReceptions}
                                    />
                                );

                        default:
                                return null;
                }
        };

        return (
            <Box sx={{bgcolor: 'grey.50', minHeight: '100vh'}}>
                    <Box sx={{bgcolor: 'white', boxShadow: 1, position: 'relative'}}>
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
                                        <Tab 
                                            key={tab.id} 
                                            value={tab.id} 
                                            label={
                                                tab.id === TAB_TYPES.TO_ACTIVATE && (notificationData.count > 0 || notificationData.hasNewReceptions) ? (
                                                    <Badge 
                                                        badgeContent={notificationData.count > 0 ? notificationData.count : '!'} 
                                                        color="secondary"
                                                        sx={{
                                                            '& .MuiBadge-badge': {
                                                                backgroundColor: notificationData.hasNewReceptions ? '#FF5722' : '#4CAF50',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem',
                                                                minWidth: '20px',
                                                                height: '20px',
                                                                borderRadius: '10px',
                                                                animation: notificationData.hasNewReceptions ? 'pulse 2s infinite' : 'none'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <NotificationsIcon sx={{ 
                                                                fontSize: '1.1rem', 
                                                                color: notificationData.hasNewReceptions ? '#FF5722' : '#4CAF50',
                                                                animation: notificationData.hasNewReceptions ? 'bell-ring 1s ease-in-out infinite' : 'none'
                                                            }} />
                                                            {tab.label}
                                                        </Box>
                                                    </Badge>
                                                ) : (
                                                    tab.label
                                                )
                                            }
                                        />
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
                                                '&:hover': {backgroundColor: 'rgba(255,255,255,0.9)'}
                                        }}
                                        onClick={() => setIsNewClientModalOpen(true)}
                                    >
                                            <PersonAddIcon/>
                                    </IconButton>
                            </Tooltip>
                    </Box>
                    <Box sx={{display: 'flex', p: 2, gap: 2}}>
                            <Box sx={{flex: 1}}>
                                    {renderTabContent()}
                            </Box>
                            <Box sx={{ display: selectedClient && currentTab !== TAB_TYPES.TO_ORDER ? 'block' : 'none' }}>
                                {selectedClient && currentTab !== TAB_TYPES.TO_ORDER && currentTab !== TAB_TYPES.TO_ACTIVATE && (
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
                                {currentTab === TAB_TYPES.TO_ACTIVATE && (
                                    <ActivationInfo client={selectedClient} />
                                )}
                            </Box>
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