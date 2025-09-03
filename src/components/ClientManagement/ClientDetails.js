import React,{useState,useEffect} from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Stack, 
  Button,
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
  Info as InfoIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon, // Ajoutez cet import
  AccountCircle as AccountCircleIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import StatusChip from './StatusChip';
import RedAccountManagement from '../RedAccountManagement';
import ClientDetailsModal from './ClientDetailsModal';
import {formatPaymentAndStatusToHumanReadable} from "../../utils/helper";
import { PHONE_STATUS, PAYMENT_STATUS } from "./constant";
import dayjs from "dayjs";


const NotesCard = ({simCard, agency}) => (
  <Card sx={{ mt: 2, mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        NOTES /EVENEMENT EN COURS
      </Typography>
      <Stack spacing={2}>
        {simCard ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {dayjs(simCard?.createdAt).format('ddd, D MMM YYYY HH:mm')}
              </Typography>
              <Typography>
                Carte sim avec iccid {simCard?.iccid} a été défini.
              </Typography>
            </Box>
        ) : <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {dayjs().format('ddd, D MMM YYYY HH:mm')}
          </Typography>
          <Typography>
            Aucune carte sim n'a été définie pour ce client.
          </Typography>
        </Box>}

        {agency ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {dayjs(agency?.createdAt).format('ddd, D MMM YYYY HH:mm')}
              </Typography>
              <Typography>
                Le client à été associé à l'agence: {agency?.name}.
              </Typography>
            </Box>
        ) : (
            <Box>
              <Typography>
                Le client n'a pas d'agence attribuée.
              </Typography>
            </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);


const ClientHeader = ({ client, simCard, onOpenModal }) => (
  <Card sx={{ mb: 3, p: 2, bgcolor: 'primary.light' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
        {client.user?.firstname?.[0]?.toUpperCase()}{client.user?.lastname?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" color="white" gutterBottom>
          {client.user?.firstname} {client.user?.lastname}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <StatusChip status={formatPaymentAndStatusToHumanReadable(client?.paymentStatus)} />
          <StatusChip status={formatPaymentAndStatusToHumanReadable(client?.phoneStatus)} />
          <Typography variant="body4" color="text.secondary">
            {client.phoneNumber || 'N/C'}
          </Typography>
        </Stack>
      </Box>
      <Button
        startIcon={<VisibilityIcon />}
        variant="contained"
        size="small"
        onClick={onOpenModal}
      >
        Détails
      </Button>
    </Box>
  </Card>
);

const SubscriptionCard = ({ client, simCard }) => {
  if (!client?.agency) return null;

  const {
    paymentStatus,
    phoneStatus,
    basePrice,
    features,
    dueAmount = 0,
    lastPaymentDate,
    unpaidMonths = [],
    updatedAt,
    activeSubscription,
  } = client;

  // DEBUG: Log des données pour diagnostiquer le problème
  console.log('🔍 CLIENT DETAILS DEBUG:', {
    clientId: client?.id,
    phoneNumber: client?.phoneNumber,
    hasActiveSubscription: !!activeSubscription,
    activeSubscription: activeSubscription,
    client: client
  });

  // Utiliser les vraies données d'abonnement si disponibles
  const subscriptionFeatures = activeSubscription ? [
    `📱 ${activeSubscription.name}`,
    `📊 ${activeSubscription.dataSummary}`,
    `💰 ${activeSubscription.formattedTotalPrice}`,
    ...(activeSubscription.hasEquipment ? [`📦 ${activeSubscription.equipmentInfo}`] : []),
    `🔄 Type: ${activeSubscription.subscriptionType}`,
  ] : features || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusInfo = () => {
    const status = phoneStatus === PHONE_STATUS.SUSPENDED ? phoneStatus : paymentStatus;

    switch(status) {
      case PHONE_STATUS.SUSPENDED:
        return {
          icon: <BlockIcon />,
          label: 'Ligne bloquée',
          color: 'error',
          severity: 'error'
        };
      case 'late':
        return {
          icon: PAYMENT_STATUS.OVERDUE,
          label: 'En retard',
          color: 'warning',
          severity: 'warning'
        };
      case PAYMENT_STATUS.DISCONNECTED:
        return {
          icon: <CancelIcon />,
          label: 'Résilié',
          color: 'error',
          severity: 'error'
        };
      default:
        return {
          icon: PAYMENT_STATUS.UP_TO_DATE,
          label: 'À jour',
          color: 'success',
          severity: 'success'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getPaymentDetails = () => {
    if (paymentStatus === PAYMENT_STATUS.CANCELLED) {
      return {
        message: "Abonnement résilié",
        details: [`Date de résiliation: ${formatDate(updatedAt)}`]
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
    <Card elevation={1} sx={{
      my: 2,
    }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
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
              {phoneStatus === PHONE_STATUS.SUSPENDED ? '--' : `${dueAmount > 0 ? dueAmount : (client?.activeSubscription?.totalMonthlyPrice || 0)}€`}
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
        {(dueAmount > 0 || phoneStatus === PHONE_STATUS.SUSPENDED) && (
          <Alert 
            severity={statusInfo.severity}
            icon={statusInfo.icon}
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {phoneStatus === PHONE_STATUS.SUSPENDED
                ? 'Abonnement résilié' 
                : (paymentStatus === PAYMENT_STATUS.CANCELLED || paymentStatus === PAYMENT_STATUS.OVERDUE)
                  ? 'Ligne bloquée - Paiement requis'
                  : 'Paiement en retard'}
            </AlertTitle>
            {phoneStatus === PHONE_STATUS.SUSPENDED ? (
              <Typography variant="body2">
                Résilié le {formatDate(updatedAt)}
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
          {subscriptionFeatures?.map((feature, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}
            >
              <CheckCircleIcon 
                color={paymentStatus === PAYMENT_STATUS.CANCELLED ? 'disabled' : 'success'}
                fontSize="small" 
              />
              <Typography 
                variant="body2" 
                color={paymentStatus === PAYMENT_STATUS.CANCELLED ? 'text.disabled' : 'text.primary'}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Indicateur de dernier paiement */}
        {paymentStatus === PAYMENT_STATUS.UP_TO_DATE && lastPaymentDate && (
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

const AccountDetails = ({agency,  redAccount = { id: 'RED_123456', password: 'SecurePass123' } }) => {
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
              Agence : {agency?.name}
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
                  {redAccount?.redAccountId || 'N/A'}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Mot de passe :
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontFamily="monospace" fontWeight="medium">
                    {showPassword ? redAccount?.password : '••••••••••'}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!client) return null;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card sx={{ width: '600px' }}>
        <Box sx={{ p: 3 }}>
          <ClientHeader client={client} onOpenModal={handleOpenModal} />
          {currentTab === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED ? (
            <RedAccountManagement client={client} />
          ) : (
            <>
              {(currentTab === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED || currentTab === PAYMENT_STATUS.UP_TO_DATE || currentTab === PHONE_STATUS.SUSPENDED || currentTab === PAYMENT_STATUS.OVERDUE || currentTab === PAYMENT_STATUS.CANCELLED || currentTab === PAYMENT_STATUS.DISPUTED) && (
                <AccountDetails 
                  redAccount={client.redAccount}
                  agency={client.agency}
                />
              )}
              <SubscriptionCard client={client} simCard={client?.simCard} />
              <NotesCard simCard={client?.simCard} agency={client?.agency} />
            </>
          )}
        </Box>
      </Card>

      {/* Modal de fiche client détaillée */}
      <ClientDetailsModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        client={client}
      />
    </>
  );
};

export default ClientDetails;