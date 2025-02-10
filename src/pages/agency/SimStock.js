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
  TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import InventoryIcon from '@mui/icons-material/Inventory';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const SimCardManagement = () => {
  // États
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newICCID, setNewICCID] = useState('');

  // Données mockées
  const simOrders = [
    {
      id: 1,
      orderDate: '2024-02-01',
      orderedBy: 'Superviseur A',
      quantity: 10,
      receivedQuantity: 7,
    },
    {
      id: 2,
      orderDate: '2024-02-08',
      orderedBy: 'Superviseur B',
      quantity: 5,
      receivedQuantity: 0,
    }
  ];

  const simCards = [
    { id: 1, iccid: '8933150319xxxx', status: 'active', receivedDate: '2024-01-15', assignedTo: 'Client A' },
    { id: 2, iccid: '8933150319yyyy', status: 'stock', receivedDate: '2024-02-01', orderRef: 1 },
    { id: 3, iccid: '8933150319zzzz', status: 'lost', receivedDate: '2024-01-10', reportDate: '2024-02-05' }
  ];

  // Statistiques
  const stats = {
    total: simCards.length,
    active: simCards.filter(sim => sim.status === 'active').length,
    stock: simCards.filter(sim => sim.status === 'stock').length,
    lost: simCards.filter(sim => sim.status === 'lost').length,
    ordered: simOrders.reduce((acc, order) => acc + (order.quantity - order.receivedQuantity), 0)
  };

  // Gestionnaires d'événements
  const handleReceiveSubmit = () => {
    setShowReceiveModal(false);
    setShowConfirmModal(false);
    setSelectedOrder(null);
    setNewICCID('');
  };

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
        <Button
          variant="contained"
          startIcon={<LocalShippingIcon />}
          onClick={() => setShowReceiveModal(true)}
        >
          Déclarer Réception
        </Button>
      </Box>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CreditCardIcon color="primary" />}
            title="Total"
            value={stats.total}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<PhoneAndroidIcon color="success" />}
            title="Actives"
            value={stats.active}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<InventoryIcon color="warning" />}
            title="En Stock"
            value={stats.stock}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<ErrorOutlineIcon color="error" />}
            title="Perdues/Volées"
            value={stats.lost}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<LocalShippingIcon color="info" />}
            title="En Attente"
            value={stats.ordered}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Alerte de stock bas */}
      {stats.stock < 10 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Le stock de cartes SIM est bas (moins de 10 cartes). Veuillez commander de nouvelles cartes.
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
              variant={filterStatus === 'active' ? 'contained' : 'outlined'}
              size="small"
              color="success"
              onClick={() => setFilterStatus('active')}
              startIcon={<PhoneAndroidIcon />}
            >
              Actives
            </Button>
            <Button
              variant={filterStatus === 'stock' ? 'contained' : 'outlined'}
              size="small"
              color="warning"
              onClick={() => setFilterStatus('stock')}
              startIcon={<InventoryIcon />}
            >
              En Stock
            </Button>
            <Button
              variant={filterStatus === 'lost' ? 'contained' : 'outlined'}
              size="small"
              color="error"
              onClick={() => setFilterStatus('lost')}
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
          {simOrders
            .filter(order => order.receivedQuantity < order.quantity)
            .map(order => (
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
                    Commandé par: {order.orderedBy} le {order.orderDate}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Reçues: {order.receivedQuantity}/{order.quantity}
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowReceiveModal(true);
                    }}
                  >
                    Déclarer une réception
                  </Button>
                </Box>
              </Box>
            ))}
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
              {filteredSims.map((sim) => (
                <TableRow key={sim.id} hover>
                  <TableCell>{sim.iccid}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        sim.status === 'active' ? 'Active' :
                        sim.status === 'stock' ? 'En Stock' :
                        'Perdue/Volée'
                      }
                      color={
                        sim.status === 'active' ? 'success' :
                        sim.status === 'stock' ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{sim.receivedDate}</TableCell>
                  <TableCell>
                    {sim.assignedTo && `Assignée à: ${sim.assignedTo}`}
                    {sim.reportDate && `Date de déclaration: ${sim.reportDate}`}
                    {sim.orderRef && `Commande #${sim.orderRef}`}
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
            Déclarer une réception de carte SIM
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
              Commande
            </Typography>
            <TextField
              select
              fullWidth
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const order = simOrders.find(o => o.id === Number(e.target.value));
                setSelectedOrder(order);
              }}
              size="small"
              sx={{ mb: 3 }}
            >
              <MenuItem value="">Sélectionnez une commande</MenuItem>
              {simOrders
                .filter(order => order.receivedQuantity < order.quantity)
                .map(order => (
                  <MenuItem key={order.id} value={order.id}>
                    Commande #{order.id} - {order.orderedBy} ({order.receivedQuantity}/{order.quantity})
                  </MenuItem>
                ))}
            </TextField>

            <Typography variant="subtitle2" gutterBottom>
              ICCID
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={newICCID}
              onChange={(e) => setNewICCID(e.target.value)}
              placeholder="Entrez l'ICCID de la carte reçue"
              sx={{ mb: 2 }}
            />

            {selectedOrder && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Détails de la commande
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • Commandé par: {selectedOrder.orderedBy}
                  </Typography>
                  <Typography variant="body2">
                    • Date de commande: {selectedOrder.orderDate}
                  </Typography>
                  <Typography variant="body2">
                    • Cartes reçues: {selectedOrder.receivedQuantity} sur {selectedOrder.quantity}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceiveModal(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedOrder || !newICCID}
          >
            Valider
          </Button>

          </DialogActions>
      </Dialog>

      {/* Dialog de confirmation */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmation de réception
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Veuillez confirmer les informations suivantes :
            </Typography>
            <Box sx={{ mt: 2, pl: 2 }}>
              <Typography color="text.secondary" gutterBottom>
                • La carte SIM avec l'ICCID : {newICCID}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                • Sera associée à la commande #{selectedOrder?.id}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                • Commandée par : {selectedOrder?.orderedBy}
              </Typography>
              <Typography color="text.secondary">
                • Cette carte sera la {selectedOrder?.receivedQuantity + 1}e carte reçue sur {selectedOrder?.quantity}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleReceiveSubmit}
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimCardManagement;