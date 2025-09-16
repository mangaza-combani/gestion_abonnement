import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon
} from '@mui/icons-material';
import { useCheckPaymentBeforeActivationMutation, useMarkPaymentReceivedMutation } from '../../store/slices/linePaymentsSlice';

const ActivationPaymentModal = ({ open, onClose, client, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Check, 2: Payment
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [checkPayment] = useCheckPaymentBeforeActivationMutation();
  const [markPayment] = useMarkPaymentReceivedMutation();

  // Reset modal state when opening/closing
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setInvoiceData(null);
      setPaymentMethod('');
      setPaymentReference('');
      setError(null);
      handleCheckPayment();
    }
  }, [open]);

  const handleCheckPayment = async () => {
    if (!client?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Vérification paiement pour client:', client.id);
      const response = await checkPayment(client.id).unwrap();

      console.log('📋 Réponse vérification paiement:', response);
      setInvoiceData(response);

      if (response.requiresPayment) {
        setCurrentStep(2); // Aller au paiement
      } else {
        // Déjà payé, peut activer directement
        handleSuccess();
      }
    } catch (err) {
      console.error('❌ Erreur vérification paiement:', err);
      setError(err.message || 'Erreur lors de la vérification du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Veuillez sélectionner un moyen de paiement');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paymentData = {
        phoneId: client.id,
        clientId: client.user?.id || client.client?.id,
        paymentMethod,
        reference: paymentReference || `ACTIVATION-${Date.now()}`,
        amount: invoiceData?.totalAmount,
        invoiceId: invoiceData?.invoiceId
      };

      console.log('💳 Traitement paiement:', paymentData);
      const response = await markPayment(paymentData).unwrap();

      console.log('✅ Paiement traité:', response);
      handleSuccess();
    } catch (err) {
      console.error('❌ Erreur paiement:', err);
      setError(err.message || 'Erreur lors du traitement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setCurrentStep(3); // Étape succès
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CARD': return <CreditCardIcon fontSize="small" />;
      case 'BANK_TRANSFER': return <BankIcon fontSize="small" />;
      case 'CASH': return <CashIcon fontSize="small" />;
      default: return <PaymentIcon fontSize="small" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const renderCheckStep = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Vérification des paiements requis
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>
            Vérification en cours... Génération de facture si nécessaire
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Client: {client?.user?.firstname} {client?.user?.lastname} - {client?.phoneNumber}
      </Typography>
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Paiement d'activation requis
        </Typography>
      </Box>

      {/* Détails de la facture */}
      {invoiceData && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Détails de la facture
          </Typography>

          {invoiceData.isNewInvoice && (
            <Chip
              label="Nouvelle facture générée"
              color="info"
              size="small"
              sx={{ mb: 1 }}
            />
          )}

          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Période"
                secondary={`${invoiceData.period || 'Mois courant'} (prorata inclus)`}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Montant forfait"
                secondary={formatCurrency(invoiceData.subscriptionAmount)}
              />
            </ListItem>
            {invoiceData.prorata && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Prorata"
                  secondary={formatCurrency(invoiceData.prorata)}
                />
              </ListItem>
            )}
            <Divider />
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle1" fontWeight="bold">Total à payer</Typography>}
                secondary={<Typography variant="h6" color="primary">{formatCurrency(invoiceData.totalAmount)}</Typography>}
              />
            </ListItem>
          </List>
        </Box>
      )}

      {/* Sélection moyen de paiement */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Moyen de paiement</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          label="Moyen de paiement"
          startAdornment={paymentMethod ? getPaymentMethodIcon(paymentMethod) : null}
        >
          <MenuItem value="CASH">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CashIcon sx={{ mr: 1 }} />
              Espèces
            </Box>
          </MenuItem>
          <MenuItem value="CARD">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CreditCardIcon sx={{ mr: 1 }} />
              Carte bancaire
            </Box>
          </MenuItem>
          <MenuItem value="BANK_TRANSFER">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BankIcon sx={{ mr: 1 }} />
              Virement bancaire
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Référence paiement (optionnel) */}
      <TextField
        fullWidth
        label="Référence de paiement (optionnel)"
        value={paymentReference}
        onChange={(e) => setPaymentReference(e.target.value)}
        placeholder="Ex: Reçu #123, Transaction ABC..."
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderSuccessStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Paiement validé !
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Le client peut maintenant être activé.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Redirection automatique...
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PaymentIcon color="primary" />
          <Typography variant="h6">
            Paiement d'activation
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {currentStep === 1 && renderCheckStep()}
        {currentStep === 2 && renderPaymentStep()}
        {currentStep === 3 && renderSuccessStep()}
      </DialogContent>

      <DialogActions>
        {currentStep < 3 && (
          <>
            <Button onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            {currentStep === 2 && (
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={isLoading || !paymentMethod}
                startIcon={isLoading ? <CircularProgress size={16} /> : <PaymentIcon />}
              >
                {isLoading ? 'Traitement...' : 'Confirmer le paiement'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ActivationPaymentModal;