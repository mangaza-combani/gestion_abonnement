import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  InputAdornment,
  Alert,
  Stack
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  DateRange as DateRangeIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

const UpdatePaymentDialog = ({ open, onClose, onSubmit, account }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    cardLastFour: '',
    cardExpiry: '',
    cardHolderName: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when account changes or dialog opens
  useEffect(() => {
    if (account && open) {
      setFormData({
        bankName: account.bankName || '',
        cardLastFour: account.cardLastFour || '',
        cardExpiry: account.cardExpiry || '',
        cardHolderName: account.cardHolderName || ''
      });
      setErrors({});
    }
  }, [account, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Le nom de la banque est requis';
    }

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Le nom de la carte est requis';
    }

    if (!formData.cardLastFour.trim()) {
      newErrors.cardLastFour = 'Les 4 derniers chiffres de la carte sont requis';
    } else if (!/^\d{4}$/.test(formData.cardLastFour)) {
      newErrors.cardLastFour = 'Doit contenir exactement 4 chiffres';
    }

    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = 'La date d\'expiration est requise';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Format requis: MM/AA (ex: 12/25)';
    } else {
      // Validate expiry date is not in the past
      const [month, year] = formData.cardExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      now.setDate(1); // Set to first day of current month for comparison
      
      if (expiryDate < now) {
        newErrors.cardExpiry = 'La date d\'expiration ne peut pas être dans le passé';
      }
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    handleInputChange('cardExpiry', value);
  };

  const handleCardLastFourChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4); // Only digits, max 4
    handleInputChange('cardLastFour', value);
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
                Ces informations permettent de suivre les prélèvements automatiques 
                et de vous alerter avant l'expiration de la carte.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom de la carte"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value.toUpperCase())}
                  error={!!errors.cardHolderName}
                  helperText={errors.cardHolderName}
                  placeholder="ex: JOHN DOE"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Banque"
                  name="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  error={!!errors.bankName}
                  helperText={errors.bankName}
                  placeholder="ex: Crédit Agricole, BNP Paribas, Société Générale..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="4 derniers chiffres"
                  name="cardLastFour"
                  value={formData.cardLastFour}
                  onChange={handleCardLastFourChange}
                  error={!!errors.cardLastFour}
                  helperText={errors.cardLastFour}
                  placeholder="1234"
                  inputProps={{
                    maxLength: 4,
                    pattern: '[0-9]{4}'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon color="action" />
                        <Typography variant="body2" color="text.disabled" sx={{ ml: 0.5 }}>
                          ****
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Date d'expiration"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleCardExpiryChange}
                  error={!!errors.cardExpiry}
                  helperText={errors.cardExpiry}
                  placeholder="MM/AA"
                  inputProps={{
                    maxLength: 5
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
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