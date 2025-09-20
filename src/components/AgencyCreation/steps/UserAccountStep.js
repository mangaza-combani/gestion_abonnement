import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

const UserAccountStep = ({ formData, errors, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: 'default' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { level: 1, text: 'Faible', color: 'error' };
      case 2:
      case 3:
        return { level: 2, text: 'Moyen', color: 'warning' };
      case 4:
      case 5:
        return { level: 3, text: 'Fort', color: 'success' };
      default:
        return { level: 0, text: '', color: 'default' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountCircleIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Compte utilisateur
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Ce compte permettra au responsable de l'agence de se connecter à la plateforme avec le rôle <strong>AGENCY</strong>.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Email */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse email"
            type="email"
            value={formData.email}
            onChange={onChange('email')}
            error={!!errors.email}
            helperText={errors.email || 'Cette adresse sera utilisée pour la connexion'}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Ex: abdou@agency.com"
          />
        </Grid>

        {/* Mot de passe */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={onChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Minimum 6 caractères"
          />
          
          {formData.password && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" color={passwordStrength.color} />
              <Chip 
                label={`Force: ${passwordStrength.text}`} 
                size="small" 
                color={passwordStrength.color}
                variant="outlined"
              />
            </Box>
          )}
        </Grid>

        {/* Confirmation mot de passe */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={onChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Confirmer le mot de passe"
          />
        </Grid>

      </Grid>
    </Box>
  );
};

export default UserAccountStep;