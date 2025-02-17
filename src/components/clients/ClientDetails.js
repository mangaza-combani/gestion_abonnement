import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Card,
  CardContent,
  ButtonGroup,
  Alert,
  Divider
} from '@mui/material';
import {
  VisibilityOutlined as VisibilityIcon,
  EuroSymbol as EuroIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  SimCard as SimCardIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

const months = [
  'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'
];

const ClientDetails = ({ client, currentTab, onAction }) => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [billedMonths] = useState(['JANVIER', 'FEVRIER']);

  if (!client) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Sélectionnez un client pour voir les détails
        </Typography>
      </Paper>
    );
  }

  const renderTabSpecificContent = () => {
    switch (currentTab) {
      case 'unblock':
        return (
          <Card sx={{ mb: 2, bgcolor: 'warning.light' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" color="warning.dark">
                    Ligne bloquée
                  </Typography>
                </Box>
                <Typography variant="body2">
                  La ligne est actuellement bloquée depuis le {client.blockDate || '01/02/2024'}
                </Typography>
                <Divider />
                <Typography variant="subtitle2">
                  Raison du blocage:
                </Typography>
                <Typography variant="body2">
                  {client.blockReason || 'Retard de paiement'}
                </Typography>
                <Alert severity="warning">
                  Avant de débloquer la ligne, vérifiez que le client a régularisé sa situation.
                </Alert>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  fullWidth
                  onClick={() => onAction('unblock')}
                >
                  Débloquer la ligne
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );

      case 'block':
        return (
          <Card sx={{ mb: 2, bgcolor: 'error.light' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon color="error" />
                  <Typography variant="h6" color="error.dark">
                    Client en retard
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Dernier paiement: {client.lastPayment}
                </Typography>
                <Divider />
                <Typography variant="subtitle2">
                  Montant dû:
                </Typography>
                <Typography variant="h5" color="error.dark">
                  {client.dueAmount || '39.00'}€
                </Typography>
                <Alert severity="error">
                  Le client n'a pas régularisé sa situation après plusieurs relances.
                </Alert>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  fullWidth
                  onClick={() => onAction('block')}
                >
                  Bloquer la ligne
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );

      case 'order':
        return (
          <Card sx={{ mb: 2, bgcolor: 'info.light' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SimCardIcon color="info" />
                  <Typography variant="h6" color="info.dark">
                    Commande de carte SIM
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {client.simCard ? 'Remplacement de carte SIM' : 'Nouvelle carte SIM'}
                </Typography>
                <Divider />
                {client.simCard && (
                  <>
                    <Typography variant="subtitle2">
                      Ancienne carte:
                    </Typography>
                    <Typography variant="body2">
                      ICCID: {client.simCard.iccid}
                    </Typography>
                  </>
                )}
                <Alert severity="info">
                  La commande sera facturée 10€ au client.
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SimCardIcon />}
                  fullWidth
                  onClick={() => onAction('order')}
                >
                  Commander une carte SIM
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );

      case 'late':
        return (
          <Card sx={{ mb: 2, bgcolor: 'warning.light' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" color="warning.dark">
                    Retard de paiement
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Dernier paiement: {client.lastPayment}
                </Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">
                      Montant dû:
                    </Typography>
                    <Typography variant="h5" color="error.dark">
                      {client.dueAmount || '39.00'}€
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">
                      Retard:
                    </Typography>
                    <Typography variant="h5" color="warning.dark">
                      {client.lateMonths || '1'} mois
                    </Typography>
                  </Grid>
                </Grid>
                <Alert severity="warning">
                  Le client sera bloqué après 2 mois de retard.
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EuroIcon />}
                  fullWidth
                  onClick={() => onAction('facturer')}
                >
                  Régulariser le paiement
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Stack spacing={2}>
      {/* En-tête client */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" component="div">
            {client.prenom} {client.nom}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {client.telephone}
          </Typography>
          <Button
            startIcon={<VisibilityIcon />}
            size="small"
            variant="outlined"
            onClick={() => onAction('details')}
          >
            Détails client
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          COMPTE RATACHE: {client.compte}
        </Typography>
      </Box>

      {/* Contenu spécifique à l'onglet */}
      {renderTabSpecificContent()}

      {/* Forfait */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              FORFAIT/ABONNEMENT
            </Typography>
            <Typography variant="h4" color="primary" component="div">
              39€
            </Typography>
          </Box>
          <Stack spacing={1}>
            {client.subscription?.features.map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" color="success" />
                {feature}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Facturation (seulement dans l'onglet liste) */}
      {currentTab === 'list' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                FACTURATION
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={selectedYear === 2023 ? 'contained' : 'outlined'}
                  onClick={() => setSelectedYear(2023)}
                >
                  2023
                </Button>
                <Button
                  variant={selectedYear === 2024 ? 'contained' : 'outlined'}
                  onClick={() => setSelectedYear(2024)}
                >
                  2024
                </Button>
              </ButtonGroup>
            </Box>
            <Grid container spacing={1}>
              {months.map((month) => (
                <Grid item xs={4} key={month}>
                  <Chip
                    label={month}
                    size="small"
                    icon={billedMonths.includes(month) ? <CheckCircleIcon /> : null}
                    variant={billedMonths.includes(month) ? "filled" : "outlined"}
                    color={billedMonths.includes(month) ? "success" : "default"}
                    sx={{ width: '100%' }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Actions spécifiques à chaque onglet */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {currentTab === 'list' && (
          <>
            <Button
              fullWidth
              variant="contained"
              startIcon={<EuroIcon />}
              onClick={() => onAction('facturer')}
            >
              Facturer
            </Button>
            <Button
              fullWidth
              variant="contained"
              color={client.simCard?.status === 'blocked' ? 'success' : 'error'}
              startIcon={client.simCard?.status === 'blocked' ? <PlayArrowIcon /> : <StopIcon />}
              onClick={() => onAction(client.simCard?.status === 'blocked' ? 'unblock' : 'block')}
            >
              {client.simCard?.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="info"
              startIcon={<SimCardIcon />}
              onClick={() => onAction('order')}
              disabled={client.simCard?.status === 'active'}
            >
              Commander SIM
            </Button>
          </>
        )}
        <Button
          fullWidth
          variant="contained"
          startIcon={<PersonIcon />}
          onClick={() => onAction('newClient')}
        >
          Nouveau Client
        </Button>
      </Box>
    </Stack>
  );
};

export default ClientDetails;