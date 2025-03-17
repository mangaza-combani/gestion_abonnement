// src/components/agencies/AgencyList/AgencyCards.jsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Button,
  Divider,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const AgencyCards = ({ 
  agencies, 
  onToggleStatus, 
  onOpenDetails, 
  onOpenSettings, 
  onOpenPayment 
}) => {
  return (
    <Grid container spacing={3}>
      {agencies.map((agency) => (
        <Grid item xs={12} md={6} lg={4} key={agency.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" gap={2} alignItems="center">
                  <Avatar 
                    sx={{ 
                      bgcolor: agency.status === 'active' ? 'success.main' : 'grey.500',
                      width: 56,
                      height: 56
                    }}
                  >
                    {agency.name.slice(0, 1)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {agency.name}
                    </Typography>
                    <Chip 
                      label={agency.status === 'active' ? 'Actif' : 'Inactif'} 
                      color={agency.status === 'active' ? "success" : "default"} 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => onOpenDetails(agency)}>
                  <PersonIcon />
                </IconButton>
              </Box>

              <Typography variant="body2" gutterBottom>
                {agency.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {agency.phone}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lignes actives
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {agency.activeLines}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lignes en dette
                  </Typography>
                  <Typography variant="h6" color={agency.debtLines > 0 ? "error.main" : "success.main"}>
                    {agency.debtLines} ({agency.debtAmount}€)
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    CA Total
                  </Typography>
                  <Typography variant="h6">
                    {agency.revenueTotal.toLocaleString('fr-FR')}€
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Solde
                  </Typography>
                  <Box>
                    <Typography variant="h6">
                      {agency.balance.toLocaleString('fr-FR')}€
                    </Typography>
                    {agency.pendingPayment > 0 && (
                      <Chip 
                        label={`${agency.pendingPayment.toLocaleString('fr-FR')}€ à verser`} 
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Button 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  onClick={() => onOpenSettings(agency)}
                  size="small"
                >
                  Paramètres
                </Button>
                {agency.pendingPayment > 0 ? (
                  <Button 
                    variant="contained" 
                    startIcon={<PaymentIcon />}
                    onClick={() => onOpenPayment(agency)}
                    size="small"
                  >
                    Valider Paiement
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color={agency.status === 'active' ? "error" : "success"}
                    onClick={() => onToggleStatus(agency.id)}
                    size="small"
                  >
                    {agency.status === 'active' ? 'Désactiver' : 'Activer'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AgencyCards;