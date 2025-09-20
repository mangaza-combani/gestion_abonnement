import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Grid,
  Typography,
  Autocomplete,
  Paper,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  AlertTitle,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slide,
  Fade,
  Avatar,
  styled,
  useTheme,
  alpha,
  CircularProgress,
  Badge
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarIcon,
  LocationCity as LocationCityIcon,
  Euro as EuroIcon,
  Payment as PaymentIcon,
  VerifiedUser as VerifiedUserIcon,
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Receipt as ReceiptIcon,
  ContactMail as ContactMailIcon,
  SimCard as SimCardIcon,
  ArrowBack as ArrowBackIcon,
  Paid as PaidIcon,
  Info as InfoIcon,
  Subscriptions as SubscriptionsIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllUsersQuery, useGetClientsQuery, useCreateClientMutation, useAssociateClientMutation } from "../../store/slices/clientsSlice";
import { useWhoIAmQuery } from "../../store/slices/authSlice";
import { useGetSubscriptionsQuery } from "../../store/slices/subscriptionsSlice";
import { useGetAgencySimCardsQuery } from "../../store/slices/agencySlice";

// Style personnalisé pour le Stepper
const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-root': {
    top: 12,
  },
  '&.Mui-active, &.Mui-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));


const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 32,
  height: 32,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    transform: 'scale(1.2)',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.success.main,
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <PersonIcon />,
    2: <SimCardIcon />,
    3: <PaidIcon />,
  };

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? <CheckIcon /> : icons[String(icon)]}
    </CustomStepIconRoot>
  );
}

// Animation pour l'entrée des champs
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Composant pour la prévisualisation du client
const ClientPreview = ({ client }) => {
  const theme = useTheme();

  if (!client) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mt: 2,
        bgcolor: alpha(theme.palette.grey[50], 0.8),
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: theme.palette.primary.main,
            fontSize: 14
          }}
        >
          {client.firstname?.[0]}{client.lastname?.[0]}
        </Avatar>

        <Typography variant="subtitle2" fontWeight="medium" sx={{ minWidth: 'fit-content' }}>
          {client.firstname} {client.lastname}
        </Typography>

        {client.email && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {client.email}
              </Typography>
            </Box>
          </>
        )}

        {client.phoneNumber && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {client.phoneNumber}
            </Typography>
          </Box>
        )}

        {client.role && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationCityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {client.role}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Style pour bouton animé
const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: '-100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.4)}, transparent)`,
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[8],
    '&::after': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// Fonction pour formater le numéro de téléphone
const formatPhoneNumber = (value) => {
  // Supprimer tous les caractères non numériques
  const numbers = value.replace(/\D/g, '');

  // Vérifier que ça commence par 0
  if (numbers.length > 0 && numbers[0] !== '0') {
    return ''; // Rejeter si ne commence pas par 0
  }

  // Limiter à 10 chiffres maximum
  const limitedNumbers = numbers.slice(0, 10);

  // Grouper par deux chiffres avec des espaces
  let formatted = '';
  for (let i = 0; i < limitedNumbers.length; i += 2) {
    if (i > 0) formatted += ' ';
    formatted += limitedNumbers.slice(i, i + 2);
  }

  return formatted;
};

// Fonction pour formater la date automatiquement avec validation
const formatBirthdate = (value) => {
  // Supprimer tous les caractères non numériques
  const numbers = value.replace(/\D/g, '');

  // Limiter à 8 chiffres maximum
  const limitedNumbers = numbers.slice(0, 8);

  let formatted = limitedNumbers;

  // Validation du jour (01-31)
  if (limitedNumbers.length >= 2) {
    const day = parseInt(limitedNumbers.slice(0, 2));
    if (day < 1 || day > 31) {
      // Si le jour est invalide, on ne prend que le premier chiffre valide
      const firstDigit = limitedNumbers[0];
      if (parseInt(firstDigit) > 3) {
        return firstDigit; // Bloquer si premier chiffre > 3
      }
      return limitedNumbers.slice(0, 1);
    }
    formatted = limitedNumbers.slice(0, 2);
  }

  // Ajouter "/" après le jour valide
  if (limitedNumbers.length >= 3) {
    formatted += '/' + limitedNumbers.slice(2);
  }

  // Validation du mois (01-12)
  if (limitedNumbers.length >= 4) {
    const month = parseInt(limitedNumbers.slice(2, 4));
    if (month < 1 || month > 12) {
      // Si le mois est invalide, on s'arrête au jour
      return formatted.slice(0, 3); // "jj/"
    }
    formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2, 4);
  }

  // Ajouter "/" après le mois valide
  if (limitedNumbers.length >= 5) {
    formatted += '/' + limitedNumbers.slice(4);
  }

  // Validation de l'année (1900-2030)
  if (limitedNumbers.length >= 8) {
    const year = parseInt(limitedNumbers.slice(4, 8));
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      // Si l'année est invalide, on s'arrête au mois
      return limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2, 4) + '/';
    }

    // Validation plus fine : vérifier que la date complète est valide
    const day = parseInt(limitedNumbers.slice(0, 2));
    const month = parseInt(limitedNumbers.slice(2, 4));
    const testDate = new Date(year, month - 1, day);

    if (testDate.getDate() !== day || testDate.getMonth() !== month - 1 || testDate.getFullYear() !== year) {
      // Date invalide (ex: 31/02/2024)
      return limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2, 4) + '/';
    }
  }

  return formatted;
};

