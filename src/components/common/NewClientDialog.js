import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const NewClientDialog = ({ open, onClose, onClientCreated, agencyName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    agency: agencyName,
    simCCID: '',
    payment: {
      simCard: 10,
      subscription: 0,
      total: 10
    }
  });

  const steps = ['Informations Client', 'Carte SIM', 'Paiement'];

  const calculateProrata = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate();
    return parseFloat(((19 * remainingDays) / daysInMonth).toFixed(2));
  };

  const handleSubmit = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    const total = (10 + calculateProrata()).toFixed(2);
    const newClient = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
      payment: {
        simCard: 10,
        subscription: calculateProrata(),
        total: parseFloat(total)
      }
    };
    onClientCreated(newClient);
    setIsConfirmDialogOpen(false);
    handleClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    setClientData({
      firstName: '',
      lastName: '',
      address: '',
      email: '',
      agency: agencyName,
      simCCID: '',
      payment: {
        simCard: 10,
        subscription: 0,
        total: 10
      }
    });
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={clientData.lastName}
                onChange={(e) => setClientData({...clientData, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={clientData.firstName}
                onChange={(e) => setClientData({...clientData, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                multiline
                rows={2}
                value={clientData.address}
                onChange={(e) => setClientData({...clientData, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agence"
                value={clientData.agency}
                disabled
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CCID de la carte SIM"
                value={clientData.simCCID}
                onChange={(e) => setClientData({...clientData, simCCID: e.target.value})}
                helperText="Veuillez saisir le CCID de la carte SIM qui sera attribuée au client"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Récapitulatif du paiement
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography>Carte SIM : 10€</Typography>
                <Typography>
                  Prorata du mois en cours : {calculateProrata()}€
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total à payer : {(10 + calculateProrata()).toFixed(2)}€
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Nouveau Client
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setActiveStep((prev) => prev - 1)}
          disabled={activeStep === 0}
        >
          Retour
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeStep === steps.length - 1) {
              handleSubmit();
            } else {
              setActiveStep((prev) => prev + 1);
            }
          }}
        >
          {activeStep === steps.length - 1 ? 'Valider' : 'Suivant'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Dialog de confirmation */}
    <Dialog
      open={isConfirmDialogOpen}
      onClose={() => setIsConfirmDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Confirmation de création de client
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Veuillez confirmer les informations suivantes :
          </Typography>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              • Le CCID de la carte SIM est : {clientData.simCCID}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              • Le client a bien payé : {(10 + calculateProrata()).toFixed(2)}€
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              • Détail du paiement :
            </Typography>
            <Box sx={{ pl: 3 }}>
              <Typography color="text.secondary" gutterBottom>
                - Carte SIM : 10€
              </Typography>
              <Typography color="text.secondary">
                - Prorata : {calculateProrata()}€
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsConfirmDialogOpen(false)}>
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirmSubmit}
          color="primary"
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default NewClientDialog;