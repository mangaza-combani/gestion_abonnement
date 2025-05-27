// src/components/UserManagement/NewUserDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const NewUserDialog = ({ open, onClose, onSubmit, agencies }) => {
  const [userData, setUserData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    city: '',
    email: '',
    birthdate: '',
    role: 'CLIENT',
    agency: '',
    password: 'wezo976',
    telephone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validation des champs obligatoires
    if (!userData.username || !userData.email || !userData.agency || !userData.role || !userData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSubmit(userData);
    // Réinitialiser le formulaire
    setUserData({
      username: '',
      firstname: '',
      lastname: '',
      city: '',
      email: '',
      birthdate: '',
      role: 'CLIENT',
      agency: '',
      password: 'wezo976',
      telephone: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Réinitialiser le formulaire
    setUserData({
      username: '',
      firstname: '',
      lastname: '',
      city: '',
      email: '',
      birthdate: '',
      role: 'CLIENT',
      agency: '',
      password: 'wezo976',
      telephone: '',
    });
  };

  return (
      <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
      >
        <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Nom d'utilisateur*"
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Email*"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Prénom"
                  name="firstname"
                  value={userData.firstname}
                  onChange={handleInputChange}
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Nom"
                  name="lastname"
                  value={userData.lastname}
                  onChange={handleInputChange}
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Ville"
                  name="city"
                  value={userData.city}
                  onChange={handleInputChange}
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Date de naissance"
                  name="birthdate"
                  type="date"
                  value={userData.birthdate}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={userData.telephone}
                  onChange={handleInputChange}
                  variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  select
                  label="Rôle*"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
              >
                <MenuItem value="Agence">Agence</MenuItem>
                <MenuItem value="CLIENT">Client</MenuItem>
                <MenuItem value="ADMIN">Collaborateur (Admin)</MenuItem>
                <MenuItem value="SUPERVISEUR">Manager (Superviseur)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  select
                  label="Agence*"
                  name="agency"
                  value={userData.agency}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
              >
                {agencies?.map((agency) => (
                    <MenuItem key={agency.id} value={agency.name}>
                      {agency.name}
                    </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  label="Mot de passe*"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={userData.password}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                    )
                  }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Annuler
          </Button>
          <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default NewUserDialog;