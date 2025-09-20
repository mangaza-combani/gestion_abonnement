import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Stack,
  Alert,
  Paper,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation
} from '../../store/slices/companySettingsSlice';

const InvoiceSettings = () => {
  const theme = useTheme();

  // RTK Query hooks
  const { data: apiCompanySettings, isLoading, error, refetch } = useGetCompanySettingsQuery();
  const [updateCompanySettings, { isLoading: isUpdating }] = useUpdateCompanySettingsMutation();

  const [companySettings, setCompanySettings] = useState({
    companyName: 'UWEZO TELECOM',
    companyAddress: '123 Avenue de la République',
    companyCity: 'Moroni',
    companyPostalCode: '97600',
    companyCountry: 'Comores',
    companyPhone: '+269 773 12 34',
    companyEmail: 'contact@uwezo.com',
    companyWebsite: 'www.uwezo.com',
    companySiret: '12345678901234',
    companyTva: 'FR12345678901',
    companyLogo: null
  });

  const [preview, setPreview] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field) => (event) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target.result;
        setPreview(logoData);
        setCompanySettings(prev => ({
          ...prev,
          companyLogo: logoData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    setCompanySettings(prev => ({
      ...prev,
      companyLogo: null
    }));
  };

  const handleSave = async () => {
    try {
      setErrorMessage('');
      const result = await updateCompanySettings(companySettings).unwrap();
      setSaveMessage(result.message || 'Paramètres de facturation sauvegardés avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrorMessage(error.data?.message || 'Erreur lors de la sauvegarde des paramètres');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Charger les paramètres depuis l'API
  React.useEffect(() => {
    if (apiCompanySettings) {
      setCompanySettings({
        companyName: apiCompanySettings.companyName || 'UWEZO TELECOM',
        companyAddress: apiCompanySettings.companyAddress || '123 Avenue de la République',
        companyCity: apiCompanySettings.companyCity || 'Moroni',
        companyPostalCode: apiCompanySettings.companyPostalCode || '97600',
        companyCountry: apiCompanySettings.companyCountry || 'Comores',
        companyPhone: apiCompanySettings.companyPhone || '+269 773 12 34',
        companyEmail: apiCompanySettings.companyEmail || 'contact@uwezo.com',
        companyWebsite: apiCompanySettings.companyWebsite || 'www.uwezo.com',
        companySiret: apiCompanySettings.companySiret || '12345678901234',
        companyTva: apiCompanySettings.companyTva || 'FR12345678901',
        companyLogo: apiCompanySettings.companyLogo || null
      });

      if (apiCompanySettings.companyLogo) {
        setPreview(apiCompanySettings.companyLogo);
      }
    }
  }, [apiCompanySettings]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Chargement des paramètres...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erreur lors du chargement des paramètres: {error.data?.message || error.message}
        </Alert>
      )}

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Section Logo */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCameraIcon color="primary" />
                Logo de l'entreprise
              </Typography>
              
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {preview ? (
                  <Box>
                    <Avatar
                      src={preview}
                      variant="rounded"
                      sx={{
                        width: 150,
                        height: 150,
                        mx: 'auto',
                        mb: 2,
                        border: 2,
                        borderColor: 'divider'
                      }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadIcon />}
                        component="label"
                      >
                        Remplacer
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </Button>
                      <IconButton color="error" onClick={handleRemoveLogo}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ) : (
                  <Box>
                    <Avatar
                      sx={{
                        width: 150,
                        height: 150,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: theme.palette.grey[200],
                        border: 2,
                        borderColor: 'divider',
                        borderStyle: 'dashed'
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 60, color: theme.palette.grey[400] }} />
                    </Avatar>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      component="label"
                    >
                      Télécharger logo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </Button>
                  </Box>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Format recommandé : PNG ou JPG, taille maximum 2MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Informations entreprise */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Informations de l'entreprise
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    value={companySettings.companyName}
                    onChange={handleInputChange('companyName')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    value={companySettings.companyAddress}
                    onChange={handleInputChange('companyAddress')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ville"
                    value={companySettings.companyCity}
                    onChange={handleInputChange('companyCity')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Code postal"
                    value={companySettings.companyPostalCode}
                    onChange={handleInputChange('companyPostalCode')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pays"
                    value={companySettings.companyCountry}
                    onChange={handleInputChange('companyCountry')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={companySettings.companyPhone}
                    onChange={handleInputChange('companyPhone')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={companySettings.companyEmail}
                    onChange={handleInputChange('companyEmail')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Site web"
                    value={companySettings.companyWebsite}
                    onChange={handleInputChange('companyWebsite')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="SIRET"
                    value={companySettings.companySiret}
                    onChange={handleInputChange('companySiret')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Numéro de TVA"
                    value={companySettings.companyTva}
                    onChange={handleInputChange('companyTva')}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aperçu de la facture */}
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Aperçu de l'en-tête de facture
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                {preview && (
                  <img 
                    src={preview} 
                    alt="Logo" 
                    style={{ 
                      height: 60, 
                      width: 'auto', 
                      marginBottom: 16 
                    }} 
                  />
                )}
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {companySettings.companyName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {companySettings.companyAddress}
                </Typography>
                <Typography variant="body2">
                  {companySettings.companyCity} {companySettings.companyPostalCode}
                </Typography>
                <Typography variant="body2">
                  {companySettings.companyCountry}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tél: {companySettings.companyPhone}
                </Typography>
                <Typography variant="body2">
                  Email: {companySettings.companyEmail}
                </Typography>
                {companySettings.companyWebsite && (
                  <Typography variant="body2">
                    Web: {companySettings.companyWebsite}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  FACTURE
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  SIRET: {companySettings.companySiret}
                </Typography>
                <Typography variant="body2">
                  TVA: {companySettings.companyTva}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isUpdating || isLoading}
          sx={{ minWidth: 200 }}
        >
          {isUpdating ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceSettings;