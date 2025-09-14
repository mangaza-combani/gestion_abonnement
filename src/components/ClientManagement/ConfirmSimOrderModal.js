import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import { SimCard as SimIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useConfirmSimOrderMutation } from '../../store/slices/clientsSlice';

const ConfirmSimOrderModal = ({ open, onClose, lineRequest }) => {
  const [orderDate, setOrderDate] = useState('');
  const [quantity] = useState(1); // Par défaut 1 SIM pour remplacement
  const [confirmSimOrder, { isLoading, error }] = useConfirmSimOrderMutation();

  const handleConfirm = async () => {
    if (!orderDate) {
      return;
    }

    try {
      await confirmSimOrder({
        lineRequestId: lineRequest.id,
        orderDate,
        quantity
      }).unwrap();

      onClose(true); // true indique succès
    } catch (error) {
      console.error('Erreur lors de la confirmation de commande SIM:', error);
    }
  };

  const handleClose = () => {
    setOrderDate('');
    onClose(false);
  };

  // Extraire les informations du client depuis lineRequest
  const clientInfo = lineRequest?.user || {};
  const isReplacementSim = lineRequest?.notes?.includes('REPLACEMENT_SIM');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SimIcon color="primary" />
          <Typography variant="h6">
            Confirmer la commande SIM
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Informations client */}
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              Client: <strong>{clientInfo.firstname} {clientInfo.lastname}</strong>
            </Typography>
            <Typography variant="body2">
              {isReplacementSim ?
                '🔄 Remplacement SIM (SIM perdue/volée)' :
                '📱 Nouvelle ligne'
              }
            </Typography>
          </Alert>

          {/* Notes de la demande */}
          {lineRequest?.notes && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Détails de la demande:
              </Typography>
              <Chip
                label={isReplacementSim ? 'Remplacement SIM' : 'Nouvelle ligne'}
                color={isReplacementSim ? 'warning' : 'primary'}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {lineRequest.notes}
              </Typography>
            </Box>
          )}

          {/* Date de commande */}
          <TextField
            label="Date de commande"
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
            required
            fullWidth
            helperText="Date qui apparaîtra sur le courrier de commande SIM"
          />

          {/* Quantité (fixée à 1 pour remplacement) */}
          <TextField
            label="Quantité"
            type="number"
            value={quantity}
            disabled
            fullWidth
            helperText={isReplacementSim ? "1 SIM pour remplacement" : "Nombre de SIM à commander"}
          />

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
          disabled={!orderDate || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SimIcon />}
        >
          {isLoading ? 'Confirmation...' : 'Confirmer la commande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSimOrderModal;