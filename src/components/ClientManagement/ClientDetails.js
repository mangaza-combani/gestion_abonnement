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
  Timer as TimerIcon,
  AccountCircle as AccountCircleIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon
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
    features,
    dueAmount = 0,
    lastPaymentDate,
    unpaidMonths = [],
    updatedAt,
  } = client;

  // Utiliser les données d'abonnement optimisées du backend (activeSubscription)
  const activeSubscription = client?.activeSubscription;
  const totalMonthlyPrice = activeSubscription?.totalMonthlyPrice || 0;

  // DEBUG: Log des données pour diagnostiquer le problème
  console.log('🔍 CLIENT DETAILS DEBUG (USING activeSubscription):', {
    clientId: client?.id,
    phoneNumber: client?.phoneNumber,
    phoneStatus: phoneStatus,
    dueAmount: dueAmount,
    hasActiveSubscription: !!activeSubscription,
    activeSubscription: activeSubscription,
    totalMonthlyPrice: totalMonthlyPrice,
    priceCalculation: dueAmount > 0 ? dueAmount : totalMonthlyPrice
  });

  // 🚦 LOGIQUE SPÉCIALE: Si ligne en attente d'activation, différencier les cas
  const isWaitingForActivation = phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED;

  // Déterminer le message selon le contexte de réactivation
  const getActivationMessage = () => {
    if (!isWaitingForActivation) return null;
    
    const reason = client.reactivationReason;
    
    if (reason && reason.includes('Dette réglée')) {
      return [
        '💳 Dette réglée - Ligne prête pour réactivation',
        '✅ Paiements à jour - En attente du superviseur',
        '🔧 Réactivation superviseur requise'
      ];
    }
    
    if (reason && reason.includes('pause')) {
      return [
        '▶️ Demande de réactivation après pause',
        '✅ Paiements à jour - Ligne prête',
        '🔧 Activation superviseur requise'
      ];
    }
    
    if (reason && reason.includes('résiliation')) {
      return [
        '🔄 Réactivation après résiliation',
        '✅ Paiements à jour - Ligne disponible',
        '🔧 Activation superviseur requise'
      ];
    }
    
    if (reason && reason.includes('Nouvelle activation')) {
      return [
        '⏳ En attente de carte SIM pour activation',
        '📱 Ligne réservée - Activation en cours',
        '🔧 Superviseur doit activer avec carte SIM'
      ];
    }
    
    // Cas par défaut pour nouvelles lignes
    return [
      '⏳ En attente de carte SIM pour activation',
      '📱 Ligne réservée - Activation en cours',
      '🔧 Superviseur doit activer avec carte SIM'
    ];
  };

  // Utiliser les vraies données d'abonnement si disponibles
  const subscriptionFeatures = isWaitingForActivation ? getActivationMessage() : activeSubscription ? [
    `📱 ${activeSubscription.name}`,
    `📊 ${activeSubscription.dataSummary || 'Données illimitées'}`,
    `💰 ${activeSubscription.formattedTotalPrice || totalMonthlyPrice.toFixed(2) + ' EUR'}`,
    ...(activeSubscription.hasEquipment ? [activeSubscription.equipmentInfo || '📦 Équipement inclus'] : []),
    `🔄 Type: ${activeSubscription.subscriptionType}`,
  ] : features || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusInfo = () => {
    const status = phoneStatus === PHONE_STATUS.SUSPENDED || phoneStatus === PHONE_STATUS.PAUSED ? phoneStatus : paymentStatus;

    switch(status) {
      case PHONE_STATUS.SUSPENDED:
        return {
          icon: <BlockIcon />,
          label: 'Ligne bloquée',
          color: 'error',
          severity: 'error'
        };
      case PHONE_STATUS.PAUSED:
        return {
          icon: <BlockIcon />,
          label: 'Ligne en pause',
          color: 'warning',
          severity: 'warning'
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
              {isWaitingForActivation ? 'STATUT ACTIVATION' : 'FORFAIT/ABONNEMENT'}
            </Typography>
            <Chip
              icon={isWaitingForActivation ? <TimerIcon /> : statusInfo.icon}
              label={isWaitingForActivation ? 'En attente SIM' : statusInfo.label}
              color={isWaitingForActivation ? 'warning' : statusInfo.color}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              color={isWaitingForActivation ? "warning.main" : dueAmount > 0 ? "error.main" : "primary.main"}
              sx={{ mr: 1 }}
            >
              {isWaitingForActivation ? '--' : phoneStatus === PHONE_STATUS.SUSPENDED ? '--' : `${dueAmount > 0 ? dueAmount : totalMonthlyPrice}€`}
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {isWaitingForActivation ? 'Activation en attente' : paymentDetails.message}
                  </Typography>
                  {isWaitingForActivation ? (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Le superviseur doit activer cette ligne avec une carte SIM
                    </Typography>
                  ) : paymentDetails.details.map((detail, index) => (
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

        {/* Alerte pour les lignes en attente, impayés, la résiliation, en pause ou bloquées */}
        {(isWaitingForActivation || dueAmount > 0 || phoneStatus === PHONE_STATUS.SUSPENDED ||
          phoneStatus === PHONE_STATUS.PAUSED || phoneStatus === PHONE_STATUS.BLOCKED ||
          client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
          client?.phoneStatus === 'BLOCKED_NONPAYMENT') && (
          <Alert
            severity={
              isWaitingForActivation ? 'info' :
              phoneStatus === PHONE_STATUS.PAUSED ? 'warning' :
              (client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
               client?.phoneStatus === 'BLOCKED_NONPAYMENT') ? 'error' :
              statusInfo.severity
            }
            icon={
              isWaitingForActivation ? <TimerIcon /> :
              phoneStatus === PHONE_STATUS.PAUSED ? <BlockIcon /> :
              (client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
               client?.phoneStatus === 'BLOCKED_NONPAYMENT') ? <BlockIcon /> :
              statusInfo.icon
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {isWaitingForActivation
                ? 'Ligne en attente d\'activation'
                : phoneStatus === PHONE_STATUS.PAUSED
                ? 'Ligne en pause'
                : phoneStatus === PHONE_STATUS.SUSPENDED
                ? 'Abonnement résilié'
                : client?.paymentStatus === 'DETTE'
                ? 'Ligne bloquée - Dette de paiement'
                : client?.paymentStatus === 'EN RETARD'
                ? 'Paiement en retard'
                : client?.phoneStatus === 'BLOCKED_NONPAYMENT'
                ? 'Ligne bloquée pour impayé'
                : (paymentStatus === PAYMENT_STATUS.CANCELLED || paymentStatus === PAYMENT_STATUS.OVERDUE)
                  ? 'Ligne bloquée - Paiement requis'
                  : 'Paiement en retard'}
            </AlertTitle>
            {isWaitingForActivation ? (
              <Typography variant="body2">
                Cette ligne a été réservée pour le client et attend l'activation par un superviseur avec une carte SIM physique.
              </Typography>
            ) : phoneStatus === PHONE_STATUS.PAUSED ? (
              <Stack spacing={1}>
                <Typography variant="body2">
                  Cette ligne est actuellement mise en pause.
                </Typography>
                {(client?.blockReasonLabel || client?.blockedReason || client?.pendingBlockReason ||
                  client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
                  client?.phoneStatus === 'BLOCKED_NONPAYMENT') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" color="warning" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Raison :</strong> {
                        client.blockReasonLabel ||
                        (client.blockedReason === 'pause' ? 'Pause temporaire confirmée' :
                         client.blockedReason === 'lost_sim' ? 'SIM perdue/volée/endommagée' :
                         client.blockedReason === 'termination' ? 'Demande de résiliation client' :
                         client.pendingBlockReason === 'pause' ? '⏳ Demande pause temporaire' :
                         client.pendingBlockReason === 'lost_sim' ? '⏳ Demande SIM perdue/volée' :
                         client.pendingBlockReason === 'termination' ? '⏳ Demande résiliation' :
                         client.paymentStatus === 'DETTE' ? 'Dette de paiement (2+ factures impayées)' :
                         client.paymentStatus === 'EN RETARD' ? 'Paiement en retard (< 1 mois)' :
                         client.phoneStatus === 'BLOCKED_NONPAYMENT' ? 'Ligne bloquée pour impayé' :
                         'Pause temporaire')
                      }
                    </Typography>
                  </Box>
                )}
                {(client?.notes || client?.blockedNotes || client?.pendingBlockNotes) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {client.notes || client.blockedNotes || client.pendingBlockNotes}
                  </Typography>
                )}
              </Stack>
            ) : (client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
                 client?.phoneStatus === 'BLOCKED_NONPAYMENT') ? (
              <Stack spacing={1}>
                <Typography variant="body2">
                  {client?.paymentStatus === 'DETTE' ?
                    'Cette ligne est bloquée en raison d\'une dette de paiement (2+ factures impayées).' :
                  client?.paymentStatus === 'EN RETARD' ?
                    'Cette ligne a des paiements en retard mais reste active (période de grâce).' :
                    'Cette ligne est bloquée pour impayé.'}
                </Typography>
                {(client?.blockReasonLabel || client?.blockedReason || client?.pendingBlockReason ||
                  client?.paymentStatus === 'DETTE' || client?.paymentStatus === 'EN RETARD' ||
                  client?.phoneStatus === 'BLOCKED_NONPAYMENT') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" color="error" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Raison :</strong> {
                        client.blockReasonLabel ||
                        (client.paymentStatus === 'DETTE' ? 'Dette de paiement (2+ factures impayées)' :
                         client.paymentStatus === 'EN RETARD' ? 'Paiement en retard (< 1 mois)' :
                         client.phoneStatus === 'BLOCKED_NONPAYMENT' ? 'Ligne bloquée pour impayé' :
                         'Problème de paiement')
                      }
                    </Typography>
                  </Box>
                )}
                {(client?.notes || client?.blockedNotes || client?.pendingBlockNotes) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {client.notes || client.blockedNotes || client.pendingBlockNotes}
                  </Typography>
                )}
              </Stack>
            ) : phoneStatus === PHONE_STATUS.SUSPENDED ? (
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
              {isWaitingForActivation ? (
                <TimerIcon 
                  color="warning"
                  fontSize="small" 
                />
              ) : (
                <CheckCircleIcon 
                  color={paymentStatus === PAYMENT_STATUS.CANCELLED ? 'disabled' : 'success'}
                  fontSize="small" 
                />
              )}
              <Typography 
                variant="body2" 
                color={isWaitingForActivation ? 'warning.main' : paymentStatus === PAYMENT_STATUS.CANCELLED ? 'text.disabled' : 'text.primary'}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Affichage ID compte RED rattaché (pour superviseur) */}
        {(client?.redAccountId || client?.lineRequest?.redAccountId) && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'info.lighter', 
            border: '1px solid', 
            borderColor: 'info.main', 
            borderRadius: 1 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon color="info" fontSize="small" />
              <Typography variant="body2" fontWeight="bold" color="info.main">
                Compte RED rattaché:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                {client?.redAccountName || client?.redAccount?.accountName || client?.lineRequest?.redAccount?.accountName || 
                 `Compte ${client?.redAccountId || client?.lineRequest?.redAccountId}`}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Compte utilisé pour la facturation et la gestion de cette ligne
            </Typography>
          </Box>
        )}

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
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body1" 
                    fontWeight="medium"
                    sx={{ 
                      fontFamily: 'monospace',
                      bgcolor: 'grey.100',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      border: 1,
                      borderColor: 'grey.300'
                    }}
                  >
                    {redAccount?.redAccountId || 'N/A'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      navigator.clipboard.writeText(redAccount?.redAccountId || '')
                      // TODO: Add toast notification
                    }}
                    title="Copier l'identifiant"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Mot de passe :
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body1" 
                    fontFamily="monospace" 
                    fontWeight="medium"
                    sx={{ 
                      bgcolor: 'grey.100',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      border: 1,
                      borderColor: 'grey.300'
                    }}
                  >
                    {showPassword ? redAccount?.password : '••••••••••'}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowPassword(!showPassword)}
                    color={showPassword ? 'primary' : 'default'}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      navigator.clipboard.writeText(redAccount?.password || '')
                      // TODO: Add toast notification
                    }}
                    title="Copier le mot de passe"
                    disabled={!showPassword}
                  >
                    <CopyIcon fontSize="small" />
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
      <Card sx={{ width: '100%', maxWidth: '500px' }}>
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