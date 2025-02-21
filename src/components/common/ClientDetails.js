import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Stack, 
  Button, 
  Divider, 
  Grid, 
  Paper 
} from '@mui/material';
import { 
  VisibilityOutlined as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon 
} from '@mui/icons-material';
import StatusChip from './StatusChip';

const months = [
  ['JANVIER', 'FEVRIER', 'MARS'],
  ['AVRIL', 'MAI', 'JUIN'],
  ['JUILLET', 'AOUT', 'SEPTEMBRE'],
  ['OCTOBRE', 'NOVEMBRE', 'DECEMBRE']
];

const BillingCard = ({ selectedYear }) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">FACTURATION</Typography>
        <Button 
          variant="outlined"
          size="small"
          endIcon={<CalendarIcon />}
        >
          {selectedYear}
        </Button>
      </Box>
      <Grid container spacing={1}>
        {months.map((row, rowIndex) => (
          <Grid item xs={12} key={rowIndex}>
            <Grid container spacing={1}>
              {row.map((month) => (
                <Grid item xs={4} key={month}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      bgcolor: month === 'JANVIER' || month === 'FEVRIER' ? 'success.light' : 'grey.100',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    {(month === 'JANVIER' || month === 'FEVRIER') && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                    <Typography variant="body2">
                      {month}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

const NotesCard = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        NOTES /EVENEMENT EN COURS
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            20/10/2024
          </Typography>
          <Typography>
            A mettre en pause avant la prochaine échéance.
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            03/10/2024
          </Typography>
          <Typography>
            Le client demande une nouvelle carte SIM
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);


const ClientHeader = ({ client }) => (
  <Card sx={{ mb: 3, p: 2, bgcolor: 'primary.light' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
        {client.prenom[0]}{client.nom[0]}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          {client.prenom} {client.nom}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <StatusChip status={client.status} />
          <Typography variant="body2" color="text.secondary">
            {client.telephone}
          </Typography>
        </Stack>
      </Box>
      <Button
        startIcon={<VisibilityIcon />}
        variant="contained"
        size="small"
      >
        Détails
      </Button>
    </Box>
  </Card>
);

const SubscriptionCard = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6">FORFAIT/ABONNEMENT</Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
            39€
          </Typography>
          <Typography variant="caption" color="text.secondary">
            par mois
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          Gestion de compte et abonnement RED 120GB
        </Typography>
        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          Clé WIFI et internet
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

const ClientDetails = ({ client, selectedYear, onYearChange }) => {
    if (!client) return null;
  
    return (
      <Card sx={{ width: '600px' }}>
        <Box sx={{ p: 3 }}>
          <ClientHeader client={client} />
          <SubscriptionCard />
          <BillingCard selectedYear={selectedYear} />
          <NotesCard />
        </Box>
      </Card>
    );
  };
  

export default ClientDetails