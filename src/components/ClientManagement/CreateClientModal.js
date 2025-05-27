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
  Zoom,
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
  Info as InfoIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllUsersQuery } from "../../store/slices/clientsSlice";

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
    <Zoom in={Boolean(client)} timeout={500}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 2, 
          bgcolor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          border: `1px dashed ${theme.palette.primary.main}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1 }}>
          <Chip 
            icon={<VerifiedUserIcon />} 
            label="Client vérifié" 
            color="success" 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
              fontSize: 24,
              fontWeight: 'bold'
            }}
          >
            {client.firstname?.[0]}{client.lastname?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              {client.firstname} {client.lastname}
            </Typography>
            {client.email && (
              <Typography variant="body2" color="text.secondary">
                Email: {client.email}
              </Typography>
            )}
            {client.role && (
              <Typography variant="body2" color="text.secondary">
                Role: {client.role}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          {client.role && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationCityIcon color="primary" />
                <Typography variant="body1">
                  {client.role}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {client.phoneNumber && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon color="primary" />
                <Typography variant="body1">
                  {client.phoneNumber}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {client.email && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" />
                <Typography variant="body1">
                  {client.email}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Zoom>
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

// Composant principal
const  CreateClientModal = ({ open, onClose, onClientCreated }) => {
  const theme = useTheme();
  const { data: users } = useGetAllUsersQuery();

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
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [simCardInfo, setSimCardInfo] = useState({
    hasSIM: false,
    simCCID: ''
  });
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

  // Définition des étapes
  const steps = ['Sélection du client', 'Information de carte SIM', 'Paiement'];

  // Simuler un processus de recherche
  const simulateSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Calculer le prorata pour l'abonnement
  const calculateProrata = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate();
    return parseFloat(((19 * remainingDays) / daysInMonth).toFixed(2));
  };

  // Mise à jour des totaux quand l'étape ou les infos de la carte SIM changent
  useEffect(() => {
    if (activeStep === 2) {
      const prorataAmount = simCardInfo.hasSIM ? calculateProrata() : 0;
      setPaymentInfo(prev => ({
        ...prev,
        subscription: prorataAmount,
        total: 10 + prorataAmount,
        partialPayment: 10 + prorataAmount
      }));
    }
  }, [activeStep, simCardInfo.hasSIM]);

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
          if (!newClient.firstname) {
            newErrors.firstname = "Le nom est requis";
            isValid = false;
          }

          if (!newClient.lastname) {
            newErrors.lastname = "Le prénom est requis";
            isValid = false;
          }

          if (!newClient.birthday) {
            newErrors.birthday = "La date de naissance est requise";
            isValid = false;
          }

          if (!newClient.city) {
            newErrors.city = "La ville est requise";
            isValid = false;
          }

          if (!newClient.email) {
            newErrors.email = "L'email est requis";
            isValid = false;
          }
        }
        break;
        
      case 1: // Validation de l'étape 2
        if (simCardInfo.hasSIM && !simCardInfo.simCCID) {
          newErrors.simCCID = "L'ICCID de la carte SIM est requis";
          isValid = false;
        }
        break;
        
      case 2: // Validation de l'étape 3
        if (paymentInfo.paymentMethod === 'partiel' && 
            (paymentInfo.partialPayment <= 0 || paymentInfo.partialPayment > paymentInfo.total)) {
          newErrors.partialPayment = "Le montant partiel doit être entre 0 et le total";
          isValid = false;
        }
        break;
    }

    setFormErrors(newErrors);
    return isValid;
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
  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      
      // Simuler un délai de traitement
      setTimeout(() => {
        const clientData = isNewClientMode ? newClient : selectedClient;
        
        const submissionData = {
          client: clientData,
          simCard: simCardInfo.hasSIM ? { simCCID: simCardInfo.simCCID } : null,
          payment: {
            ...paymentInfo,
            date: new Date().toISOString()
          }
        };
        
        console.log('Données soumises:', submissionData);
        onClientCreated(submissionData);
        setIsSubmitting(false);
        handleClose();
      }, 1500);
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
                {isNewClientMode ? "Nouveau client" : "Rechercher un client existant"}
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
                    {isNewClientMode ? "Mode création" : "Mode recherche"}
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
                          onChange={(e) => setNewClient({ ...newClient, birthday: e.target.value })}
                          error={!!formErrors.birthday}
                          helperText={formErrors.birthday}
                          placeholder="JJ/MM/AAAA"
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
                          onChange={(e) => setNewClient({ ...newClient, phoneNumber: e.target.value })}
                            error={!!formErrors.phoneNumber}
                            helperText={formErrors.phoneNumber}
                          placeholder="06XXXXXXXX"
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
                          label="Email"
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
                      options={users}
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
                      noOptionsText="Aucun client trouvé"
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
        
      case 1: // Étape 2: Information de carte SIM
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
                    onChange={(e) => setSimCardInfo({ ...simCardInfo, hasSIM: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight="medium">
                    {simCardInfo.hasSIM ? "Carte SIM à attribuer" : "Pas de carte SIM disponible "}
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
                  <TextField
                    fullWidth
                    label="ICCID de la carte SIM"
                    value={simCardInfo.simCCID}
                    onChange={(e) => setSimCardInfo({ ...simCardInfo, simCCID: e.target.value })}
                    error={!!formErrors.simCCID}
                    helperText={formErrors.simCCID || "Numéro à 19 ou 20 chiffres inscrit sur la carte SIM"}
                    placeholder="893315xxxxxxxxxx"
                    InputProps={{
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
        
      case 2: // Étape 3: Paiement
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
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 3
              }}
            >
              <PaymentIcon />
              Mode de paiement
            </Typography>
          
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2, 
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                transition: 'all 0.3s ease'
              }}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Méthode de paiement</InputLabel>
                <Select
                  value={paymentInfo.paymentMethod}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                  label="Méthode de paiement"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2
                    },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                >
                  <MenuItem value="complet" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EuroIcon color="success" />
                    <Typography variant="body1">Paiement complet</Typography>
                  </MenuItem>
                  <MenuItem value="partiel" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon color="warning" />
                    <Typography variant="body1">Paiement partiel</Typography>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Fade in={paymentInfo.paymentMethod === 'partiel'} timeout={500}>
                <Box sx={{ mb: 2 }}>
                  {paymentInfo.paymentMethod === 'partiel' && (
                    <TextField
                      fullWidth
                      label="Montant payé"
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EuroIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      value={paymentInfo.partialPayment}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, partialPayment: parseFloat(e.target.value) || 0 })}
                      error={!!formErrors.partialPayment}
                      helperText={formErrors.partialPayment || (
                        <Typography variant="body2" color="text.secondary">
                          Le reste ({(paymentInfo.total - paymentInfo.partialPayment).toFixed(2)}€) sera à régler ultérieurement.
                        </Typography>
                      )}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                </Box>
              </Fade>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.5)}`,
                bgcolor: alpha(theme.palette.warning.light, 0.1),
                transition: 'all 0.3s ease',
                boxShadow: paymentInfo.isCredit ? `inset 0 0 0 1px ${alpha(theme.palette.warning.main, 0.5)}` : 'none'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentInfo.isCredit}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, isCredit: e.target.checked })}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight="medium" color={paymentInfo.isCredit ? 'warning.main' : 'text.primary'}>
                      Paiement à crédit
                    </Typography>
                  }
                />
                <Chip 
                  icon={<InfoIcon />} 
                  label="Option" 
                  color="warning" 
                  variant="outlined" 
                  size="small"
                />
              </Box>
            </Paper>
          
            {paymentInfo.isCredit && (
              <Fade in={paymentInfo.isCredit} timeout={500}>
                <Alert 
                  severity="warning" 
                  icon={<PaymentIcon />} 
                  variant="outlined"
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    p: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <AlertTitle>Paiement à crédit</AlertTitle>
                  <Typography variant="body2">
                    Le paiement sera enregistré comme un crédit à régler ultérieurement. 
                    Assurez-vous d'obtenir les coordonnées complètes du client pour le suivi.
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Paper>
        </Box>
      );
      
    default:
      return null;
  }
};

// Rendu complet du composant
return (
  <Dialog
    open={open}
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
          {activeStep === 1 && <SimCardIcon />}
          {activeStep === 2 && <ReceiptIcon />}
          <Typography variant="h6" fontWeight="bold">
            {activeStep === 0 && "Sélection ou Création du Client"}
            {activeStep === 1 && "Attribution de Carte SIM"}
            {activeStep === 2 && "Facturation"}
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
);
};

export default CreateClientModal;