import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  InputAdornment,
  Box,
  Button,
  Typography,
  Divider,
  Alert
} from '@mui/material';

const AgencySettingsForm = ({ agency, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    commissionRate: agency?.commissionRate || 15.8,
    subscriptionPrice: agency?.subscriptionPrice || 19,
  });

  // Met à jour le formulaire si l'agence change
  useEffect(() => {
    if (agency) {
      setFormData({
        commissionRate: agency.commissionRate,
        subscriptionPrice: agency.subscriptionPrice,
      });
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

  // Calcule la commission par ligne
  const commissionPerLine = (formData.subscriptionPrice * (formData.commissionRate / 100)).toFixed(2);

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Paramètres de {agency?.name}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ces paramètres définissent la répartition des revenus entre votre entreprise et l'agence.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Prix d'abonnement (€)"
            name="subscriptionPrice"
            type="number"
            fullWidth
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            }}
            value={formData.subscriptionPrice}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Taux de commission (%)"
            name="commissionRate"
            type="number"
            fullWidth
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            value={formData.commissionRate}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Récapitulatif
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="body2" color="text.secondary">Prix client</Typography>
          <Typography variant="h6">{formData.subscriptionPrice}€</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="body2" color="text.secondary">Commission agence</Typography>
          <Typography variant="h6">{commissionPerLine}€</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="body2" color="text.secondary">Revenu entreprise</Typography>
          <Typography variant="h6">{(formData.subscriptionPrice - commissionPerLine).toFixed(2)}€</Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="contained">
          Enregistrer
        </Button>
      </Box>
    </form>
  );
};

export default AgencySettingsForm;