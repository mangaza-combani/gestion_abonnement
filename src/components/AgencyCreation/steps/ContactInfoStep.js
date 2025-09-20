import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  InputAdornment
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactMailIcon
} from '@mui/icons-material';

const ContactInfoStep = ({ formData, errors, onChange }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ContactMailIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Informations de contact
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Nom de l'agence et Numéro de téléphone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom de l'agence"
            value={formData.agencyName}
            onChange={onChange('agencyName')}
            error={!!errors.agencyName}
            helperText={errors.agencyName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Ex: Agence UWEZO Mamoudzou"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Numéro de téléphone"
            value={(() => {
              // Formater la valeur affichée
              const value = formData.phoneNumber || '';
              let formatted = '';
              for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 2 === 0) {
                  formatted += ' ';
                }
                formatted += value[i];
              }
              return formatted;
            })()}
            onChange={(e) => {
              const value = e.target.value;
              // Supprimer tous les caractères non numériques
              const numbersOnly = value.replace(/\D/g, '');
              // Limiter à 10 chiffres
              const limited = numbersOnly.slice(0, 10);

              // Créer un événement modifié pour passer la valeur non formatée
              const event = {
                target: {
                  value: limited // Stocker la valeur non formatée
                }
              };
              onChange('phoneNumber')(event);
            }}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="06 39 12 34 56"
          />
        </Grid>

        {/* Prénom du responsable */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prénom du responsable"
            value={formData.contactFirstName}
            onChange={onChange('contactFirstName')}
            error={!!errors.contactFirstName}
            helperText={errors.contactFirstName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Ex: Abdou"
          />
        </Grid>

        {/* Nom du responsable */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom du responsable"
            value={formData.contactLastName}
            onChange={onChange('contactLastName')}
            error={!!errors.contactLastName}
            helperText={errors.contactLastName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Ex: Mangaza"
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse complète"
            value={formData.address}
            onChange={onChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Ex: 15 Rue de la République, 97600 Mamoudzou, Mayotte"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactInfoStep;