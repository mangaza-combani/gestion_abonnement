import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Paramètres de Facturation
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Prix de Vente (€)"
                defaultValue="19.00"
                type="number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Commission Agence (%)"
                defaultValue="15.8"
                type="number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Prix Carte SIM (€)"
                defaultValue="10.00"
                type="number"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 2 }}
              >
                Enregistrer
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Paramètres de Notification
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Seuil d'Alerte Stock SIM"
                defaultValue="10"
                type="number"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Délai Relance Paiement (jours)"
                defaultValue="5"
                type="number"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 2 }}
              >
                Enregistrer
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;