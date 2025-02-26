import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';

const NewLineDialog = ({ open, onClose, onSubmit, accountId, clients = [] }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    phoneNumber: '',
    simCardId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    // Format as 06XX XX XX XX
    if (value.length > 2) value = value.slice(0, 2) + ' ' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + ' ' + value.slice(5);
    if (value.length > 8) value = value.slice(0, 8) + ' ' + value.slice(8);
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, accountId });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      phoneNumber: '',
      simCardId: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Nouvelle Ligne
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="client-select-label">Client</InputLabel>
                <Select
                  labelId="client-select-label"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.nom} {client.prenom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Numéro de téléphone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="06XX XX XX XX"
                helperText="Format: 06XX XX XX XX"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="ICCID Carte SIM"
                name="simCardId"
                value={formData.simCardId}
                onChange={handleChange}
                helperText="Entrez l'ICCID de la carte SIM à associer"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={
              !formData.clientId ||
              !formData.phoneNumber ||
              !formData.simCardId
            }
          >
            Ajouter
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewLineDialog;