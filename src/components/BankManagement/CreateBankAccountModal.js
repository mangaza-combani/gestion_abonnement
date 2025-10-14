import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Stack,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useCreateBankAccountMutation } from '../../store/slices/bankManagementSlice';

const CreateBankAccountModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountHolder: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const [createBankAccount, { isLoading, isSuccess, isError, error }] = useCreateBankAccountMutation();

  useEffect(() => {
    if (open) {
      setFormData({
        accountName: '',
        accountHolder: '',
        notes: '',
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (isSuccess && open) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isSuccess, open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName) {
      newErrors.accountName = 'Le nom du compte est requis';
    }

    if (!formData.accountHolder) {
      newErrors.accountHolder = 'Le titulaire du compte est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createBankAccount(formData).unwrap();
    } catch (err) {
      console.error('Erreur création compte bancaire:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      accountName: '',
      accountHolder: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={2}>
          <BankIcon color="primary" />
          <Box>
            Créer un nouveau compte bancaire
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <TextField
            fullWidth
            required
            label="Nom du compte"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            placeholder="Ex: Compte Principal Agence Paris"
            error={!!errors.accountName}
            helperText={errors.accountName || 'Nom descriptif du compte bancaire'}
          />

          <TextField
            fullWidth
            required
            label="Titulaire du compte"
            name="accountHolder"
            value={formData.accountHolder}
            onChange={handleChange}
            placeholder="Ex: SARL TELECOM PLUS"
            error={!!errors.accountHolder}
            helperText={errors.accountHolder || 'Nom du titulaire du compte bancaire'}
          />

          <TextField
            fullWidth
            label="Notes (optionnel)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes administratives..."
            multiline
            rows={3}
            helperText="Notes internes pour ce compte bancaire"
          />
        </Stack>

        {isSuccess && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Compte bancaire créé avec succès !
          </Alert>
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error?.data?.error || 'Erreur lors de la création du compte bancaire'}
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
          {isLoading ? 'Création...' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBankAccountModal;
