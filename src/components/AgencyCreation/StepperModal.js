import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import ContactInfoStep from './steps/ContactInfoStep';
import UserAccountStep from './steps/UserAccountStep';
import SummaryStep from './steps/SummaryStep';

const steps = [
  'Informations de contact',
  'Compte utilisateur',
  'Récapitulatif'
];

const AgencyCreationStepperModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Étape 1 - Informations contact
    agencyName: '',
    contactFirstName: '',
    contactLastName: '',
    phoneNumber: '',
    address: '',
    
    // Étape 2 - Compte utilisateur
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      agencyName: '',
      contactFirstName: '',
      contactLastName: '',
      phoneNumber: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Contact Info
        if (!formData.agencyName.trim()) {
          newErrors.agencyName = 'Le nom de l\'agence est obligatoire';
        }
        if (!formData.contactFirstName.trim()) {
          newErrors.contactFirstName = 'Le prénom est obligatoire';
        }
        if (!formData.contactLastName.trim()) {
          newErrors.contactLastName = 'Le nom est obligatoire';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Le numéro de téléphone est obligatoire';
        }
        if (!formData.address.trim()) {
          newErrors.address = 'L\'adresse est obligatoire';
        }
        break;
        
      case 1: // User Account
        if (!formData.email.trim()) {
          newErrors.email = 'L\'email est obligatoire';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Format d\'email invalide';
        }
        if (!formData.password.trim()) {
          newErrors.password = 'Le mot de passe est obligatoire';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep(1)) { // Validate all steps
      const submitData = {
        name: formData.agencyName,
        contactFirstName: formData.contactFirstName,
        contactLastName: formData.contactLastName,
        phone: formData.phoneNumber,
        address: formData.address,
        email: formData.email,
        password: formData.password
      };
      
      onSubmit(submitData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ContactInfoStep
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
        );
      case 1:
        return (
          <UserAccountStep
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
        );
      case 2:
        return (
          <SummaryStep
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Créer une nouvelle agence
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: 3, mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Annuler
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Précédent
          </Button>
        )}
        
        {!isLastStep ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Création...' : 'Créer l\'agence'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AgencyCreationStepperModal;