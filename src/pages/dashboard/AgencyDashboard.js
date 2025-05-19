import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Alert, 
  IconButton, 
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Input,
  InputAdornment
} from '@mui/material';
import {
  People,
  SimCard,
  Wallet,
  Payment,
  Close as CloseIcon,
  PersonAdd
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import ClientSearch from '../../components/common/ClientSearch';
import StatusOverview from '../../components/common/StatusOverview';
import NewClientDialog from '../../components/common/NewClientDialog';
import { useGetClientsQuery } from "../../store/slices/clientsSlice";
import { useWhoIAmQuery } from "../../store/slices/authSlice";
import {useGetAgencySimCardsQuery} from "../../store/slices/agencySlice";

const AgencyDashboard = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');
  const connectedUser = useWhoIAmQuery();
  const client =  useGetClientsQuery(connectedUser?.currentData?.user?.agencyId);
  const agencySimCardStock = useGetAgencySimCardsQuery(connectedUser?.currentData?.user?.agencyId)
  // États pour le modal de création de client
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
//States for payment modal

  const mockData = {
    stats: {
      totalClients: 50,
      simStock: 3,
      agencyRevenue: {
        total: '250 €',
        commissions: '890 €'
      },
      supervisorCommission: '750 €'
    }
  };

  const handlePaymentSubmit = () => {
    if (!paymentAmount || isNaN(parseInt(paymentAmount)) || paymentAmount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }
    setError('');
    setIsPaymentModalOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    console.log('Payment confirmed:', paymentAmount);
    setIsConfirmDialogOpen(false);
    setPaymentAmount('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord Agence
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nombre de Clients"
            value={client?.currentData?.users?.length || "Chargement..."}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock Cartes SIM"
            value={agencySimCardStock?.currentData?.sim_cards?.length}
            icon={<SimCard />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenu Mensuel agence"
            value={mockData.stats.agencyRevenue.total}
            icon={<Wallet />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Commission Superviseur"
            value={mockData.stats.supervisorCommission}
            icon={<Payment />}
            color="info"
            onAction={() => setIsPaymentModalOpen(true)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Recherche Client
              </Typography>
              <Tooltip title="Ajouter un nouveau client" placement="top">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => setIsNewClientModalOpen(true)}
                >
                  <PersonAdd />
                </IconButton>
              </Tooltip>
            </Box>
            <ClientSearch />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Aperçu des Statuts
            </Typography>
            <StatusOverview />
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de paiement */}
      <Dialog 
        open={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            A payer au superviseur
            <IconButton 
              onClick={() => setIsPaymentModalOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Montant"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            error={!!error}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentModalOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handlePaymentSubmit} variant="contained">
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
      >
        <DialogTitle>
          Confirmer le paiement
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir soumettre un paiement de {paymentAmount}€ au superviseur ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirmPayment} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <NewClientDialog 
        open={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={(newClient) => {
          mockData.stats.totalClients += 1;
          // Ici vous pourriez ajouter le client à votre state ou faire un appel API
          console.log('Nouveau client créé:', newClient);
        }}
        agencyName="Agence Paris"
      />
    </Box>
  );
};

export default AgencyDashboard;