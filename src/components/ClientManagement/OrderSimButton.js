import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useOrderReplacementSimMutation } from '../../store/slices/simReplacementSlice';

const OrderSimButton = ({ client, size = "medium" }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('10.00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderReplacementSim] = useOrderReplacementSimMutation();

  // Vérifier si c'est une ligne éligible pour commander SIM
  const canOrderSim = client?.isPausedForLostSim === true;

  const handleOrderSim = async () => {
    if (!paymentMethod || !amount) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await orderReplacementSim({
        phoneId: client.id,
        billing: {
          amount: parseFloat(amount),
          paymentMethod,
          notes: notes || `Commande SIM remplacement - ${client?.user?.firstname} ${client?.user?.lastname}`,
          description: 'Remplacement SIM après pause'
        }
      }).unwrap();

      console.log('✅ Commande SIM de remplacement créée:', result);

      // Fermer le modal
      setShowDialog(false);

      // Réinitialiser le formulaire
      setPaymentMethod('');
      setAmount('10.00');
      setNotes('');

    } catch (error) {
      console.error('❌ Erreur lors de la commande SIM:', error);
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canOrderSim) {
    return null; // Ne pas afficher le bouton si pas éligible
  }

  return (
    <>
      {/* Bouton principal */}
      <Button
        variant="contained"
        color="success"
        size={size}
        startIcon={<OrderIcon />}
        onClick={() => setShowDialog(true)}
        sx={{
          minWidth: 'auto',
          whiteSpace: 'nowrap',
          fontSize: size === 'small' ? '0.75rem' : '0.875rem'
        }}
      >
        Commander SIM
      </Button>

      {/* Modal de commande */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OrderIcon color="success" />
            Commander SIM de remplacement
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Informations client */}
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Numéro :</strong> {client?.phoneNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Raison :</strong> Ligne en pause pour perte/vol de SIM
              </Typography>
            </Alert>

            {/* Montant */}
            <TextField
              label="Montant (€)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            {/* Mode de paiement */}
            <FormControl fullWidth required>
              <InputLabel>Mode de paiement</InputLabel>
              <Select
                value={paymentMethod}
                label="Mode de paiement"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="CASH">Espèces</MenuItem>
                <MenuItem value="CARD">Carte bancaire</MenuItem>
                <MenuItem value="TRANSFER">Virement</MenuItem>
                <MenuItem value="CHECK">Chèque</MenuItem>
                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
              </Select>
            </FormControl>

            {/* Notes optionnelles */}
            <TextField
              label="Notes (optionnel)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              placeholder="Remarques sur le paiement ou la commande..."
            />

            {/* Information sur le processus */}
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Processus :</strong><br />
                1. Paiement encaissé → Commande créée<br />
                2. Ligne passe dans "À COMMANDER"<br />
                3. Superviseur confirme la commande<br />
                4. Ligne passe dans "À ACTIVER" (en attente SIM)
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleOrderSim}
            disabled={isSubmitting || !paymentMethod || !amount}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {isSubmitting ? 'Traitement...' : `Facturer ${amount}€ et commander`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderSimButton;