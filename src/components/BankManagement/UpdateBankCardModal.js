import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CreditCard as CardIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useUpdateBankCardMutation } from '../../store/slices/bankManagementSlice';

const UpdateBankCardModal = ({ open, onClose, bankAccount, card }) => {
  const [formData, setFormData] = useState({
    cardName: '',
    bankName: '',
    cardLastFour: '',
    cardExpiry: '',
    isPrimary: false,
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const [updateCard, { isLoading, isSuccess, isError, error }] = useUpdateBankCardMutation();

  useEffect(() => {
    if (card && open) {
      setFormData({
        cardName: card.cardName || '',
        bankName: card.bankName || '',
        cardLastFour: card.cardLastFour || '',
        cardExpiry: card.cardExpiry || '',
        isPrimary: card.isPrimary || false,
        isActive: card.isActive !== undefined ? card.isActive : true,
      });
      setErrors({});
    }
  }, [card, open]);

  useEffect(() => {
    if (isSuccess && open) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isSuccess, open, onClose]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateExpiryFormat = (value) => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return expiryRegex.test(value);
  };

  const validateLastFour = (value) => {
    return /^\d{4}$/.test(value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardName) {
      newErrors.cardName = 'Le nom de la carte est requis';
    }

    if (!formData.cardLastFour) {
      newErrors.cardLastFour = 'Les 4 derniers chiffres sont requis';
    } else if (!validateLastFour(formData.cardLastFour)) {
      newErrors.cardLastFour = 'Format invalide (4 chiffres requis)';
    }

    if (!formData.cardExpiry) {
      newErrors.cardExpiry = "La date d'expiration est requise";
    } else if (!validateExpiryFormat(formData.cardExpiry)) {
      newErrors.cardExpiry = 'Format invalide (MM/YY requis, ex: 12/25)';
    } else {
      const [month, year] = formData.cardExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month), 0);
      if (expiryDate < new Date()) {
        newErrors.cardExpiry = 'Cette carte est déjà expirée';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateCard({
        cardId: card.id,
        ...formData,
      }).unwrap();
    } catch (err) {
      console.error('Erreur mise à jour carte:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      cardName: '',
      bankName: '',
      cardLastFour: '',
      cardExpiry: '',
      isPrimary: false,
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!card || !bankAccount) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={2}>
          <CardIcon color="primary" />
          <Box>
            <Typography variant="h6">Mettre à jour la carte bancaire</Typography>
            <Typography variant="caption" color="text.secondary">
              {bankAccount.accountName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Informations actuelles */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Informations actuelles
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">Nom : {card.cardName || 'N/A'}</Typography>
            <Typography variant="body2">Carte : **** {card.cardLastFour || 'N/A'}</Typography>
            <Typography variant="body2">
              Expiration : {card.cardExpiry || 'Non renseigné'}
            </Typography>
            {card.bankName && <Typography variant="body2">Banque : {card.bankName}</Typography>}
          </Stack>
        </Alert>

        <Divider sx={{ mb: 3 }}>
          <Chip label="Nouvelles informations" size="small" />
        </Divider>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nom de la carte"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="Ex: Carte Principal Paris, Carte Secours..."
              error={!!errors.cardName}
              helperText={errors.cardName || 'Nom pour identifier la carte facilement'}
              InputProps={{
                startAdornment: <CardIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nom de la banque (optionnel)"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Ex: Crédit Agricole, BNP Paribas..."
              InputProps={{
                startAdornment: <BankIcon color="action" sx={{ mr: 1 }} />,
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
              onChange={handleChange}
              placeholder="1234"
              inputProps={{ maxLength: 4 }}
              error={!!errors.cardLastFour}
              helperText={errors.cardLastFour || 'Les 4 derniers chiffres de la carte'}
              InputProps={{
                startAdornment: (
                  <Typography color="text.secondary" sx={{ mr: 1 }}>
                    ****
                  </Typography>
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
              onChange={handleChange}
              placeholder="MM/YY"
              inputProps={{ maxLength: 5 }}
              error={!!errors.cardExpiry}
              helperText={errors.cardExpiry || 'Format: MM/YY (ex: 12/25)'}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  name="isPrimary"
                  color="primary"
                />
              }
              label="Carte principale"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Si activé, cette carte deviendra la carte principale
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                  color="success"
                />
              }
              label="Carte active"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Désactiver une carte ne la supprime pas, elle reste dans l'historique
            </Typography>
          </Grid>
        </Grid>

        {isSuccess && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Carte bancaire mise à jour avec succès !
          </Alert>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error?.data?.error || 'Erreur lors de la mise à jour de la carte'}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} startIcon={<CloseIcon />} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isLoading || isSuccess}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBankCardModal;
