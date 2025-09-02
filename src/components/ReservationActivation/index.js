import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Stack
} from '@mui/material';
import {
  SimCard as SimCardIcon,
  Phone as PhoneIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useActivateWithSimMutation } from '../../store/slices/lineReservationsSlice';

const ReservationActivation = ({ 
  open, 
  onClose, 
  reservation, 
  onSuccess 
}) => {
  const [iccid, setIccid] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [activateWithSim, { isLoading, error }] = useActivateWithSimMutation();

  const steps = ['Scan carte SIM', 'Activation', 'Confirmation'];

  const handleScanComplete = () => {
    if (iccid.trim().length >= 15) { // Longueur minimale d'un ICCID
      setActiveStep(1);
    }
  };

  const handleActivation = async () => {
    try {
      const result = await activateWithSim({
        phoneId: reservation.id,
        iccid: iccid.trim()
      }).unwrap();

      setActiveStep(2);
      
      // Attendre un peu pour montrer la confirmation
      setTimeout(() => {
        onSuccess(result);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur activation:', error);
    }
  };

  const handleClose = () => {
    setIccid('');
    setActiveStep(0);
    onClose();
  };

  if (!reservation) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <SimCardIcon color="primary" />
          <Typography variant="h6">
            Activation de ligne réservée
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info">
            <AlertTitle>Ligne réservée pour {reservation.reservedForClient?.firstname} {reservation.reservedForClient?.lastname}</AlertTitle>
            <Typography variant="body2">
              Numéro: <strong>{reservation.phoneNumber}</strong><br/>
              Compte RED: <strong>{reservation.redAccount?.redAccountId}</strong><br/>
              Réservée le: <strong>{new Date(reservation.reservationDate).toLocaleDateString()}</strong>
            </Typography>
          </Alert>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Scannez ou saisissez l'ICCID de la carte SIM à activer :
            </Typography>
            <TextField
              fullWidth
              label="ICCID de la carte SIM"
              value={iccid}
              onChange={(e) => setIccid(e.target.value)}
              placeholder="89331012345678901234"
              inputProps={{ maxLength: 25 }}
              helperText="L'ICCID se trouve généralement sur la carte SIM (19-20 chiffres)"
              sx={{ mt: 2 }}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Activation en cours...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Association de la carte SIM {iccid} avec le numéro {reservation.phoneNumber}
            </Typography>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Activation réussie !
            </Typography>
            <Typography variant="body2" color="text.secondary">
              La ligne {reservation.phoneNumber} est maintenant activée avec la carte SIM {iccid}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Erreur d'activation</AlertTitle>
            {error.data?.message || error.message || 'Une erreur est survenue lors de l\'activation'}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Annuler
        </Button>
        
        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handleScanComplete}
            disabled={!iccid.trim() || iccid.trim().length < 15}
            startIcon={<PhoneIcon />}
          >
            Continuer
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleActivation}
            disabled={isLoading}
            startIcon={<SimCardIcon />}
          >
            {isLoading ? 'Activation...' : 'Activer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReservationActivation;