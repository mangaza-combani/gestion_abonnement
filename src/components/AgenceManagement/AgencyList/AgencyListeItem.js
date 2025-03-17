// src/components/agencies/AgencyList/AgencyListItem.jsx
import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Divider,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';

/**
 * Composant réutilisable pour afficher une agence dans différents formats
 * @param {Object} agency - Données de l'agence
 * @param {Object} options - Options d'affichage
 * @param {boolean} options.compact - Mode compact (réduit)
 * @param {boolean} options.detailed - Mode détaillé (plus d'informations)
 * @param {boolean} options.interactive - Activer les actions interactives
 * @param {Function} onOpenDetails - Callback quand on ouvre les détails
 * @param {Function} onOpenSettings - Callback quand on ouvre les paramètres
 * @param {Function} onOpenPayment - Callback quand on valide un paiement
 * @param {Function} onToggleStatus - Callback quand on change le statut
 */
const AgencyListItem = ({
  agency,
  options = {
    compact: false,
    detailed: false,
    interactive: true
  },
  onOpenDetails,
  onOpenSettings,
  onOpenPayment,
  onToggleStatus
}) => {
  const { compact, detailed, interactive } = options;

  // Mode compact (utilisé pour les listes denses ou sélecteurs)
  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={2} p={1}>
        <Avatar 
          sx={{ 
            bgcolor: agency.status === 'active' ? 'success.main' : 'grey.500',
            width: 32,
            height: 32
          }}
        >
          {agency.name.slice(0, 1)}
        </Avatar>
        <Box>
          <Typography variant="subtitle2">{agency.name}</Typography>
          <Typography variant="body2" color="text.secondary">{agency.phone}</Typography>
        </Box>
        {interactive && (
          <Chip 
            label={agency.status === 'active' ? 'Actif' : 'Inactif'} 
            color={agency.status === 'active' ? "success" : "default"} 
            size="small" 
            sx={{ ml: 'auto' }}
          />
        )}
      </Box>
    );
  }

  // Mode standard (carte)
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      '&:hover': interactive ? { boxShadow: 6 } : {} 
    }}>
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
          {interactive && (
            <IconButton onClick={() => onOpenDetails(agency)}>
              <PersonIcon />
            </IconButton>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={0.5} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">{agency.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{agency.phone}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={detailed ? 2 : 1}>
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

          {detailed && (
            <>
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
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Adresse
                </Typography>
                <Typography variant="body2">
                  {agency.address || 'Non spécifiée'}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>

        {interactive && (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyListItem;