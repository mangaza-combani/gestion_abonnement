import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Paper,
  Avatar,
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  AccountCircle as AccountCircleIcon,
  AlternateEmail as EmailIcon,
  VpnKey as VpnKeyIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  DateRange as DateRangeIcon,
  AccountBalance as BankIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useGetAgenciesQuery } from '../../store/slices/agencySlice';
import { useCreateRedAccountMutation, useCreateLineMutation } from '../../store/slices/redAccountsSlice';

const NewAccountDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  clients = [],
  preselectedAgency = null
}) => {
  // Récupération des agences depuis Redux via le hook RTK Query
  const { data: agenciesData, isLoading: agenciesLoading, isError: agenciesError, refetch: refetchAgencies } = useGetAgenciesQuery();
  
  // Mutation pour créer un compte RED
  const [createRedAccount, { isLoading: isSubmitting, isError: submitError, error: submitErrorDetails, isSuccess }] = useCreateRedAccountMutation();
  
  // Mutation pour créer une ligne
  const [createLine, { isLoading: isCreatingLine }] = useCreateLineMutation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Étape 1: Informations de compte
    redId: '',
    password: '',
    agencyId: preselectedAgency?.id?.toString() || '',
    maxLines: 5,
    
    // Étape 2: Informations de paiement
    cardLastFour: '',
    cardExpiry: '',
    bankName: '',
    cardHolderName: '',
    
    // Étape 3: Ligne(s) initiale(s)
    lines: []
  });

  // Pour l'étape 3: informations de la nouvelle ligne
  const [newLine, setNewLine] = useState({
    clientId: null,
    phoneNumber: '',
    status: 'EN COURS DE LIVRAISON'
  });
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState({ 
    current: 0, 
    total: 0, 
    message: '' 
  });

  // Extraction des agences à partir des données récupérées
  const agencies = Array.isArray(agenciesData) ? agenciesData : [];

  // Réinitialiser le formulaire quand la mutation est réussie
  useEffect(() => {
    if (isSuccess && !isProcessing) {
      resetForm();
      onClose();
      if (onSubmit) onSubmit();
    }
  }, [isSuccess, isProcessing]);

  // Mettre à jour l'agencyId si une agence est présélectionnée
  useEffect(() => {
    if (preselectedAgency?.id) {
      setFormData(prev => ({ 
        ...prev, 
        agencyId: preselectedAgency.id.toString() 
      }));
    }
  }, [preselectedAgency]);


  // Statuts possibles pour une ligne (fixé à "EN COURS DE LIVRAISON" depuis ce modal)
  const lineStatuses = [
    "EN COURS DE LIVRAISON"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (e) => {
    const { name, value } = e.target;
    setNewLine(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (event, client) => {
    setSelectedClient(client);
    setNewLine(prev => ({ 
      ...prev, 
      clientId: client?.id || null,
      status: 'EN COURS DE LIVRAISON' // Statut fixé
    }));
  };

  const handleCardLastFourChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setFormData(prev => ({ ...prev, cardLastFour: value }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setFormData(prev => ({ ...prev, cardExpiry: value }));
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    // Format as 06XX XX XX XX
    if (value.length > 2) value = value.slice(0, 2) + ' ' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + ' ' + value.slice(5);
    if (value.length > 8) value = value.slice(0, 8) + ' ' + value.slice(8);
    setNewLine(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleAddLine = () => {
    const line = {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID unique pour l'UI
      ...newLine,
      clientName: selectedClient ? `${selectedClient.nom} ${selectedClient.prenom}` : '',
    };
    
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, line]
    }));
    
    // Reset line form
    setNewLine({
      clientId: null,
      phoneNumber: '',
      status: 'EN COURS DE LIVRAISON'
    });
    setSelectedClient(null);
  };

  const handleRemoveLine = (lineId) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.id !== lineId)
    }));
  };

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Nouvelle fonction pour créer les lignes en séquence
  const createLines = async (accountId) => {
    const { lines } = formData;
    if (lines.length === 0) return true;
    
    setIsProcessing(true);
    setProcessStatus({ 
      current: 0, 
      total: lines.length, 
      message: 'Création des lignes en cours...' 
    });
    
    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        setProcessStatus({ 
          current: i + 1, 
          total: lines.length, 
          message: `Création de la ligne ${i + 1}/${lines.length}...` 
        });
        
        // Préparer les données de la ligne pour l'API
        const lineData = {
          phoneNumber: line.phoneNumber.replace(/\s/g, ''), // Enlever les espaces
          status: mapStatusToApiFormat(line.status)
        };
        
        // Si un client est attribué, ajouter l'ID du client
        if (line.clientId) {
          lineData.clientId = line.clientId;
        }
        console.log("line data , ", lineData)
        // Appel à l'API pour créer la ligne
        await createLine({ 
          accountId, 
          lineData 
        }).unwrap();
      }
      
      setProcessStatus({ 
        current: lines.length, 
        total: lines.length, 
        message: 'Toutes les lignes ont été créées avec succès!' 
      });
      
      setIsProcessing(false);
      return true;
    } catch (err) {
      console.error("Erreur lors de la création des lignes:", err);
      setProcessStatus({ 
        current: 0, 
        total: lines.length, 
        message: `Erreur: ${err.message || 'Impossible de créer les lignes'}` 
      });
      setIsProcessing(false);
      return false;
    }
  };

  // Fonction utilitaire pour mapper les statuts du formulaire vers les statuts de l'API
  const mapStatusToApiFormat = (uiStatus) => {
    // Mapper les statuts de l'UI vers les constantes de l'API dans redAccountsSlice.js
    const statusMap = {
      'NON ATTRIBUÉ': 'UNATTRIBUTED',
      'ACTIF': 'UP_TO_DATE',
      'BLOQUÉ': 'SUSPENDED',
      'PAUSE': 'DISCONNECTED',
      'EN COURS DE LIVRAISON': 'NEEDS_TO_BE_ACTIVATED'
    };
    
    return statusMap[uiStatus] || 'NEEDS_TO_BE_ACTIVATED';
  };

  const handleSubmit = async () => {
    // Créer l'objet de données pour l'API
    const redAccountData = {
      redId: formData.redId,
      password: formData.password,
      agencyId: parseInt(formData.agencyId),
      maxLines: parseInt(formData.maxLines),
      // Les données financières ne sont pas envoyées à l'API de RED mais pourraient être stockées ailleurs
      paymentInfo: {
        bankName: formData.bankName,
        cardLastFour: formData.cardLastFour,
        cardExpiry: formData.cardExpiry,
        cardHolderName: formData.cardHolderName
      }
    };

    try {
      // Appel de la mutation pour créer le compte
      const result = await createRedAccount({
        password: redAccountData.password,
        redAccountId: redAccountData.redId,
        agencyId: redAccountData.agencyId,
        activeLines: redAccountData.activeLines || 0,
        maxLines: redAccountData.maxLines,
        paymentInfo: {
          bankName: redAccountData.paymentInfo.bankName,
          cardLastFour: redAccountData.paymentInfo.cardLastFour,
          cardExpiry: redAccountData.paymentInfo.cardExpiry,
          cardHolderName: redAccountData.paymentInfo.cardHolderName
        }
      }).unwrap();

      // Récupérer l'ID du compte créé
      const newAccountId = result.redAccount?.id;
      console.log('Nouveau compte créé avec ID:', newAccountId);
      console.log('Lignes à créer:', formData.lines);

      // Créer les lignes si nécessaire
      if (formData.lines.length > 0 && newAccountId) {
        const linesCreated = await createLines(newAccountId);
        if (!linesCreated) {
          console.error('Erreur lors de la création des lignes');
          return; // Ne pas fermer le modal en cas d'erreur
        }
      }
      
      // Si tout s'est bien passé, on peut fermer le dialogue
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Erreur lors de la création du compte:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      redId: '',
      password: '',
      agencyId: preselectedAgency?.id?.toString() || '',
      maxLines: 5,
      cardLastFour: '',
      cardExpiry: '',
      bankName: '',
      cardHolderName: '',
      lines: []
    });
    setActiveStep(0);
    setNewLine({
      clientId: null,
      phoneNumber: '',
      status: 'EN COURS DE LIVRAISON'
    });
    setSelectedClient(null);
    setIsProcessing(false);
    setProcessStatus({ current: 0, total: 0, message: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Vérification de la validité de chaque étape
  const isStepValid = (step) => {
    switch (step) {
      case 0: // Étape 1: Informations de compte
        return (
          formData.redId &&
          formData.password &&
          formData.agencyId
        );
      case 1: // Étape 2: Informations de paiement
        return (
          formData.cardLastFour.length === 4 &&
          formData.cardExpiry.length === 5 &&
          formData.bankName &&
          formData.cardHolderName
        );
      case 2: // Étape 3: Ligne(s) initiale(s)
        return true; // Optionnel d'ajouter des lignes
      default:
        return false;
    }
  };

  // Contenu de chaque étape
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0} timeout={500}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Informations du compte
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {agenciesLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      <Typography variant="body2">Chargement des agences...</Typography>
                    </Box>
                  ) : agenciesError ? (
                    <Alert 
                      severity="error" 
                      icon={<ErrorIcon />}
                      sx={{ mb: 2 }}
                    >
                      Une erreur est survenue lors du chargement des agences.
                      <Button size="small" onClick={() => refetchAgencies()} sx={{ ml: 2 }}>
                        Réessayer
                      </Button>
                    </Alert>
                  ) : (
                    <Autocomplete
                      fullWidth
                      options={agencies}
                      getOptionLabel={(option) => option.name}
                      value={agencies?.find(a => a.id === parseInt(formData.agencyId)) || null}
                      disabled={!!preselectedAgency}
                      onChange={(event, agency) => {
                        if (!preselectedAgency) {
                          setFormData(prev => ({ ...prev, agencyId: agency ? agency.id.toString() : '' }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Agence"
                          error={activeStep > 0 && !formData.agencyId}
                          helperText={
                            preselectedAgency 
                              ? `Agence présélectionnée: ${preselectedAgency.name}`
                              : (activeStep > 0 && !formData.agencyId ? "Ce champ est obligatoire" : "")
                          }
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <BusinessIcon color={preselectedAgency ? "secondary" : "primary"} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Identifiant Red by SFR"
                    name="redId"
                    value={formData.redId}
                    onChange={handleChange}
                    placeholder="ex: RED_123456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    error={activeStep > 0 && !formData.redId}
                    helperText={activeStep > 0 && !formData.redId ? "Ce champ est obligatoire" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    error={activeStep > 0 && !formData.password}
                    helperText={activeStep > 0 && !formData.password ? "Ce champ est obligatoire" : ""}
                  />
                </Grid>
                
              </Grid>
            </Box>
          </Fade>
        );
      
      case 1:
        return (
          <div>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Informations de paiement
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nom sur la carte"
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardHolderName: e.target.value.toUpperCase() }))}
                    placeholder="ex: JOHN DOE"
                    error={activeStep > 1 && !formData.cardHolderName}
                    helperText={activeStep > 1 && !formData.cardHolderName ? "Ce champ est obligatoire" : "Nom tel qu'inscrit sur la carte"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Banque"
                    name="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="ex: Crédit Agricole, BNP Paribas, Société Générale..."
                    error={activeStep > 1 && !formData.bankName}
                    helperText={activeStep > 1 && !formData.bankName ? "Ce champ est obligatoire" : "Nom de la banque émettrice de la carte"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BankIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="4 derniers chiffres de la carte"
                    name="cardLastFour"
                    value={formData.cardLastFour}
                    onChange={handleCardLastFourChange}
                    inputProps={{ maxLength: 4 }}
                    placeholder="ex: 1234"
                    helperText={activeStep > 1 && formData.cardLastFour.length !== 4 
                      ? "Veuillez saisir les 4 chiffres" 
                      : "Uniquement les 4 derniers chiffres"}
                    error={activeStep > 1 && formData.cardLastFour.length !== 4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date d'expiration"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleCardExpiryChange}
                    inputProps={{ maxLength: 5 }}
                    placeholder="MM/YY"
                    helperText={activeStep > 1 && formData.cardExpiry.length !== 5 
                      ? "Format invalide" 
                      : "Format: MM/YY"}
                    error={activeStep > 1 && formData.cardExpiry.length !== 5}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </div>
        );

      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ajouter des lignes (Optionnel)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {isProcessing ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {processStatus.message}
                  </Typography>
                  {processStatus.total > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Progression: {processStatus.current}/{processStatus.total}
                    </Typography>
                  )}
                </Box>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Les lignes seront créées automatiquement après la création du compte.
                  </Alert>

                  <Grid container spacing={3}>
                    {/* Formulaire d'ajout de ligne */}
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Nouvelle ligne
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Numéro de téléphone"
                              name="phoneNumber"
                              value={newLine.phoneNumber}
                              onChange={handlePhoneNumberChange}
                              placeholder="06XX XX XX XX"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Statut"
                              value={newLine.status}
                              disabled
                              helperText="Statut fixé : lignes en cours de livraison"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="warning" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                💡 <strong>Ligne en cours de livraison :</strong> Le numéro exact sera révélé à la réception de la carte SIM. 
                                Vous pourrez attribuer la ligne à un client lors de l'activation.
                              </Typography>
                            </Alert>
                          </Grid>
                          
                          {/* Aperçu du client sélectionné */}
                          {selectedClient && (
                            <Grid item xs={12}>
                              <Zoom in={Boolean(selectedClient)} timeout={500}>
                                <Card variant="outlined" sx={{ mt: 1 }}>
                                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {selectedClient.nom[0]}{selectedClient.prenom[0]}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="subtitle2">
                                          {selectedClient.nom} {selectedClient.prenom}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {selectedClient.telephone}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Zoom>
                            </Grid>
                          )}
                          
                          <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleAddLine}
                                disabled={!newLine.phoneNumber}
                                startIcon={<PersonAddIcon />}
                              >
                                Ajouter la ligne
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    
                    {/* Liste des lignes ajoutées */}
                    {formData.lines.length > 0 && (
                      <Grid item xs={12}>
                        <Paper elevation={1} sx={{ mt: 2, p: 0, overflow: 'hidden', borderRadius: 2 }}>
                          <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                            <Typography variant="subtitle2">
                              Lignes ajoutées ({formData.lines.length}/{formData.maxLines})
                            </Typography>
                          </Box>
                          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {formData.lines.map((line, index) => (
                              <Fade key={line.id} in={true} timeout={500}>
                                <Box sx={{ 
                                  p: 2, 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: index < formData.lines.length - 1 ? '1px solid #eee' : 'none'
                                }}>
                                  <Box>
                                    <Typography variant="subtitle2">
                                      {line.phoneNumber || 'Numéro non défini'}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                      {line.clientName ? (
                                        <Typography variant="body2" color="text.secondary">
                                          {line.clientName}
                                        </Typography>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          Aucun client attribué
                                        </Typography>
                                      )}
                                      <Chip 
                                        label={line.status} 
                                        size="small"
                                        color={line.status === 'ACTIF' ? 'success' : line.status === 'BLOQUÉ' ? 'error' : 'default'}
                                      />
                                    </Box>
                                  </Box>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleRemoveLine(line.id)}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Fade>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Box>
          </Fade>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CreditCardIcon />
            <Typography variant="h6">Nouveau Compte Red by SFR</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
          >
            {submitErrorDetails?.data?.message || "Une erreur est survenue lors de la création du compte."}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Informations du compte</StepLabel>
          </Step>
          <Step>
            <StepLabel>Informations de paiement</StepLabel>
          </Step>
          <Step>
            <StepLabel>Lignes téléphoniques</StepLabel>
          </Step>
        </Stepper>
        
        {getStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={handlePrevStep}
          disabled={activeStep === 0}
          startIcon={<NavigateBeforeIcon />}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Précédent
        </Button>
        
        <Box>
          <Button
            onClick={handleClose}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Annuler
          </Button>
          
          {activeStep === 2 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ borderRadius: 2 }}
              startIcon={<CheckCircleIcon />}
              disabled={isSubmitting || isProcessing || isCreatingLine}
            >
              {isSubmitting || isProcessing ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {isProcessing ? "Création des lignes..." : "Création du compte..."}
                </>
              ) : "Finaliser"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextStep}
              disabled={!isStepValid(activeStep)}
              endIcon={<NavigateNextIcon />}
              sx={{ borderRadius: 2 }}
            >
              Suivant
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NewAccountDialog;