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
  useTheme
} from '@mui/material';
import {
  Business as BusinessIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const InvoiceSettings = () => {
  const theme = useTheme();
  const [companySettings, setCompanySettings] = useState({
    companyName: 'UWEZO TELECOM',
    address: '123 Avenue de la République',
    city: 'Moroni',
    postalCode: '97600',
    country: 'Comores',
    phone: '+269 773 12 34',
    email: 'contact@uwezo.com',
    website: 'www.uwezo.com',
    siret: '12345678901234',
    tva: 'FR12345678901',
    logo: null
  });

  const [preview, setPreview] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

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
          logo: logoData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    setCompanySettings(prev => ({
      ...prev,
      logo: null
    }));
  };

  const handleSave = () => {
    // Ici on sauvegarderait les paramètres dans le localStorage ou API
    localStorage.setItem('invoiceSettings', JSON.stringify(companySettings));
    setSaveMessage('Paramètres de facturation sauvegardés avec succès !');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Charger les paramètres existants au montage du composant
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('invoiceSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setCompanySettings(parsed);
      if (parsed.logo) {
        setPreview(parsed.logo);
      }
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
        Paramètres de Facturation
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
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
                    value={companySettings.address}
                    onChange={handleInputChange('address')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ville"
                    value={companySettings.city}
                    onChange={handleInputChange('city')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Code postal"
                    value={companySettings.postalCode}
                    onChange={handleInputChange('postalCode')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pays"
                    value={companySettings.country}
                    onChange={handleInputChange('country')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={companySettings.phone}
                    onChange={handleInputChange('phone')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={companySettings.email}
                    onChange={handleInputChange('email')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Site web"
                    value={companySettings.website}
                    onChange={handleInputChange('website')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="SIRET"
                    value={companySettings.siret}
                    onChange={handleInputChange('siret')}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Numéro de TVA"
                    value={companySettings.tva}
                    onChange={handleInputChange('tva')}
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
                  {companySettings.address}
                </Typography>
                <Typography variant="body2">
                  {companySettings.city} {companySettings.postalCode}
                </Typography>
                <Typography variant="body2">
                  {companySettings.country}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tél: {companySettings.phone}
                </Typography>
                <Typography variant="body2">
                  Email: {companySettings.email}
                </Typography>
                {companySettings.website && (
                  <Typography variant="body2">
                    Web: {companySettings.website}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  FACTURE
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  SIRET: {companySettings.siret}
                </Typography>
                <Typography variant="body2">
                  TVA: {companySettings.tva}
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
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ minWidth: 200 }}
        >
          Enregistrer les paramètres
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceSettings;