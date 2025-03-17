import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Box,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert
} from '@mui/material';

const AgencyPaymentForm = ({ agency, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: agency?.pendingPayment?.toString() || '',
    method: 'bank',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Met à jour le montant si l'agence change
  useEffect(() => {
    if (agency) {
      setFormData(prev => ({
        ...prev,
        amount: agency.pendingPayment.toString()
      }));
    }
  }, [agency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Valider un paiement pour {agency?.name}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ce formulaire permet de confirmer que vous avez bien reçu un paiement de l'agence.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Montant (€)"
            name="amount"
            type="number"
            fullWidth
            required
            value={formData.amount}
            onChange={handleChange}
            inputProps={{ min: "0", step: "0.01" }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Date de réception"
            name="date"
            type="date"
            fullWidth
            required
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Méthode de paiement</FormLabel>
            <RadioGroup
              name="method"
              value={formData.method}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="bank" control={<Radio />} label="Virement bancaire" />
              <FormControlLabel value="check" control={<Radio />} label="Chèque" />
              <FormControlLabel value="cash" control={<Radio />} label="Espèces" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Référence du paiement"
            name="reference"
            fullWidth
            value={formData.reference}
            onChange={handleChange}
            helperText="Référence du virement, numéro du chèque, etc."
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Récapitulatif
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Montant en attente: {agency?.pendingPayment?.toLocaleString('fr-FR')}€
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Montant à confirmer: {parseFloat(formData.amount)?.toLocaleString('fr-FR')}€
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reste à payer: {Math.max(0, agency?.pendingPayment - parseFloat(formData.amount))?.toLocaleString('fr-FR')}€
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Confirmer le paiement
        </Button>
      </Box>
    </form>
  );
};

export default AgencyPaymentForm;
