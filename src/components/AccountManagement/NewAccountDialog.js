import React, { useState } from 'react';
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
  Chip
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
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

const NewAccountDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  agencies = [], 
  clients = []
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Étape 1: Informations de compte
    name: '',
    email: '',
    password: '',
    agencyId: '',
    
    // Étape 2: Informations de paiement
    cardLastFour: '',
    cardExpiry: '',
    bankName: '',
    
    // Étape 3: Ligne(s) initiale(s)
    lines: []
  });

  // Pour l'étape 3: informations de la nouvelle ligne
  const [newLine, setNewLine] = useState({
    clientId: null,
    phoneNumber: '',
    status: 'NON ATTRIBUÉ'
  });
  
  const [selectedClient, setSelectedClient] = useState(null);

  // Liste des banques courantes en France
  const banks = [
    "Société Générale",
    "BNP Paribas",
    "Crédit Agricole",
    "Banque Populaire",
    "Caisse d'Épargne",
    "CIC",
    "LCL",
    "Crédit Mutuel",
    "BRED",
    "HSBC France",
    "La Banque Postale",
    "Boursorama Banque",
    "ING Direct",
    "Hello Bank!",
    "Fortuneo",
    "Monabanq",
    "N26"
  ];

  // Statuts possibles pour une ligne
  const lineStatuses = [
    "NON ATTRIBUÉ",
    "ACTIF",
    "BLOQUÉ",
    "PAUSE"
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
      status: client ? 'ACTIF' : 'NON ATTRIBUÉ'
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
      id: Date.now(), // Temporaire pour l'UI
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
      status: 'NON ATTRIBUÉ'
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

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      agencyId: '',
      cardLastFour: '',
      cardExpiry: '',
      bankName: '',
      lines: []
    });
    setActiveStep(0);
    setNewLine({
      clientId: null,
      phoneNumber: '',
      status: 'NON ATTRIBUÉ'
    });
    setSelectedClient(null);
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
          formData.name &&
          formData.email &&
          formData.password &&
          formData.agencyId
        );
      case 1: // Étape 2: Informations de paiement
        return (
          formData.cardLastFour.length === 4 &&
          formData.cardExpiry.length === 5 &&
          formData.bankName
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
                  <Autocomplete
                    fullWidth
                    options={agencies}
                    getOptionLabel={(option) => option.name}
                    value={agencies.find(a => a.id === parseInt(formData.agencyId)) || null}
                    onChange={(event, agency) => {
                      setFormData(prev => ({ ...prev, agencyId: agency ? agency.id.toString() : '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Agence"
                        error={activeStep > 0 && !formData.agencyId}
                        helperText={activeStep > 0 && !formData.agencyId ? "Ce champ est obligatoire" : ""}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <BusinessIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom du compte"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ex: ABDOU.CELINE"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    error={activeStep > 0 && !formData.name}
                    helperText={activeStep > 0 && !formData.name ? "Ce champ est obligatoire" : ""}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    error={activeStep > 0 && !formData.email}
                    helperText={activeStep > 0 && !formData.email ? "Ce champ est obligatoire" : ""}
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
          <Fade in={activeStep === 1} timeout={500}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Informations de paiement
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    options={banks}
                    value={formData.bankName || null}
                    onChange={(event, bank) => {
                      setFormData(prev => ({ ...prev, bankName: bank || '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Banque"
                        error={activeStep > 1 && !formData.bankName}
                        helperText={activeStep > 1 && !formData.bankName ? "Ce champ est obligatoire" : ""}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <BankIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
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
                
                {/* Visuel de la carte (simplifié) */}
                <Grid item xs={12}>
                  <Zoom in={formData.cardLastFour && formData.cardExpiry} timeout={500}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        mt: 2, 
                        bgcolor: 'primary.dark', 
                        color: 'white',
                        borderRadius: 2,
                        height: 180,
                        position: 'relative',
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                        <BankIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                      <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                          **** **** **** {formData.cardLastFour || '****'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {formData.bankName || 'BANQUE'}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {formData.cardExpiry || 'MM/YY'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Zoom>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      
      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ajouter des lignes (Optionnel)
              </Typography>
              <Divider sx={{ mb: 3 }} />

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
                        <FormControl fullWidth>
                          <InputLabel id="status-select-label">Statut</InputLabel>
                          <Select
                            labelId="status-select-label"
                            name="status"
                            value={newLine.status}
                            onChange={handleLineChange}
                            label="Statut"
                          >
                            {lineStatuses.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {newLine.status !== 'NON ATTRIBUÉ' && (
                        <Grid item xs={12}>
                          <Autocomplete
                            fullWidth
                            options={clients}
                            getOptionLabel={(option) => `${option.nom} ${option.prenom} (${option.telephone})`}
                            value={selectedClient}
                            onChange={handleClientChange}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                label="Client"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <InputAdornment position="start">
                                        <AccountCircleIcon color="primary" />
                                      </InputAdornment>
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        </Grid>
                      )}
                      
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
                          Lignes ajoutées ({formData.lines.length}/5)
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
            <Typography variant="h6">Nouveau Compte Rattaché</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
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
            >
              Finaliser
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