import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { useGetClientUnpaidInvoicesQuery } from '../../store/slices/linePaymentsSlice';
import ActivationPaymentModal from './ActivationPaymentModal';

const ActivationPaymentSection = ({ client }) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentMonthInvoice, setCurrentMonthInvoice] = useState(null);
  const [needsPayment, setNeedsPayment] = useState(false);

  // 🔍 DEBUG TEMPORAIRE
  console.log('🔍 ActivationPaymentSection rendu:', {
    hasClient: !!client,
    clientId: client?.id,
    userId: client?.user?.id,
    clientUserId: client?.client?.id
  });

  // Récupérer les factures impayées du client
  const {
    data: unpaidInvoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
    refetch: refetchInvoices
  } = useGetClientUnpaidInvoicesQuery(client?.user?.id || client?.client?.id, {
    skip: !client?.user?.id && !client?.client?.id
  });

  useEffect(() => {
    if (unpaidInvoices) {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const currentMonthInvoice = unpaidInvoices.find(invoice => {
        const invoiceMonth = new Date(invoice.createdAt).toISOString().substring(0, 7);
        return invoiceMonth === currentMonth;
      });

      setCurrentMonthInvoice(currentMonthInvoice);
      setNeedsPayment(!!currentMonthInvoice || unpaidInvoices.length > 0);

      console.log('📋 Analyse factures client:', {
        clientId: client?.id,
        totalUnpaidInvoices: unpaidInvoices.length,
        currentMonthInvoice: currentMonthInvoice ? 'EXISTE' : 'AUCUNE',
        needsPayment: !!currentMonthInvoice || unpaidInvoices.length > 0,
        invoices: unpaidInvoices.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          status: inv.status,
          createdAt: inv.createdAt,
          month: new Date(inv.createdAt).toISOString().substring(0, 7)
        }))
      });
    }
  }, [unpaidInvoices, client]);

  const handlePaymentClick = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    refetchInvoices(); // Rafraîchir les factures
  };

  const handlePaymentClose = () => {
    setPaymentModalOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPaymentStatusInfo = () => {
    if (isLoadingInvoices) {
      return {
        status: 'loading',
        message: 'Vérification des paiements...',
        color: 'info',
        icon: <CircularProgress size={16} />
      };
    }

    if (invoicesError) {
      return {
        status: 'error',
        message: 'Erreur lors du chargement des factures',
        color: 'error',
        icon: <WarningIcon />
      };
    }

    if (!unpaidInvoices || unpaidInvoices.length === 0) {
      return {
        status: 'paid',
        message: 'Aucune facture en attente - Prêt pour activation',
        color: 'success',
        icon: <CheckCircleIcon />
      };
    }

    if (currentMonthInvoice) {
      return {
        status: 'current_month_unpaid',
        message: `Facture du mois courant en attente (${formatCurrency(currentMonthInvoice.amount)})`,
        color: 'warning',
        icon: <ReceiptIcon />
      };
    }

    return {
      status: 'old_unpaid',
      message: `${unpaidInvoices.length} facture(s) en retard`,
      color: 'error',
      icon: <WarningIcon />
    };
  };

  const paymentStatus = getPaymentStatusInfo();

  return (
    <Card sx={{ mb: 2, border: '2px solid red' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            🔍 DEBUG - Paiement d'Activation
          </Typography>
        </Box>

        {/* DEBUG TEMPORAIRE - Informations client */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            DEBUG: Client ID: {client?.id}, User ID: {client?.user?.id || client?.client?.id}
          </Typography>
        </Alert>

        {/* Statut du paiement */}
        <Alert
          severity={paymentStatus.color}
          icon={paymentStatus.icon}
          sx={{ mb: 2 }}
        >
          {paymentStatus.message}
        </Alert>

        {/* Détails des factures si présentes */}
        {unpaidInvoices && unpaidInvoices.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Factures en attente de paiement :
            </Typography>

            <List dense>
              {unpaidInvoices.map((invoice) => {
                const isCurrentMonth = new Date(invoice.createdAt).toISOString().substring(0, 7) ===
                                      new Date().toISOString().substring(0, 7);

                return (
                  <ListItem key={invoice.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            {formatDate(invoice.createdAt)}
                            {isCurrentMonth && (
                              <Chip
                                label="Mois courant"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatCurrency(invoice.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            label={invoice.status || 'En attente'}
                            size="small"
                            color={isCurrentMonth ? 'warning' : 'error'}
                            variant="outlined"
                          />
                          {invoice.description && (
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                              {invoice.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Total à payer :
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0))}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Bouton de paiement */}
        {needsPayment ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<CreditCardIcon />}
            onClick={handlePaymentClick}
            disabled={isLoadingInvoices}
            sx={{ mt: 1 }}
          >
            {isLoadingInvoices ? 'Vérification...' : 'Payer l\'activation'}
          </Button>
        ) : (
          <Alert severity="success" sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Client prêt pour l'activation</Typography>
              <CheckCircleIcon color="success" />
            </Box>
          </Alert>
        )}

        {/* Informations de progression */}
        {isLoadingInvoices && (
          <LinearProgress sx={{ mt: 2 }} />
        )}

      </CardContent>

      {/* Modal de paiement */}
      <ActivationPaymentModal
        open={paymentModalOpen}
        onClose={handlePaymentClose}
        client={client}
        onSuccess={handlePaymentSuccess}
      />
    </Card>
  );
};

export default ActivationPaymentSection;