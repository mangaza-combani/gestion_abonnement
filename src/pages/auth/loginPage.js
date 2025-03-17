import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, setCredentials } from '../../store/slices/authSlice';

// Données mockées pour la démonstration (à remplacer par l'appel API réel)
const mockUsers = [
  { username: 'supervisor', password: 'admin123', role: 'supervisor' },
  { 
    username: 'agence1', 
    password: 'agence123', 
    role: 'agency',
    agencyName: 'Agence Paris' 
  },
];

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifiant: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Utiliser le hook de mutation pour login
  const [login, { isLoading, error }] = useLoginMutation();

  // Mettez à jour le message d'erreur si l'API renvoie une erreur
  useEffect(() => {
    if (error) {
      setErrorMsg(error.data?.message || 'Erreur de connexion');
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // SOLUTION TEMPORAIRE : Utilise encore les utilisateurs mockés
    // Vous pouvez la garder pendant la phase de développement, puis passer à l'API réelle
    const user = mockUsers.find(
      (u) => u.username === formData.username && u.password === formData.password
    );

    // if (user) {
    //   // Créer les données que l'API renverrait normalement
    //   const mockApiResponse = {
    //     user: {
    //       username: user.username,
    //       agencyName: user.agencyName,
    //       role: user.role
    //     },
    //     token: 'mock-jwt-token-123456'
    //   };
      
    //   // Stocker les informations d'authentification dans Redux
    //   dispatch(setCredentials(mockApiResponse));
    //   navigate('/dashboard');
    // } else {
    //   setErrorMsg('Identifiants incorrects');
    // }

    
    // CODE POUR L'API RÉELLE (à décommenter quand l'API est prête)
    try {
      // Appel à l'API de login via RTK Query
      const userData = await login(formData).unwrap();
      
      // Stockage des identifiants dans le store Redux
      dispatch(setCredentials(userData));
      
      // Redirection
      navigate('/dashboard');
    } catch (err) {
      // Les erreurs seront traitées par le hook useEffect ci-dessus
    }
    
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Connexion
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Gestion des abonnements
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              name="identifiant"
              value={formData.identifiant}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;