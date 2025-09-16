import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Chip,
  Alert,
  Stack,
  InputAdornment,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import InventoryIcon from '@mui/icons-material/Inventory';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import {useWhoIAmQuery} from "../../store/slices/authSlice";
import {useGetClientsQuery} from "../../store/slices/clientsSlice";
import {
  useGetAgencySimCardsOrderQuery,
  useGetAgencySimCardsQuery,
  useGetAgencySimCardsReceiptQuery
} from "../../store/slices/agencySlice";
import {useReceiveSimCardMutation} from "../../store/slices/agencySlice";
import { useGetPhonesQuery } from "../../store/slices/linesSlice";
// Imports d'activation retirés - réservés au superviseur
import dayjs from "dayjs";
import {useCreateSimCardMutation} from "../../store/slices/simCardsSlice";
import {useCreateSimCardOrderMutation} from "../../store/slices/agencySlice";

const SimCardManagement = () => {
  // États
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  // États d'activation retirés - réservés au superviseur
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newICCID, setNewICCID] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [createSimCard] = useCreateSimCardMutation();
  const [receiveSimCard] = useReceiveSimCardMutation();
  // Hook d'activation retiré - réservé au superviseur
  const [createSimCardOrder] = useCreateSimCardOrderMutation();

  // Récupération des données
  const { data: connectedUser } = useWhoIAmQuery();
  const agencyId = connectedUser?.agencyId;
  
  const { data: clientsData } = useGetClientsQuery(agencyId, {
    skip: !agencyId
  });
  const { data: agencySimCardStock } = useGetAgencySimCardsQuery(agencyId, {
    skip: !agencyId
  });
  const { data: agencySimCardOrder } = useGetAgencySimCardsOrderQuery(agencyId, {
    skip: !agencyId
  });
  const { data: agencySimCardReceipt } = useGetAgencySimCardsReceiptQuery(agencyId, {
    skip: !agencyId
  });
  const { data: linesData } = useGetPhonesQuery();
  // Récupération des lignes disponibles retirée - réservée au superviseur
  
  // Filtrer les lignes réservées pour cette agence
  const agencyReservedLines = linesData?.filter(line => {
    const hasReservation = line.reservationStatus === 'RESERVED' || 
                          line.user?.hasActiveReservation === true ||
                          line.user?.reservationStatus === 'RESERVED';
    
    // Vérifier l'association agence via différents champs possibles
    const isFromThisAgency = line.client?.agencyId === connectedUser?.agencyId ||
                            line.user?.agencyId === connectedUser?.agencyId ||
                            line.agencyId === connectedUser?.agencyId;
                            
    return hasReservation && isFromThisAgency;
  }) || [];

  // Debug temporaire
  React.useEffect(() => {
    console.log('🔍 DEBUG SimStock - Données reçues:', {
      connectedUser,
      agencySimCardStock,
      agencySimCardOrder: {
        raw: agencySimCardOrder,
        data: agencySimCardOrder?.data,
        status: agencySimCardOrder?.status,
        length: agencySimCardOrder?.data?.length
      },
      agencySimCardReceipt,
      linesData: linesData?.map(line => ({
        id: line.id,
        phoneNumber: line.phoneNumber,
        reservationStatus: line.reservationStatus,
        client: line.client,
        user: line.user,
        agencyId: line.agencyId,
        clientAgencyId: line.client?.agencyId,
        userAgencyId: line.user?.agencyId
      }))
    });
    
    // Debug spécifique pour lignes réservées
    console.log('🔍 DEBUG Lignes réservées pour agence:', {
      agencyId: connectedUser?.agencyId,
      agencyReservedLines: linesData?.filter(line => 
        line.reservationStatus === 'RESERVED' && 
        line.client?.agencyId === connectedUser?.agencyId
      )
    });
  }, [connectedUser, agencySimCardStock, agencySimCardOrder, agencySimCardReceipt, linesData]);

  // Données réelles
  const simOrders = agencySimCardOrder?.data || [];
  const simCards = agencySimCardStock?.sim_cards || [];
  
  console.log('🔍 DEBUG SimStock - Données traitées:', {
    simOrders,
    simCards,
    simOrdersLength: simOrders.length,
    simCardsLength: simCards.length
  });

  // Statistiques
  const stats = {
    total: simCards.length,
    active: simCards.filter(sim => sim.status === 'IN_USE').length,
    stock: simCards.filter(sim => sim.status === 'IN_STOCK').length,
    lost: simCards.filter(sim => sim.status === 'BLOCKED').length,
    inactive: simCards.filter(sim => sim.status === 'INACTIVE').length,
    ordered: simOrders.reduce((acc, order) => acc + (order.quantity - order.quantityReceived), 0)
  };

  // Gestionnaires d'événements
  const handleReceiveSubmit = async () => {
    console.log('🚀 DEBUT handleReceiveSubmit - Données:', {
      newICCID,
      deliveryDate,
      connectedUser: connectedUser?.agencyId,
      simOrders: simOrders?.length,
    });

    if (!newICCID) {
      console.error("❌ Invalid ICCID", {
        newICCID
      });
      setSnackbar({
        open: true,
        message: "Veuillez saisir un ICCID valide",
        severity: 'error'
      });
      return;
    }

    // Utiliser la première commande en cours ou créer une commande par défaut
    let availableOrder = simOrders?.find(order => (order.quantityReceived || 0) < order.quantity);
    
    console.log('📦 Commande disponible:', availableOrder);
    
    // Si aucune commande n'existe, créer une commande automatique
    if (!availableOrder && simOrders.length === 0) {
      console.log('⚠️ Aucune commande trouvée, création automatique d\'une commande...');
      
      try {
        // Créer une commande automatique de 1 SIM
        const newOrderResult = await createSimCardOrder({
          quantity: 1,
          agencyId: connectedUser?.agencyId,
          orderDate: new Date().toISOString(),
          status: 'PENDING'
        });
        
        if (newOrderResult.data) {
          console.log('✅ Commande automatique créée:', newOrderResult.data);
          availableOrder = newOrderResult.data;
        } else {
          console.error('❌ Erreur création commande automatique:', newOrderResult.error);
        }
      } catch (error) {
        console.error('❌ Erreur lors de création commande:', error);
      }
    }
    
    if (availableOrder) {
      try {
        console.log('⏳ Envoi receiveSimCard...', {
          sim_card_order_id: availableOrder.id,
          quantity: 1,
          received_date: deliveryDate,
        });
        
        const receiveNewSimCardDate = await receiveSimCard({
            sim_card_order_id: availableOrder.id,
            quantity: 1,
            received_date: deliveryDate,
        });

        console.log("✅ receiveSimCard réponse:", receiveNewSimCardDate);

        console.log('⏳ Envoi createSimCard...', {
          iccid: newICCID,
          status: "IN_STOCK",
          simCardReceiptId: receiveNewSimCardDate?.data?.simCardReceipt?.id,
          simCardOrderId: availableOrder.id,
          agencyId: connectedUser?.agencyId,
        });

        const newSimCard = await createSimCard({
          iccid: newICCID,
          status: "IN_STOCK",
          simCardReceiptId: receiveNewSimCardDate?.data?.simCardReceipt?.id,
          simCardOrderId: availableOrder.id,
          agencyId: connectedUser?.agencyId,
        });

        console.log("✅ createSimCard réponse:", newSimCard);
        
        if (receiveNewSimCardDate?.error || newSimCard?.error) {
          console.error("❌ Erreurs API:", {
            receiveError: receiveNewSimCardDate?.error,
            createError: newSimCard?.error
          });
          
          // Extraire le message d'erreur le plus pertinent
          const errorMessage = receiveNewSimCardDate?.error?.data?.message || 
                              newSimCard?.error?.data?.message ||
                              receiveNewSimCardDate?.error?.message ||
                              newSimCard?.error?.message ||
                              "Erreur lors de la déclaration de réception";
          
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        } else {
          console.log("🎉 Déclaration de réception SIM réussie !");
          setSnackbar({
            open: true,
            message: `Carte SIM ${newICCID} ajoutée au stock avec succès !`,
            severity: 'success'
          });
        }
        
      } catch (error) {
        console.error("❌ Erreur lors de la déclaration:", error);
        setSnackbar({
          open: true,
          message: "Erreur lors de la déclaration de réception",
          severity: 'error'
        });
      }
    } else {
      console.error("❌ Aucune commande disponible trouvée");
      setSnackbar({
        open: true,
        message: "Aucune commande disponible trouvée",
        severity: 'error'
      });
    }

    setShowReceiveModal(false);
    setNewICCID('');
    setDeliveryDate(dayjs().format('YYYY-MM-DD'));
  };

  // Gestionnaire d'activation retiré - réservé au superviseur

  const StatCard = ({ icon, title, value, color }) => (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ 
          p: 1.5, 
          bgcolor: `${color}.lighter`, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );

  // Filtrage des cartes SIM
  const filteredSims = simCards.filter(sim => {
    const matchesSearch = sim.iccid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (sim.assignedTo && sim.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || sim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des Cartes SIM</Typography>
        {(() => {
          const ordersInProgress = simOrders?.filter(order => (order.quantityReceived || 0) < order.quantity) || [];
          const hasOrdersInProgress = ordersInProgress.length > 0;
          
          const tooltipTitle = !hasOrdersInProgress 
            ? "Impossible de déclarer une réception : aucune commande en cours. Toutes les commandes ont été entièrement reçues ou il n'y a aucune commande active."
            : "Déclarer la réception d'une livraison de cartes SIM";
          
          return (
            <Tooltip title={tooltipTitle} arrow placement="bottom">
              <span>
                <Button
                  variant="contained"
                  startIcon={<LocalShippingIcon />}
                  onClick={() => setShowReceiveModal(true)}
                  disabled={!hasOrdersInProgress}
                >
                  Déclarer Réception
                </Button>
              </span>
            </Tooltip>
          );
        })()}
      </Box>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<CreditCardIcon color="primary" />}
            title="Total SIM"
            value={stats.total}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<PhoneAndroidIcon color="success" />}
            title="SIM Actives"
            value={stats.active}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<InventoryIcon color="warning" />}
            title="SIM En Stock"
            value={stats.stock}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<PhoneAndroidIcon color="info" />}
            title="Lignes Réservées"
            value={agencyReservedLines.length}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<ErrorOutlineIcon color="error" />}
            title="SIM Perdues"
            value={stats.lost}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<LocalShippingIcon color="secondary" />}
            title="En Attente"
            value={stats.ordered}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Alertes */}
      {stats.stock < 10 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Le stock de cartes SIM est bas (moins de 10 cartes). Veuillez commander de nouvelles cartes.
        </Alert>
      )}
      
      {agencyReservedLines.length > 0 && stats.stock > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Vous avez {agencyReservedLines.length} ligne(s) réservée(s) et {stats.stock} carte(s) SIM en stock. 
          Le superviseur pourra activer ces lignes avec vos cartes SIM disponibles.
        </Alert>
      )}

      {/* Barre de recherche et filtres */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            fullWidth
            placeholder="Rechercher par ICCID ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant={filterStatus === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilterStatus('all')}
            >
              Tous
            </Button>
            <Button
              variant={filterStatus === 'IN_USE' ? 'contained' : 'outlined'}
              size="small"
              color="success"
              onClick={() => setFilterStatus('IN_USE')}
              startIcon={<PhoneAndroidIcon />}
            >
              Actives
            </Button>
            <Button
              variant={filterStatus === 'IN_STOCK' ? 'contained' : 'outlined'}
              size="small"
              color="warning"
              onClick={() => setFilterStatus('IN_STOCK')}
              startIcon={<InventoryIcon />}
            >
              En Stock
            </Button>
            <Button
              variant={filterStatus === 'BLOCKED' ? 'contained' : 'outlined'}
              size="small"
              color="error"
              onClick={() => setFilterStatus('BLOCKED')}
              startIcon={<ErrorOutlineIcon />}
            >
              Perdues/Volées
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Section des commandes en cours */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Commandes en cours</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {(() => {
            const ordersInProgress = simOrders?.filter(order => (order.quantityReceived || 0) < order.quantity) || [];
            console.log('🔍 SimStock - Commandes en cours:', ordersInProgress.length, ordersInProgress);
            
            if (ordersInProgress.length === 0) {
              return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune commande en cours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes les commandes ont été entièrement reçues ou il n'y a aucune commande active
                  </Typography>
                </Box>
              );
            }
            
            return ordersInProgress.map(order => (
              <Box 
                key={order.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 2,
                  '&:not(:last-child)': { 
                    borderBottom: 1, 
                    borderColor: 'divider' 
                  }
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    Commande #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commandé par: {order.orderedBy?.firstname + ' ' + order.orderedBy?.lastname} le {dayjs(order.orderDate).format("dddd D MMMM YYYY")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Reçues: {order.quantityReceived || 0}/{order.quantity}
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setShowReceiveModal(true)}
                  >
                    Déclarer une réception
                  </Button>
                </Box>
              </Box>
            ));
          })()}
        </Box>
      </Paper>


      {/* Tableau des cartes SIM */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Stock des cartes SIM</Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ICCID</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de Réception</TableCell>
                <TableCell>Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSims?.map((sim) => (
                <TableRow key={sim.id} hover>
                  <TableCell>{sim.iccid}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        sim.status === 'IN_USE' ? 'Active' :
                        sim.status === 'INACTIVE' ? 'Inactive' :
                        sim.status === 'BLOCKED' ? 'Bloqué / Volé / Perdu' :
                        sim.status === 'IN_STOCK' ? 'En Stock' :
                        'Inconnu'
                      }
                      color={
                        sim.status === 'IN_USE' ? 'success' :
                        sim.status === 'IN_STOCK' ? 'warning' :
                        sim.status === 'BLOCKED' ? 'error' :
                        sim.status === 'INACTIVE' ? 'default' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dayjs(sim.createdAt || sim.receivedDate).format('dddd D MMMM YYYY')}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {sim.orderedBy && (
                        <Typography variant="body2">
                          Assignée à: {sim.orderedBy.firstname} {sim.orderedBy.lastname}
                        </Typography>
                      )}
                      {sim.reportDate && (
                        <Typography variant="body2">
                          Date de déclaration: {dayjs(sim.reportDate).format('dddd D MMMM YYYY')}
                        </Typography>
                      )}
                      {sim.simCardReceiptId && (
                        <Typography variant="body2">
                          N° De Reçu #${sim.simCardReceiptId}
                        </Typography>
                      )}
                      {/* Activation réservée au superviseur - bouton retiré pour les agences */}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Modal de réception */}
      <Dialog 
        open={showReceiveModal} 
        onClose={() => setShowReceiveModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Déclarer une réception d'une carte SIM
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={() => setShowReceiveModal(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Date de livraison
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              sx={{ mb: 3 }}
              helperText="Date indiquée sur le courrier de livraison"
            />

            <Typography variant="subtitle2" gutterBottom>
              ICCID de la carte SIM reçue
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={newICCID}
              onChange={(e) => setNewICCID(e.target.value)}
              placeholder="Entrez l'ICCID de la carte reçue"
              inputProps={{ maxLength: 20 }}
              sx={{ mb: 2 }}
              autoFocus
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Information
              </Typography>
              <Typography variant="body2">
                • La carte sera automatiquement ajoutée à votre stock
              </Typography>
              <Typography variant="body2">
                • Date de livraison: {dayjs(deliveryDate).format('dddd D MMMM YYYY')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceiveModal(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleReceiveSubmit}
            disabled={!newICCID}
          >
            Ajouter au stock
          </Button>

          </DialogActions>
      </Dialog>


      {/* Modal d'activation retirée - réservée au superviseur */}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SimCardManagement;