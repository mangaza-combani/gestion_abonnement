import React,{useState,useEffect} from 'react';
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
  Paper , 
  Tooltip,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
} from '@mui/material';
import { 
  VisibilityOutlined as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  EuroSymbol as EuroIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon, // Ajoutez cet import
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import StatusChip from './StatusChip';
import RedAccountManagement from '../RedAccountManagement';


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
        <Typography variant="h5" color="white" gutterBottom>
          {client.prenom} {client.nom}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <StatusChip status={client.status} />
          <Typography variant="body4" color="text.secondary">
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

const SubscriptionCard = ({ client }) => {
  if (!client?.red) return null;

  const {
    status,
    basePrice,
    features,
    dueAmount = 0,
    lastPaymentDate,
    unpaidMonths = [],
    terminationDate
  } = client.red;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusInfo = () => {
    switch(status) {
      case 'blocked':
        return {
          icon: <BlockIcon />,
          label: 'Ligne bloquée',
          color: 'error',
          severity: 'error'
        };
      case 'late':
        return {
          icon: <WarningIcon />,
          label: 'En retard',
          color: 'warning',
          severity: 'warning'
        };
      case 'terminated':
        return {
          icon: <CancelIcon />,
          label: 'Résilié',
          color: 'error',
          severity: 'error'
        };
      default:
        return {
          icon: <CheckCircleIcon />,
          label: 'À jour',
          color: 'success',
          severity: 'success'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getPaymentDetails = () => {
    if (status === 'terminated') {
      return {
        message: "Abonnement résilié",
        details: [`Date de résiliation: ${formatDate(terminationDate)}`]
      };
    }
    
    if (dueAmount > 0) {
      return {
        message: `Montant dû: ${dueAmount}€`,
        details: [
          `Abonnement(s) impayé(s): ${unpaidMonths.length} mois`,
          `Total à régulariser: ${dueAmount}€`
        ]
      };
    }

    return {
      message: "Paiement à jour",
      details: lastPaymentDate ? [`Dernier paiement: ${formatDate(lastPaymentDate)}`] : []
    };
  };

  const paymentDetails = getPaymentDetails();

  return (
    <Card elevation={1}>
      <CardContent>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              FORFAIT/ABONNEMENT
            </Typography>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              color={dueAmount > 0 ? "error.main" : "primary.main"}
              sx={{ mr: 1 }}
            >
              {status === 'terminated' ? '--' : `${dueAmount > 0 ? dueAmount : basePrice}€`}
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {paymentDetails.message}
                  </Typography>
                  {paymentDetails.details.map((detail, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
              }
            >
              <IconButton size="small" sx={{ mb: 1 }}>
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Alerte pour les impayés ou la résiliation */}
        {(dueAmount > 0 || status === 'terminated') && (
          <Alert 
            severity={statusInfo.severity}
            icon={statusInfo.icon}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {status === 'terminated' 
                ? 'Abonnement résilié' 
                : status === 'blocked' 
                  ? 'Ligne bloquée - Paiement requis'
                  : 'Paiement en retard'}
            </AlertTitle>
            {status === 'terminated' ? (
              <Typography variant="body2">
                Résilié le {formatDate(terminationDate)}
              </Typography>
            ) : dueAmount > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2">
                  {dueAmount}€ à régulariser pour {unpaidMonths.length} mois
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {unpaidMonths.map((month, index) => (
                    <Chip
                      key={index}
                      icon={<CalendarIcon />}
                      label={`${month.month} ${month.year}`}
                      size="small"
                      color={statusInfo.color}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Stack>
            )}
          </Alert>
        )}

        {/* Liste des fonctionnalités */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          {features?.map((feature, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}
            >
              <CheckCircleIcon 
                color={status === 'terminated' ? 'disabled' : 'success'} 
                fontSize="small" 
              />
              <Typography 
                variant="body2" 
                color={status === 'terminated' ? 'text.disabled' : 'text.primary'}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Indicateur de dernier paiement */}
        {status === 'active' && lastPaymentDate && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary">
              Dernier paiement : {formatDate(lastPaymentDate)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AccountDetails = ({ redAccount = { id: 'RED_123456', password: 'SecurePass123' } }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30);

  useEffect(() => {
    let timer;
    if (showPassword) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setShowPassword(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return () => timer && clearInterval(timer);
  }, [showPassword]);

  return (
    <Card sx={{ bgcolor: 'grey.50' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountCircleIcon color="primary" />
            <Typography variant="h6" color="primary">
              agence combani
            </Typography>
          </Box>

          <Box sx={{ 
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider'
          }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Identifiant :
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {redAccount.id}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Mot de passe :
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontFamily="monospace" fontWeight="medium">
                    {showPassword ? redAccount.password : '••••••••••'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowPassword(!showPassword)}
                    color={showPassword ? 'primary' : 'default'}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Stack>
          </Box>

          {showPassword && (
            <Alert 
              severity="info"
              icon={<TimerIcon />}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2">
                Le mot de passe sera masqué automatiquement
              </Typography>
              <Chip 
                label={`${remainingTime}s`}
                size="small"
                color="info"
                variant="outlined"
              />
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};



const ClientDetails = ({ client, selectedYear, onYearChange, currentTab }) => {
  if (!client) return null;

  return (
    <Card sx={{ width: '600px' }}>
      <Box sx={{ p: 3 }}>
        <ClientHeader client={client} />
        
        {currentTab === 'order' || currentTab === 'activate' ? (
          <RedAccountManagement client={client} />
        ) : (
          <>
            {(currentTab === 'block' || currentTab === 'unblock') && (
              <AccountDetails 
                redAccount={client.redAccount}
                agency={client.agency}
              />
            )}
            <SubscriptionCard client={client} />
            <NotesCard />
          </>
        )}
      </Box>
    </Card>
  );
};

export default ClientDetails;