import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const InvoiceAutomationSettings = () => {
  const [settings, setSettings] = useState({
    invoiceGenerationDay: 20,
    autoInvoiceGenerationEnabled: true,
    invoiceGenerationTimezone: 'UTC'
  });
  
  const [generationStatus, setGenerationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  
  // États pour la génération sélective
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loadingClients, setLoadingClients] = useState(false);
  
  const authToken = localStorage.getItem('token');
  // Import de la configuration centralisée
  const API_CONFIG = require('../../config/api.js').default;
  const apiBaseURL = API_CONFIG.SERVER_URL;

  // Options de fuseaux horaires
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Temps universel)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (France)' },
    { value: 'Indian/Comoro', label: 'Indian/Comoro (Comores)' },
    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (Afrique de l\'Est)' },
    { value: 'Indian/Mauritius', label: 'Indian/Mauritius (Maurice)' }
  ];

  // Charger les paramètres existants
  useEffect(() => {
    fetchSettings();
    fetchGenerationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseURL}/api/system-settings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const systemSettings = data[0]; // Premier paramètre trouvé
          setSettings({
            invoiceGenerationDay: systemSettings.invoiceGenerationDay || 20,
            autoInvoiceGenerationEnabled: systemSettings.autoInvoiceGenerationEnabled ?? true,
            invoiceGenerationTimezone: systemSettings.invoiceGenerationTimezone || 'UTC'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setError('Erreur lors du chargement des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenerationStatus = async () => {
    try {
      const response = await fetch(`${apiBaseURL}/api/invoice-automation/status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGenerationStatus(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'autoInvoiceGenerationEnabled' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${apiBaseURL}/api/system-settings/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceGenerationDay: parseInt(settings.invoiceGenerationDay),
          autoInvoiceGenerationEnabled: settings.autoInvoiceGenerationEnabled,
          invoiceGenerationTimezone: settings.invoiceGenerationTimezone
        })
      });
      
      if (response.ok) {
        setSaveMessage('Paramètres de génération automatique sauvegardés avec succès !');
        setTimeout(() => setSaveMessage(''), 3000);
        // Recharger le statut après sauvegarde
        await fetchGenerationStatus();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleManualGeneration = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseURL}/api/invoice-automation/generate/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSaveMessage(`Génération manuelle terminée : ${result.summary?.invoicesGenerated || 0} factures générées`);
        setTimeout(() => setSaveMessage(''), 5000);
      } else {
        throw new Error('Erreur lors de la génération manuelle');
      }
    } catch (error) {
      console.error('Erreur génération manuelle:', error);
      setError('Erreur lors de la génération manuelle');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer tous les clients avec leurs téléphones
  const fetchAllClients = async (monthOverride = null) => {
    try {
      setLoadingClients(true);
      const monthToUse = monthOverride || selectedMonth;
      console.log('🔍 Frontend DEBUG - fetchAllClients appelée avec:', { monthOverride, selectedMonth, monthToUse });
      const url = monthToUse 
        ? `${apiBaseURL}/api/invoice-automation/all-clients?month=${monthToUse}`
        : `${apiBaseURL}/api/invoice-automation/all-clients`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableClients(data.clients || []);
        setSelectedClients([]);
      } else {
        throw new Error('Erreur lors de la récupération des clients');
      }
    } catch (error) {
      console.error('Erreur récupération clients:', error);
      setError('Erreur lors de la récupération des clients');
      setAvailableClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fonction pour gérer le changement de mois
  const handleMonthChange = (event) => {
    const month = event.target.value;
    console.log('🔍 Frontend DEBUG - handleMonthChange:', month);
    setSelectedMonth(month);
    if (month) {
      fetchAllClients(month); // Passer le mois directement
    } else {
      setAvailableClients([]);
      setSelectedClients([]);
    }
  };

  // Fonction pour gérer la sélection/désélection de téléphones
  const handleClientToggle = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Fonction pour sélectionner/désélectionner tous les téléphones
  const handleSelectAllClients = () => {
    if (selectedClients.length === availableClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(availableClients.map(client => client.clientId));
    }
  };

  // Fonction pour générer les factures sélectives
  const handleSelectiveGeneration = async () => {
    console.log('🔄 handleSelectiveGeneration appelée');
    console.log('📅 selectedMonth:', selectedMonth);
    console.log('👥 selectedClients:', selectedClients);
    console.log('📊 selectedClients.length:', selectedClients.length);
    
    if (!selectedMonth || selectedClients.length === 0) {
      console.log('❌ Validation échouée - mois ou clients manquants');
      setError('Veuillez sélectionner un mois et au moins un client');
      return;
    }
    
    console.log('✅ Validation réussie, démarrage de la requête');

    try {
      console.log('🔄 setLoading(true)');
      setLoading(true);
      
      console.log('📡 Préparation de la requête fetch');
      console.log('🌐 apiBaseURL:', apiBaseURL);
      console.log('🔑 authToken:', authToken ? 'présent' : 'manquant');
      
      const requestBody = {
        month: selectedMonth,
        clientIds: selectedClients
      };
      console.log('📦 Body de la requête:', requestBody);
      
      console.log('🚀 Envoi de la requête fetch...');
      const response = await fetch(`${apiBaseURL}/api/invoice-automation/generate/selective`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 Réponse reçue:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        setSaveMessage(`Génération sélective terminée : ${result.summary?.invoicesGenerated || 0} factures générées pour ${selectedClients.length} clients`);
        setTimeout(() => setSaveMessage(''), 5000);
        
        // Rafraîchir la liste des clients disponibles
        if (selectedMonth) {
          fetchAllClients();
        }
      } else {
        throw new Error('Erreur lors de la génération sélective');
      }
    } catch (error) {
      console.error('Erreur génération sélective:', error);
      setError('Erreur lors de la génération sélective des factures');
    } finally {
      setLoading(false);
    }
  };

  // Générer des options de mois (12 derniers mois et 3 prochains mois)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    // 3 prochains mois
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (loading && !generationStatus) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
        Génération Automatique des Factures
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuration */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Configuration
              </Typography>
              
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Activation de la génération automatique
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Switch
                      checked={settings.autoInvoiceGenerationEnabled}
                      onChange={handleInputChange('autoInvoiceGenerationEnabled')}
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {settings.autoInvoiceGenerationEnabled ? 'Activé' : 'Désactivé'}
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="Jour de génération (1-28)"
                  value={settings.invoiceGenerationDay}
                  onChange={handleInputChange('invoiceGenerationDay')}
                  inputProps={{ min: 1, max: 28 }}
                  helperText="Jour du mois où les factures seront générées automatiquement"
                  disabled={!settings.autoInvoiceGenerationEnabled}
                />

                <FormControl fullWidth disabled={!settings.autoInvoiceGenerationEnabled}>
                  <InputLabel>Fuseau horaire</InputLabel>
                  <Select
                    value={settings.invoiceGenerationTimezone}
                    label="Fuseau horaire"
                    onChange={handleInputChange('invoiceGenerationTimezone')}
                  >
                    {timezoneOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statut */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                Statut Actuel
              </Typography>
              
              {generationStatus ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Configuration
                    </Typography>
                    <Chip 
                      label={generationStatus.configured ? 'Configuré' : 'Non configuré'}
                      color={generationStatus.configured ? 'success' : 'error'}
                      icon={generationStatus.configured ? <CheckCircleIcon /> : <WarningIcon />}
                    />
                  </Box>

                  {generationStatus.configured && generationStatus.settings && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Génération automatique
                        </Typography>
                        <Chip 
                          label={generationStatus.settings.enabled ? 'Activée' : 'Désactivée'}
                          color={generationStatus.settings.enabled ? 'success' : 'default'}
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Jour configuré
                        </Typography>
                        <Typography variant="body1">
                          {generationStatus.settings.generationDay} de chaque mois
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fuseau horaire
                        </Typography>
                        <Typography variant="body1">
                          {generationStatus.settings.timezone}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Prochaine génération
                        </Typography>
                        <Typography variant="body1">
                          {generationStatus.settings.nextGeneration}
                        </Typography>
                      </Box>

                      {generationStatus.status && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date actuelle
                          </Typography>
                          <Typography variant="body1">
                            {generationStatus.status.currentDate}
                          </Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Peut générer aujourd'hui
                        </Typography>
                        <Chip 
                          label={generationStatus.settings.canGenerateToday ? 'Oui' : 'Non'}
                          color={generationStatus.settings.canGenerateToday ? 'success' : 'default'}
                        />
                        {generationStatus.settings.todayReason && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {generationStatus.settings.todayReason}
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Stack>
              ) : (
                <CircularProgress size={24} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test et Génération Manuelle */}
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test et Génération Manuelle
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Génération Complète" icon={<PlayArrowIcon />} />
            <Tab label="Génération Sélective" icon={<FilterIcon />} />
          </Tabs>
          
          {/* Onglet 1: Génération complète */}
          {tabValue === 0 && (
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body1" paragraph>
                Vous pouvez déclencher manuellement la génération des factures pour tester le système 
                ou pour générer les factures en dehors du planning automatique.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Note :</strong> La génération manuelle bypass la vérification du jour configuré 
                  et génère les factures pour toutes les lignes actives immédiatement.
                </Typography>
              </Alert>

              <Button
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                onClick={handleManualGeneration}
                disabled={loading}
                color="primary"
              >
                {loading ? 'Génération en cours...' : 'Déclencher génération manuelle'}
              </Button>
            </Paper>
          )}
          
          {/* Onglet 2: Génération sélective */}
          {tabValue === 1 && (
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body1" paragraph>
                Générez des factures pour un mois spécifique et des clients sélectionnés. 
                Cette fonctionnalité empêche la création de factures en double.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Mois de facturation</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Mois de facturation"
                      onChange={handleMonthChange}
                      startAdornment={<CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="">
                        <em>Sélectionner un mois</em>
                      </MenuItem>
                      {generateMonthOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {selectedMonth && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Clients disponibles ({availableClients.length})
                      </Typography>
                      {loadingClients ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip 
                          label={`${selectedClients.length} sélectionné(s)`} 
                          color={selectedClients.length > 0 ? 'primary' : 'default'}
                        />
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
              
              {availableClients.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedClients.length === availableClients.length}
                          indeterminate={selectedClients.length > 0 && selectedClients.length < availableClients.length}
                          onChange={handleSelectAllClients}
                        />
                      }
                      label={`Sélectionner tous (${availableClients.length})`}
                    />
                  </Box>
                  
                  {/* Autocomplete pour la recherche rapide */}
                  <Box sx={{ mb: 2 }}>
                    <Autocomplete
                      multiple
                      options={availableClients}
                      getOptionLabel={(option) => `${option.clientName || ''} (${option.clientEmail || ''})`}
                      value={availableClients.filter(client => selectedClients.includes(client.clientId))}
                      onChange={(event, newValue) => {
                        setSelectedClients(newValue.map(client => client.clientId));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rechercher et sélectionner des clients"
                          placeholder="Tapez pour rechercher un client..."
                        />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props} key={option.clientId}>
                          <Box component="span" sx={{ mr: 1, fontSize: 16 }}>
                            {selected ? '✓' : '○'}
                          </Box>
                          <Box>
                            <Typography variant="body2">
                              <strong>{option.clientName || ''}</strong>
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.clientEmail || ''} | {option.phoneNumber || 'Pas de numéro'} | {option.phonesCount || 0} ligne(s)
                            </Typography>
                          </Box>
                        </li>
                      )}
                      filterOptions={(options, { inputValue }) => {
                        if (!inputValue) return options;
                        const filtered = options.filter(option => {
                          const clientName = (option.clientName || '').toLowerCase();
                          const email = (option.clientEmail || '').toLowerCase();
                          const phoneNumber = (option.phoneNumber || '').toLowerCase();
                          const searchTerm = inputValue.toLowerCase();
                          return clientName.includes(searchTerm) || 
                                 email.includes(searchTerm) || 
                                 phoneNumber.includes(searchTerm);
                        });
                        return filtered;
                      }}
                    />
                  </Box>
                  
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {availableClients.map((client) => (
                        <ListItem
                          key={client.clientId}
                          component="div"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleClientToggle(client.clientId)}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedClients.includes(client.clientId)}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon color="action" />
                                <Typography variant="body2" component="span">
                                  {client.clientName} - {client.phoneNumber}
                                  {client.phoneStatus && (
                                    <Chip 
                                      label={client.phoneStatus === 'NO_PHONE' ? 'Aucune ligne' : client.phoneStatus}
                                      size="small" 
                                      color={client.phoneStatus === 'ACTIVE' ? 'success' : client.phoneStatus === 'NO_PHONE' ? 'default' : 'warning'}
                                      sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                                    />
                                  )}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                Email: {client.clientEmail} | Solde: {client.balance.toFixed(2)}€ | Abonnement: {client.subscriptionName} ({client.totalMonthly.toFixed(2)}€/mois)
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
              
              {selectedMonth && availableClients.length === 0 && !loadingClients && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Tous les clients ont déjà une facture pour ce mois !
                </Alert>
              )}
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleSelectiveGeneration}
                  disabled={loading || !selectedMonth || selectedClients.length === 0}
                  color="primary"
                >
                  {loading ? 'Génération...' : `Générer ${selectedClients.length} facture(s)`}
                </Button>
                
                {selectedClients.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedClients([])}
                    disabled={loading}
                  >
                    Désélectionner tout
                  </Button>
                )}
              </Stack>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceAutomationSettings;