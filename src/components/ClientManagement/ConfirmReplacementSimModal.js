import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  CheckCircle as CheckIcon,
  AccountBalance as RedIcon
} from '@mui/icons-material';
import { useConfirmReplacementSimOrderMutation } from '../../store/slices/clientsSlice';

const ConfirmReplacementSimModal = ({ open, onClose, client }) => {
  const [confirmReplacementSimOrder, { isLoading, error }] = useConfirmReplacementSimOrderMutation();

  const handleConfirm = async () => {
    if (!client?.phoneId) {
      console.error('PhoneId manquant pour la confirmation de remplacement SIM');
      return;
    }

    try {
      await confirmReplacementSimOrder({
        phoneId: client.phoneId
      }).unwrap();

      onClose(true); // true indique succès
    } catch (error) {
      console.error('Erreur lors de la confirmation de remplacement SIM:', error);
    }
  };

  const handleClose = () => {
    onClose(false);
  };

  // Extraire les informations du client
  const clientInfo = client?.user || {};
  const redAccount = client?.redAccount || {};

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapIcon color="warning" />
          <Typography variant="h6">
            Confirmer Commande SIM de Remplacement
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Informations client */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Client: <strong>{clientInfo.firstname} {clientInfo.lastname}</strong>
            </Typography>
            <Typography variant="body2">
              📱 Ligne: {client?.phoneNumber || 'Numéro non disponible'}
            </Typography>
            <Typography variant="body2">
              🔄 <strong>Remplacement SIM</strong> (SIM perdue/volée)
            </Typography>
          </Alert>

          {/* Compte RED utilisé */}
          {redAccount.redAccountId && (
            <Box sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300'
            }}>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <RedIcon fontSize="small" color="primary" />
                Compte RED utilisé
              </Typography>
              <Typography variant="body2">
                <strong>Identifiant:</strong> {redAccount.redAccountId || redAccount.accountName}
              </Typography>
            </Box>
          )}

          {/* Question de confirmation */}
          <Alert severity="info">
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ❓ Avez-vous commandé la carte SIM de remplacement sur RED ?
            </Typography>
            <Typography variant="body2">
              Confirmez que vous avez bien effectué la commande sur le site RED avec le compte mentionné ci-dessus.
            </Typography>
          </Alert>

          {/* Erreur */}
          {error && (
            <Alert severity="error">
              Erreur lors de la confirmation: {error.data?.message || error.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {isLoading ? 'Confirmation...' : 'Oui, j\'ai commandé sur RED'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmReplacementSimModal;