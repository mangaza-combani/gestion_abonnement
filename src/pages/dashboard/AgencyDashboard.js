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
  Tooltip
} from '@mui/material';
import {
  People,
  SimCard,
  Wallet,
  Payment,
  Phone as PhoneIcon,
  Close as CloseIcon,
  PersonAdd,
  Subscriptions
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import ClientSearch from '../../components/common/ClientSearch';
import StatusOverview from '../../components/common/StatusOverview';
import CreateClientModal from '../../components/ClientManagement/CreateClientModal';
import { useGetClientsQuery } from "../../store/slices/clientsSlice";
import { useWhoIAmQuery } from "../../store/slices/authSlice";
import {useGetAgencySimCardsQuery, useGetAgencyCommissionsQuery} from "../../store/slices/agencySlice";
import { useGetPhonesQuery } from "../../store/slices/linesSlice";

const AgencyDashboard = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');
  const { data: connectedUser } = useWhoIAmQuery();
  const agencyId = connectedUser?.agencyId;
  
  const client = useGetClientsQuery(agencyId, {
    skip: !agencyId
  });
  const agencySimCardStock = useGetAgencySimCardsQuery(agencyId, {
    skip: !agencyId
  });
  const agencyCommissions = useGetAgencyCommissionsQuery(agencyId, {
    skip: !agencyId
  });
  const { data: linesData } = useGetPhonesQuery(undefined, {
    skip: !agencyId
  });
  
  // Calcul des statistiques réelles
  const stats = React.useMemo(() => {
    const clients = client?.data?.users || [];
    const simCards = agencySimCardStock?.data?.sim_cards || [];
    const lines = linesData || [];
    const commissions = agencyCommissions?.data || {};
    
    // Filtrer les lignes de cette agence
    const agencyLines = lines.filter(line => {
      return line.client?.agencyId === agencyId ||
             line.user?.agencyId === agencyId ||
             line.agencyId === agencyId;
    });
    
    // Statistiques des cartes SIM
    const simStats = {
      total: simCards.length,
      enStock: simCards.filter(sim => sim.status === 'IN_STOCK').length,
      actives: simCards.filter(sim => sim.status === 'IN_USE').length,
      perdues: simCards.filter(sim => sim.status === 'BLOCKED').length
    };
    
    // Statistiques des lignes
    const lineStats = {
      total: agencyLines.length,
      actives: agencyLines.filter(line => line.phoneStatus === 'ACTIVE').length,
      reservees: agencyLines.filter(line => line.reservationStatus === 'RESERVED').length,
      aActiver: agencyLines.filter(line => line.phoneStatus === 'NEEDS_TO_BE_ACTIVATED').length,
      suspendues: agencyLines.filter(line => line.phoneStatus === 'SUSPENDED').length
    };
    
    // Statistiques des clients
    const clientStats = {
      total: clients.length,
      actifs: clients.filter(client => {
        // Client actif si au moins une ligne active
        return agencyLines.some(line => 
          line.clientId === client.id && line.phoneStatus === 'ACTIVE'
        );
      }).length,
      nouveaux: clients.filter(client => {
        const createdAt = new Date(client.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdAt >= monthAgo;
      }).length
    };
    
    // Statistiques détaillées pour StatusOverview
    const statusOverviewData = {
      pending: lineStats.aActiver,
      active: lineStats.actives,
      blocked: {
        total: lineStats.suspendues,
        details: {
          unpaid: agencyLines.filter(line => 
            line.paymentStatus === 'OVERDUE' && line.phoneStatus === 'SUSPENDED'
          ).length,
          cancelled: agencyLines.filter(line => 
            line.paymentStatus === 'CANCELLED'
          ).length,
          stolen: agencyLines.filter(line => 
            line.phoneStatus === 'BLOCKED'
          ).length
        }
      },
      suspended: lineStats.suspendues,
      unpaid: agencyLines.filter(line => line.paymentStatus === 'OVERDUE').length,
      latePayment: agencyLines.filter(line => {
        if (line.paymentStatus === 'OVERDUE' && line.lastPaymentDate) {
          const lastPayment = new Date(line.lastPaymentDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastPayment < thirtyDaysAgo;
        }
        return false;
      }).length,
    };

    return {
      clients: clientStats,
      simCards: simStats,
      lines: lineStats,
      commissions: {
        total: commissions.total_commissions || 0,
        superviseur: commissions.supervisor_commissions || 0,
        agence: commissions.agency_commissions || 0
      },
      statusOverview: statusOverviewData
    };
  }, [client?.data, agencySimCardStock?.data, linesData, agencyCommissions?.data, agencyId]);
  
  // États pour le modal de création de client
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
//States for payment modal


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

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clients Total"
            value={`${stats.clients.total}`}
            subtitle={`${stats.clients.actifs} actifs • ${stats.clients.nouveaux} nouveaux ce mois`}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cartes SIM"
            value={`${stats.simCards.enStock}`}
            subtitle={`${stats.simCards.total} total • ${stats.simCards.actives} en service • ${stats.simCards.perdues} perdues`}
            icon={<SimCard />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lignes Agence"
            value={`${stats.lines.actives}`}
            subtitle={`${stats.lines.total} total • ${stats.lines.reservees} réservées • ${stats.lines.aActiver} à activer`}
            icon={<PhoneIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Commissions"
            value={`${stats.commissions.total.toFixed(2)} €`}
            subtitle={`Dû au superviseur: ${stats.commissions.superviseur.toFixed(2)} €`}
            icon={<Wallet />}
            color="success"
            onAction={() => setIsPaymentModalOpen(true)}
          />
        </Grid>
      </Grid>

      {/* Alertes et notifications */}
      {stats.simCards.enStock <= 5 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Stock faible :</strong> Il ne vous reste que {stats.simCards.enStock} carte(s) SIM en stock. Pensez à commander.
        </Alert>
      )}
      
      {stats.lines.aActiver > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Activations en attente :</strong> Vous avez {stats.lines.aActiver} ligne(s) à activer avec vos cartes SIM.
        </Alert>
      )}
      
      {stats.commissions.superviseur > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Commission due :</strong> Vous devez {stats.commissions.superviseur.toFixed(2)} € au superviseur.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Recherche Client
              </Typography>
              <Tooltip title="Souscrire un abonnement" placement="top">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => setIsNewClientModalOpen(true)}
                >
                  <Subscriptions />
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
            <StatusOverview statusData={stats.statusOverview} />
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

      <CreateClientModal 
        open={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={(newClient) => {
          // Client créé via API - les données se mettront à jour automatiquement
          console.log('Nouveau client créé:', newClient);
          setIsNewClientModalOpen(false);
        }}
        agencyMode={true}
        useCreateClientRoute={true}
      />
    </Box>
  );
};

export default AgencyDashboard;