// Composant principal
const  CreateClientModal = ({ open, onClose, onClientCreated, agencyMode = false, preselectedClient = null, useCreateClientRoute = false }) => {
  const theme = useTheme();
  const { data: currentUser } = useWhoIAmQuery();
  const [createClient] = useCreateClientMutation();
  const [associateClient] = useAssociateClientMutation();
  
  // Détection automatique du mode agence basé sur le rôle utilisateur
  const isAgencyMode = agencyMode || (currentUser?.role === 'AGENCY');
  const autoSelectedAgencyId = isAgencyMode ? currentUser?.agencyId : null;
  
  
  // Récupérer les données selon le rôle
  const { data: allUsers } = useGetAllUsersQuery(undefined, {
    skip: isAgencyMode // Ne pas récupérer tous les utilisateurs si on est une agence
  });
  
  const { data: agencyClientsData, refetch: refetchAgencyClients } = useGetClientsQuery(
    autoSelectedAgencyId,
    { skip: !isAgencyMode || !autoSelectedAgencyId }
  );
  
  // Récupérer les abonnements disponibles
  const { data: subscriptionsData, isLoading: subscriptionsLoading, error: subscriptionsError } = useGetSubscriptionsQuery();
  const availableSubscriptions = subscriptionsData?.data || [];
  
  // Récupérer les cartes SIM disponibles de l'agence
  const { data: simCardsData, isLoading: simCardsLoading } = useGetAgencySimCardsQuery(autoSelectedAgencyId, {
    skip: !autoSelectedAgencyId
  });
  
  // Filtrer les cartes SIM disponibles (IN_STOCK et non réservées)
  const availableSimCards = React.useMemo(() => {
    if (!simCardsData?.sim_cards) return [];
    return simCardsData.sim_cards.filter(card => 
      card.status === 'IN_STOCK' && 
      !card.isReserved &&
      card.iccid // Vérifier qu'il y a un ICCID
    ).map(card => ({
      id: card.id,
      iccid: card.iccid,
      label: card.iccid,
      receivedDate: card.receivedDate,
      agencyName: card.agencyName
    }));
  }, [simCardsData]);
  
  // Debug des abonnements
  React.useEffect(() => {
    console.log('🔍 DEBUG Subscriptions:', {
      subscriptionsData,
      availableSubscriptions,
      subscriptionsLoading,
      subscriptionsError,
      length: availableSubscriptions.length
    });
  }, [subscriptionsData, availableSubscriptions, subscriptionsLoading, subscriptionsError]);
  
  // Initialiser le client présélectionné
  React.useEffect(() => {
    if (preselectedClient && open) {
      setSelectedClient(preselectedClient);
      setIsNewClientMode(false); // Force le mode sélection client existant
      setClientInputValue(`${preselectedClient.firstname} ${preselectedClient.lastname}`);
      console.log('🎯 Client présélectionné:', preselectedClient);
    }
  }, [preselectedClient, open]);
  
  // Utiliser soit tous les utilisateurs (superviseur) soit les clients de l'agence
  const users = isAgencyMode ? (agencyClientsData?.users || []) : (allUsers || []);

  // États pour les étapes et le formulaire
  const [activeStep, setActiveStep] = useState(0);
  const [clientInputValue, setClientInputValue] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newClient, setNewClient] = useState({
    lastname: '',
    firstname: '',
    birthday: '',
    city: '',
    phoneNumber: '',
    email: ''
  });
  const [isNewClientMode, setIsNewClientMode] = useState(false); // Permettre la recherche même en mode agence
  const [simCardInfo, setSimCardInfo] = useState({
    hasSIM: false,
    simCCID: ''
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    simCard: 10,
    subscription: 19,
    total: 10,
    paymentMethod: 'complet',
    partialPayment: 0,
    isCredit: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour la gestion des clients existants
  const [existingClientInfo, setExistingClientInfo] = useState(null);
  const [showAssociationDialog, setShowAssociationDialog] = useState(false);

  // Définition des étapes
  const steps = [
    isAgencyMode ? 'Client de l\'agence' : 'Sélection du client', 
    'Choix de l\'abonnement',
    'Information de carte SIM', 
    'Paiement'
  ];

  // Simuler un processus de recherche
  const simulateSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Calculer le prorata pour l'abonnement
  const calculateProrata = () => {
    if (!selectedSubscription) return 0;
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate();
    return parseFloat(((selectedSubscription.totalMonthlyPrice * remainingDays) / daysInMonth).toFixed(2));
  };

  // Mise à jour des totaux quand l'étape ou les infos de la carte SIM changent
  useEffect(() => {
    if (activeStep === 3) {
      const prorataAmount = simCardInfo.hasSIM ? calculateProrata() : 0;
      setPaymentInfo(prev => ({
        ...prev,
        subscription: prorataAmount,
        total: 10 + prorataAmount,
        partialPayment: 10 + prorataAmount
      }));
    }
  }, [activeStep, simCardInfo.hasSIM, selectedSubscription]);

  // Fonction de validation pour chaque étape
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // Validation de l'étape 1
        if (!isNewClientMode && !selectedClient) {
          newErrors.client = "Vous devez sélectionner un client existant";
          isValid = false;
        }
        
        if (isNewClientMode) {
          if (!newClient.firstname?.trim()) {
            newErrors.firstname = "Le prénom est requis";
            isValid = false;
          }

          if (!newClient.lastname?.trim()) {
            newErrors.lastname = "Le nom est requis";
            isValid = false;
          }

          // Vérifier que le téléphone contient au moins 10 chiffres (format "0 6 X X X X X X X X")
          const phoneDigits = newClient.phoneNumber?.replace(/\s/g, '') || '';
          if (!phoneDigits || phoneDigits.length < 10) {
            newErrors.phoneNumber = "Le téléphone doit contenir 10 chiffres et commencer par 0";
            isValid = false;
          }

          // Validation email obligatoire
          if (!newClient.email?.trim()) {
            newErrors.email = "L'email est requis";
            isValid = false;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
            newErrors.email = "Format d'email invalide";
            isValid = false;
          }
        }
        break;
        
      case 1: // Validation de l'étape 2 - Abonnement
        if (!selectedSubscription) {
          newErrors.subscription = "Veuillez sélectionner un abonnement";
          isValid = false;
        }
        break;
        
      case 2: // Validation de l'étape 3 - Carte SIM
        if (simCardInfo.hasSIM && !simCardInfo.simCCID) {
          newErrors.simCCID = "L'ICCID de la carte SIM est requis";
          isValid = false;
        }
        break;
        
      case 3: // Validation de l'étape 4 - Paiement
        // Pas de validation nécessaire, paiement toujours complet
        break;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Association d'un client existant
  const handleAssociateExistingClient = async () => {
    if (!existingClientInfo?.existingClient) return;
    
    setIsSubmitting(true);
    try {
      const result = await associateClient({ 
        clientId: existingClientInfo.existingClient.id,
        agencyId: autoSelectedAgencyId
      }).unwrap();
      
      console.log('Client associé avec succès:', result);
      
      // Rafraîchir la liste des clients de l'agence - forçage multiple
      if (refetchAgencyClients) {
        console.log('Refetching agency clients...');
        await refetchAgencyClients();
      }
      
      // Le cache devrait maintenant être correctement invalidé
      
      onClientCreated(existingClientInfo.existingClient);
      handleCloseAssociationDialog();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'association du client:', error);
      setFormErrors({ 
        submit: error?.data?.message || 'Erreur lors de l\'association du client' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer le dialog d'association et revenir au formulaire principal
  const handleCloseAssociationDialog = () => {
    setShowAssociationDialog(false);
    setExistingClientInfo(null);
  };

  // Navigation entre les étapes
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setIsLoading(true);
      setTimeout(() => {
        setActiveStep((prevStep) => prevStep + 1);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleBack = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveStep((prevStep) => prevStep - 1);
      setIsLoading(false);
    }, 300);
  };

  // Soumission finale
  const handleSubmit = async () => {
    console.log('🚀 handleSubmit appelé - Debug:', {
      activeStep,
      isNewClientMode,
      selectedClient,
      useCreateClientRoute,
      validateResult: validateStep(activeStep)
    });
    
    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      
      try {
        const clientData = isNewClientMode ? newClient : selectedClient;
        
        // Si c'est un nouveau client, créer via l'API avec les données complètes
        if (isNewClientMode) {
          const finalClientData = {
            ...clientData,
            role: 'CLIENT', // Forcer le rôle client
            agencyId: autoSelectedAgencyId,
            // Ajouter les informations de demande de ligne/SIM
            simCardInfo,
            paymentInfo,
            needsLine: true, // Indiquer qu'une ligne est demandée
            subscriptionId: selectedSubscription?.id || null
          };
          
          const result = await createClient(finalClientData).unwrap();
          console.log('Client créé avec succès:', result);
          onClientCreated(result.user || result);
        } else {
          console.log('📝 Client existant - Debug:', {
            useCreateClientRoute,
            selectedClient,
            autoSelectedAgencyId,
            simCardInfo,
            paymentInfo
          });
          
          // Si c'est un client existant, utiliser createClient ou associateClient selon la prop
          if (useCreateClientRoute) {
            console.log('✅ Utilisation de createClient pour client existant');
            // Utiliser la route /clients avec les données du client sélectionné
            const finalClientData = {
              ...selectedClient,
              role: 'CLIENT',
              agencyId: autoSelectedAgencyId,
              simCardInfo,
              paymentInfo,
              needsLine: true, 
              subscriptionId: selectedSubscription?.id || null
            };
            
            console.log('📤 Envoi données à createClient:', finalClientData);
            const result = await createClient(finalClientData).unwrap();
            console.log('✅ Ligne créée pour client existant via /clients:', result);
            onClientCreated(result.user || result);
          } else {
            // Méthode originale avec associateClient
            const associationData = {
              clientId: selectedClient.id,
              agencyId: autoSelectedAgencyId,
              simCardInfo,
              paymentInfo,
              needsLine: true,
              subscriptionId: selectedSubscription?.id || null
            };
            
            const result = await associateClient(associationData).unwrap();
            console.log('Client associé avec demande de ligne:', result);
            onClientCreated(result.client || selectedClient);
          }
        }
        
        setIsSubmitting(false);
        handleClose();
      } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        setIsSubmitting(false);
        
        // Gestion spéciale pour les clients existants (status 409)
        if (error?.status === 409 && error?.data?.clientExists) {
          setExistingClientInfo(error.data);
          setShowAssociationDialog(true);
          setFormErrors({}); // Clear form errors
        } else {
          // Autres erreurs
          setFormErrors({ 
            submit: error?.data?.message || 'Une erreur est survenue lors de la création du client' 
          });
        }
      }
    }
  };

  // Réinitialisation et fermeture
  const handleClose = () => {
    setActiveStep(0);
    setSelectedClient(null);
    setClientInputValue('');
    setNewClient({
      lastname: '',
      firstname: '',
      birthday: '',
      city: '',
      phoneNumber: '',
      email: ''
    });
    setIsNewClientMode(false);
    setSimCardInfo({
      hasSIM: false,
      simCCID: ''
    });
    setPaymentInfo({
      simCard: 10,
      subscription: 0,
      total: 10,
      paymentMethod: 'complet',
      partialPayment: 0,
      isCredit: false
    });
    setFormErrors({});
    onClose();
  };

  // Fonction pour formater le texte d'option de l'autocomplete
  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return `${option.firstname} ${option.lastname} (${option.email})`;
  };

  // Rendu du contenu spécifique à chaque étape
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Étape 1: Sélection du client
        return (
          <Box sx={{ mt: 3 }}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                color="primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {isNewClientMode ? <PersonAddIcon /> : <SearchIcon />}
                {isAgencyMode ? (isNewClientMode ? "Nouveau client pour l'agence" : "Rechercher un client de l'agence") : (isNewClientMode ? "Nouveau client" : "Rechercher un client existant")}
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={isNewClientMode}
                    onChange={(e) => {
                      setIsNewClientMode(e.target.checked);
                      setSelectedClient(null);
                    }}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight="medium">
                    {isAgencyMode 
                      ? (isNewClientMode ? "Créer un nouveau client" : "Rechercher parmi mes clients")
                      : (isNewClientMode ? "Mode création" : "Mode recherche")
                    }
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              {isNewClientMode ? (
                <Fade in={isNewClientMode} timeout={500}>
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={newClient.lastname}
                          onChange={(e) => setNewClient({ ...newClient, lastname: e.target.value })}
                          error={!!formErrors.lastname}
                          helperText={formErrors.lastname}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          required
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          value={newClient.firstname}
                          onChange={(e) => setNewClient({ ...newClient, firstname: e.target.value })}
                          error={!!formErrors.firstname}
                          helperText={formErrors.firstname}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          required
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Date de naissance"
                          value={newClient.birthday}
                          onChange={(e) => {
                            const formattedDate = formatBirthdate(e.target.value);
                            setNewClient({ ...newClient, birthday: formattedDate });
                          }}
                          error={!!formErrors.birthday}
                          helperText={formErrors.birthday}
                          placeholder="JJ/MM/AAAA"
                          inputProps={{
                            maxLength: 10, // 2 + 1 + 2 + 1 + 4 = 10 caractères max
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Ville"
                          value={newClient.city}
                          onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                          error={!!formErrors.city}
                            helperText={formErrors.city}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCityIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          value={newClient.phoneNumber}
                          onChange={(e) => {
                            const formattedPhone = formatPhoneNumber(e.target.value);
                            setNewClient({ ...newClient, phoneNumber: formattedPhone });
                          }}
                          error={!!formErrors.phoneNumber}
                          helperText={formErrors.phoneNumber}
                          placeholder="06 39 77 86 00"
                          inputProps={{
                            maxLength: 14, // 10 chiffres + 4 espaces = 14 caractères max
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email *"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    {(newClient.lastname && newClient.firstname) && (
                      <ClientPreview client={newClient} />
                    )}
                  </Box>
                </Fade>
              ) : (
                <Fade in={!isNewClientMode} timeout={500}>
                  <Box>
                    <Autocomplete
                      fullWidth
                      options={users || []}
                      getOptionLabel={getOptionLabel}
                      inputValue={clientInputValue}
                      onInputChange={(event, newInputValue) => {
                        setClientInputValue(newInputValue);
                        if (newInputValue.length > 2) {
                          simulateSearch();
                        }
                      }}
                      onChange={(event, newValue) => {
                        setSelectedClient(newValue);
                      }}
                      loading={isLoading}
                      loadingText="Recherche en cours..."
                      noOptionsText={isAgencyMode ? "Aucun client dans votre agence" : "Aucun client trouvé"}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1">
                              {option.firstname} {option.lastname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.email} • {option.role}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rechercher un client"
                          placeholder="Nom, prénom ou téléphone"
                          error={!!formErrors.client}
                          helperText={formErrors.client}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <SearchIcon color="primary" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            endAdornment: (
                              <>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      )}
                    />
                    
                    {selectedClient && <ClientPreview client={selectedClient} />}
                  </Box>
                </Fade>
              )}
            </Paper>
          </Box>
        );
        
      case 1: // Étape 2: Choix de l'abonnement
        return (
          <Box sx={{ mt: 3 }}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                color="primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  fontWeight: 'bold' 
                }}
              >
                <SubscriptionsIcon />
                Sélectionnez un abonnement
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Choisissez le plan d'abonnement adapté aux besoins de votre client.
              </Typography>

              <Grid container spacing={2}>
                {subscriptionsLoading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body1" sx={{ ml: 2 }}>
                        Chargement des abonnements...
                      </Typography>
                    </Box>
                  </Grid>
                ) : subscriptionsError ? (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      Erreur lors du chargement des abonnements : {subscriptionsError.message || 'Erreur inconnue'}
                    </Alert>
                  </Grid>
                ) : availableSubscriptions.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      Aucun abonnement disponible. Veuillez contacter l'administrateur.
                    </Alert>
                  </Grid>
                ) : (
                  availableSubscriptions.map((subscription) => (
                    <Grid item xs={12} md={6} key={subscription.id}>
                      <Paper
                        elevation={selectedSubscription?.id === subscription.id ? 8 : 2}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedSubscription?.id === subscription.id 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : '1px solid transparent',
                          transition: 'all 0.3s ease',
                          transform: selectedSubscription?.id === subscription.id ? 'scale(1.02)' : 'scale(1)',
                          '&:hover': {
                            elevation: 4,
                            transform: 'scale(1.02)',
                            border: `1px solid ${theme.palette.primary.light}`
                          }
                        }}
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {subscription.name}
                          </Typography>
                          <Chip 
                            label={subscription.subscriptionType} 
                            color={subscription.subscriptionType === 'PREPAID' ? 'success' : 'info'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {subscription.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {subscription.dataSummary}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Durée: {subscription.durationDays} jours
                          </Typography>
                        </Box>

                        {subscription.hasEquipment && (
                          <Box sx={{ mb: 2, p: 1, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                            <Typography variant="caption" color="info.main" fontWeight="medium">
                              📦 {subscription.equipmentInfo}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {subscription.formattedTotalPrice}
                          </Typography>
                          {selectedSubscription?.id === subscription.id && (
                            <CheckIcon color="primary" />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>

              
              {formErrors.subscription && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formErrors.subscription}
                </Alert>
              )}
            </Paper>
          </Box>
        );
        
      case 2: // Étape 3: Information de carte SIM
        return (
          <Box sx={{ mt: 3 }}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                color="primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                <SimCardIcon />
                Configuration de la carte SIM
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                my: 2, 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '25%',
                  right: '25%',
                  height: '2px',
                  background: `${alpha(theme.palette.primary.main, 0.2)}`,
                  zIndex: 0
                }
              }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  badgeContent={
                    simCardInfo.hasSIM ? (
                      <Avatar 
                        sx={{ 
                          width: 22, 
                          height: 22, 
                          bgcolor: 'success.main',
                          border: `2px solid ${theme.palette.background.paper}`
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                    ) : null
                  }
                >
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: simCardInfo.hasSIM ? 'info.main' : 'grey.300',
                      transition: 'all 0.3s ease',
                      boxShadow: simCardInfo.hasSIM ? 4 : 0,
                      zIndex: 1
                    }}
                  >
                    <SimCardIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </Badge>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={simCardInfo.hasSIM}
                    onChange={(e) => {
                      // Ne permettre l'activation que s'il y a des cartes disponibles ou si on désactive
                      if (!e.target.checked || availableSimCards.length > 0) {
                        setSimCardInfo({ ...simCardInfo, hasSIM: e.target.checked });
                      }
                    }}
                    color="primary"
                    disabled={availableSimCards.length === 0 && !simCardInfo.hasSIM}
                  />
                }
                label={
                  <Typography variant="body1" fontWeight="medium">
                    {simCardInfo.hasSIM 
                      ? "Carte SIM à attribuer" 
                      : availableSimCards.length > 0 
                        ? `${availableSimCards.length} carte(s) SIM disponible(s)` 
                        : "Pas de carte SIM en stock"}
                  </Typography>
                }
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  justifyContent: 'center',
                  width: '100%'
                }}
              />

              <Fade in={simCardInfo.hasSIM} timeout={500}>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Autocomplete
                    fullWidth
                    options={availableSimCards}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.iccid || ''}
                    value={availableSimCards.find(card => card.iccid === simCardInfo.simCCID) || null}
                    onChange={(event, newValue) => {
                      setSimCardInfo({ 
                        ...simCardInfo, 
                        simCCID: newValue ? newValue.iccid : '' 
                      });
                    }}
                    freeSolo
                    onInputChange={(event, newInputValue) => {
                      if (!newInputValue || !availableSimCards.find(card => card.iccid === newInputValue)) {
                        setSimCardInfo({ ...simCardInfo, simCCID: newInputValue });
                      }
                    }}
                    loading={simCardsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ICCID de la carte SIM"
                        error={!!formErrors.simCCID}
                        helperText={formErrors.simCCID || (availableSimCards.length > 0 
                          ? `${availableSimCards.length} carte(s) SIM disponible(s)`
                          : "Aucune carte SIM disponible - saisissez un ICCID manuellement")}
                        placeholder="Sélectionnez une carte SIM ou saisissez un ICCID"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        required={simCardInfo.hasSIM}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {option.iccid}
                          </Typography>
                          {option.receivedDate && (
                            <Typography variant="body2" color="text.secondary">
                              Reçu le: {new Date(option.receivedDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              </Fade>
              
              {simCardInfo.hasSIM ? (
                <Alert 
                  severity="info" 
                  icon={<SimCardIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Attribution avec carte SIM
                  </Typography>
                  <Typography variant="body2">
                    La carte SIM sera facturée 10€ et un prorata de l'abonnement ({calculateProrata().toFixed(2)}€) sera calculé pour le mois en cours.
                  </Typography>
                </Alert>
              ) : (
                <Alert 
                  severity="warning" 
                  icon={<InfoIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Attribution sans carte SIM
                  </Typography>
                  <Typography variant="body2">
                    Vous n'attribuez pas de carte SIM pour le moment. Seule la carte SIM (10€) sera facturée. 
                    Une carte SIM devra être attribuée ultérieurement pour activer la ligne.
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Box>
        );
        
      case 3: // Étape 4: Paiement
        return (
          <Box sx={{ mt: 3 }}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              color="primary"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 'bold',
                mb: 2
              }}
            >
              <ReceiptIcon />
              Facturation
            </Typography>
            
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.98)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
              }}
            >
              <Box sx={{ 
                mb: 3, 
                pb: 2, 
                borderBottom: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 'bold',
                    color: theme.palette.primary.main
                  }}
                >
                  <ReceiptIcon />
                  Récapitulatif du paiement
                </Typography>
                <Chip 
                  label="Facture" 
                  color="primary" 
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Box sx={{ px: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={7}>
                    <Typography variant="body1" fontWeight="medium">Carte SIM :</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body1" align="right" fontWeight="medium">10,00 €</Typography>
                  </Grid>
                  
                  {simCardInfo.hasSIM && (
                    <>
                      <Grid item xs={7}>
                        <Typography variant="body1" fontWeight="medium">
                          Prorata abonnement :
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Reste du mois en cours)
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="body1" align="right" fontWeight="medium">
                          {paymentInfo.subscription.toFixed(2)} €
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ mt: 1, mb: 2 }} />
                  </Grid>
                  
                  <Grid item xs={7}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">TOTAL :</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="h6" fontWeight="bold" align="right" color="primary.main">
                      {paymentInfo.total.toFixed(2)} €
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            </Paper>
        </Box>
      );
      
    default:
      return null;
  }
};

// Rendu complet du composant
return (
  <>
    {/* Dialog principal de création/sélection de client */}
    <Dialog
      open={open && !showAssociationDialog}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={SlideTransition}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
    <DialogTitle sx={{ 
      bgcolor: theme.palette.primary.main,
      color: 'white',
      py: 2
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          {activeStep === 0 && <PersonIcon />}
          {activeStep === 1 && <SubscriptionsIcon />}
          {activeStep === 2 && <SimCardIcon />}
          {activeStep === 3 && <ReceiptIcon />}
          <Typography variant="h6" fontWeight="bold">
            {activeStep === 0 && "Sélection ou Création du Client"}
            {activeStep === 1 && "Choix de l'abonnement"}
            {activeStep === 2 && "Attribution de Carte SIM"}
            {activeStep === 3 && "Facturation"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>

    <DialogContent 
      sx={{
        px: 3,
        py: 4,
        backgroundImage: `radial-gradient(at 30% 20%, ${alpha(theme.palette.primary.light, 0.05)} 0px, transparent 50%),
                          radial-gradient(at 80% 70%, ${alpha(theme.palette.info.light, 0.05)} 0px, transparent 50%)`,
      }}
    >
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel 
        sx={{ mt: 1, mb: 4 }}
        connector={<CustomStepConnector />}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              <Typography fontWeight={activeStep === index ? 'bold' : 'normal'}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}
      
      {formErrors.submit && (
        <Alert 
          severity="error" 
          sx={{ m: 3, mt: 0 }}
          onClose={() => setFormErrors({ ...formErrors, submit: undefined })}
        >
          {formErrors.submit}
        </Alert>
      )}
    </DialogContent>

    <DialogActions sx={{ 
      p: 3,
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.9)
    }}>
      <AnimatedButton
        onClick={handleBack}
        disabled={activeStep === 0}
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{ borderRadius: 2 }}
      >
        Retour
      </AnimatedButton>
      
      <Box sx={{ position: 'relative' }}>
        {activeStep === steps.length - 1 ? (
          <AnimatedButton
            variant="contained"
            onClick={handleSubmit}
            startIcon={isSubmitting ? null : <PaidIcon />}
            disabled={isSubmitting}
            color="success"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? 'Validation en cours...' : 'Valider et Facturer'}
            {isSubmitting && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </AnimatedButton>
        ) : (
          <AnimatedButton
            variant="contained"
            onClick={handleNext}
            endIcon={isLoading ? null : <ArrowForwardIcon />}
            disabled={isLoading}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            {isLoading ? 'Chargement...' : 'Suivant'}
            {isLoading && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </AnimatedButton>
        )}
      </Box>
    </DialogActions>
  </Dialog>

    {/* Dialog d'association pour client existant */}
    <Dialog
      open={showAssociationDialog}
      onClose={handleCloseAssociationDialog}
      maxWidth="sm"
      fullWidth
      TransitionComponent={SlideTransition}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.warning.main,
        color: 'white',
        py: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon />
            <Typography variant="h6" fontWeight="bold">
              Client existant trouvé
            </Typography>
          </Box>
          <IconButton onClick={handleCloseAssociationDialog} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {existingClientInfo && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {existingClientInfo.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {existingClientInfo.actionMessage}
              </Typography>
            </Alert>

            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.light, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}
            >
              <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Informations du client existant :
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>Nom :</strong> {existingClientInfo.existingClient?.lastname}
                </Typography>
                <Typography variant="body1">
                  <strong>Prénom :</strong> {existingClientInfo.existingClient?.firstname}
                </Typography>
                {existingClientInfo.existingClient?.email && (
                  <Typography variant="body1">
                    <strong>Email :</strong> {existingClientInfo.existingClient.email}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Téléphone :</strong> {existingClientInfo.existingClient?.phoneNumber}
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.9)
      }}>
        <Button
          onClick={handleCloseAssociationDialog}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2 }}
        >
          Annuler
        </Button>
        
        <AnimatedButton
          onClick={handleAssociateExistingClient}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? 'Association...' : 'Associer à mon agence'}
        </AnimatedButton>
      </DialogActions>
    </Dialog>
  </>
);
};

export default CreateClientModal;