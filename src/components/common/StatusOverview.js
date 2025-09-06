import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  PauseCircle as PauseCircleIcon,
  AccessTime as AccessTimeIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

const StatusOverview = ({ 
  statusData = {
    pending: 0,
    active: 0,
    blocked: {
      total: 0,
      details: {
        unpaid: 0,
        cancelled: 0,
        stolen: 0
      }
    },
    suspended: 0,
    unpaid: 0,
    latePayment: 0,
  }
}) => {

  // Carte principale pour les lignes en attente
  const mainStatus = {
    label: 'En Attente d\'Activation',
    value: statusData.pending,
    icon: <PendingIcon sx={{ fontSize: 40 }} />,
    color: 'primary'
  };

  // Autres statuts à afficher en 2x2
  const statusItems = [
    {
      label: 'Lignes Actives',
      value: statusData.active,
      icon: <CheckCircleIcon />,
      color: 'success'
    },
    {
      label: 'Lignes Bloquées',
      value: statusData.blocked.total,
      icon: <BlockIcon />,
      color: 'error',
      tooltip: (
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Détail des lignes bloquées :
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2">
              Impayés : {statusData.blocked.details.unpaid}
            </Typography>
            <Typography component="li" variant="body2">
              Résiliation : {statusData.blocked.details.cancelled}
            </Typography>
            <Typography component="li" variant="body2">
              Perte/Vol : {statusData.blocked.details.stolen}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      label: 'Retards Paiement',
      value: statusData.latePayment,
      icon: <AccessTimeIcon />,
      color: 'warning'
    },
    {
      label: 'Lignes Impayées',
      value: statusData.unpaid,
      icon: <WarningIcon />,
      color: 'error'
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Carte principale en attente d'activation */}
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {mainStatus.icon}
          <Box sx={{ ml: 2 }}>
            <Typography variant="h4" component="div">
              {mainStatus.value}
            </Typography>
            <Typography variant="subtitle2">
              {mainStatus.label}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Grille 2x2 pour les autres statuts */}
      <Grid container spacing={2}>
        {statusItems.map((item, index) => (
          <Grid item xs={6} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: `${item.color}.lighter`,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Box 
                sx={{ 
                  color: `${item.color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1
                }}
              >
                {item.tooltip ? (
                  <Tooltip 
                    title={item.tooltip}
                    TransitionComponent={Zoom}
                    arrow
                    placement="top"
                  >
                    <Box>
                      {React.cloneElement(item.icon, { sx: { fontSize: 30 } })}
                    </Box>
                  </Tooltip>
                ) : (
                  React.cloneElement(item.icon, { sx: { fontSize: 30 } })
                )}
              </Box>
              <Typography variant="h5" component="div" color={`${item.color}.main`}>
                {item.value}
              </Typography>
              <Typography variant="body2" color={`${item.color}.dark`}>
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatusOverview;