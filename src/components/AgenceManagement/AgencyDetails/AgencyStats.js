import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  SpeedDial as SpeedDialIcon,
  AccountBalance as AccountBalanceIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const AgencyStats = ({ agency }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedDialIcon fontSize="small" color="primary" /> Statistiques Générales
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">CA Total</Typography>
                  <Typography variant="h6">{agency.revenueTotal.toLocaleString('fr-FR')}€</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Solde actuel</Typography>
                  <Typography variant="h6">{agency.balance.toLocaleString('fr-FR')}€</Typography>
                </Grid>
                {agency.pendingPayment > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      Paiement en attente: {agency.pendingPayment.toLocaleString('fr-FR')}€
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="primary" /> Lignes Téléphoniques
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Lignes actives</Typography>
                  <Typography variant="h6" color="primary.main">{agency.activeLines}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Lignes en dette</Typography>
                  <Typography variant="h6" color={agency.debtLines > 0 ? "error.main" : "success.main"}>
                    {agency.debtLines}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Montant de dette</Typography>
                  <Typography variant="h6" color={agency.debtAmount > 0 ? "error.main" : "success.main"}>
                    {agency.debtAmount}€
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon fontSize="small" color="primary" /> Paramètres Financiers
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Prix d'abonnement</Typography>
                  <Typography variant="h6">{agency.subscriptionPrice}€</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Taux de commission</Typography>
                  <Typography variant="h6">{agency.commissionRate}%</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Commission par ligne</Typography>
                  <Typography variant="h6">
                    {(agency.subscriptionPrice * (agency.commissionRate / 100)).toFixed(2)}€
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AgencyStats;