import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useGetBankAccountsForSelectionQuery } from '../../store/slices/bankManagementSlice';

const UpdatePaymentDialog = ({ open, onClose, onSubmit, account }) => {
  const [formData, setFormData] = useState({
    bankAccountId: '',
    bankCardId: ''
  });
  const [errors, setErrors] = useState({});

  const { data: bankAccountsData, isLoading: bankAccountsLoading } = useGetBankAccountsForSelectionQuery();

  // Initialize form data when account changes or dialog opens
  useEffect(() => {
    if (account && open) {
      setFormData({
        bankAccountId: account.bankAccountId || '',
        bankCardId: account.bankCardId || ''
      });
      setErrors({});
    }
  }, [account, open]);

  const bankAccounts = bankAccountsData?.data || [];
  const selectedBankAccount = bankAccounts.find(acc => acc.id === formData.bankAccountId);
  const availableCards = selectedBankAccount?.cards || [];
  const selectedCard = availableCards.find(card => card.id === formData.bankCardId);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Le compte bancaire est requis';
    }

    if (!formData.bankCardId) {
      newErrors.bankCardId = 'La carte bancaire est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleBankAccountChange = (e) => {
    const newBankAccountId = e.target.value;
    setFormData({
      bankAccountId: newBankAccountId,
      bankCardId: '' // Reset card selection when bank account changes
    });
    if (errors.bankAccountId) {
      setErrors(prev => ({ ...prev, bankAccountId: '' }));
    }
  };

  const handleBankCardChange = (e) => {
    setFormData(prev => ({ ...prev, bankCardId: e.target.value }));
    if (errors.bankCardId) {
      setErrors(prev => ({ ...prev, bankCardId: '' }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCardIcon color="primary" />
            <Typography variant="h6">
              Modifier les informations de paiement
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Compte :</strong> {account?.redAccountId}<br/>
                Sélectionnez le compte bancaire et la carte à utiliser pour ce compte RED.
              </Typography>
            </Alert>

            {bankAccountsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : bankAccounts.length === 0 ? (
              <Alert severity="warning">
                Aucun compte bancaire disponible. Veuillez d'abord créer un compte bancaire dans la page Gestion Bancaire.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!errors.bankAccountId}>
                    <InputLabel>Compte Bancaire</InputLabel>
                    <Select
                      value={formData.bankAccountId}
                      onChange={handleBankAccountChange}
                      label="Compte Bancaire"
                      startAdornment={<AccountBalanceIcon color="action" sx={{ ml: 1, mr: 0.5 }} />}
                    >
                      {bankAccounts.map((bankAccount) => (
                        <MenuItem key={bankAccount.id} value={bankAccount.id}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {bankAccount.accountName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Banque: {bankAccount.accountHolder} • {bankAccount.cards.length} carte(s)
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.bankAccountId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {errors.bankAccountId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {formData.bankAccountId && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!!errors.bankCardId} disabled={availableCards.length === 0}>
                      <InputLabel>Carte Bancaire</InputLabel>
                      <Select
                        value={formData.bankCardId}
                        onChange={handleBankCardChange}
                        label="Carte Bancaire"
                        startAdornment={<CreditCardIcon color="action" sx={{ ml: 1, mr: 0.5 }} />}
                      >
                        {availableCards.length === 0 ? (
                          <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                              Aucune carte disponible pour ce compte
                            </Typography>
                          </MenuItem>
                        ) : (
                          availableCards.map((card) => (
                            <MenuItem key={card.id} value={card.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight="medium">
                                    {card.cardName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {card.bankName && `${card.bankName} • `}**** {card.cardLastFour} • Exp: {card.cardExpiry}
                                  </Typography>
                                </Box>
                                {card.isPrimary && (
                                  <Chip label="Principale" color="primary" size="small" />
                                )}
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.bankCardId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.bankCardId}
                        </Typography>
                      )}
                      {availableCards.length === 0 && formData.bankAccountId && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                          Ajoutez d'abord une carte à ce compte bancaire
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            )}

            {formData.bankAccountId && formData.bankCardId && selectedCard && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Récapitulatif" size="small" icon={<InfoIcon />} />
                </Divider>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Compte Bancaire
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedBankAccount?.accountName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBankAccount?.accountHolder}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Carte Bancaire
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedCard.cardName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCard.bankName && `${selectedCard.bankName} • `}**** {selectedCard.cardLastFour} • Exp: {selectedCard.cardExpiry}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={onClose}
            color="inherit"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            variant="contained"
            startIcon={<CreditCardIcon />}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdatePaymentDialog;