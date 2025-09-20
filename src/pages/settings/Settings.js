import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import { 
  Save as SaveIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Import des composants de paramètres
import InvoiceSettings from '../../components/Settings/InvoiceSettings';
import InvoiceAutomationSettings from '../../components/Settings/InvoiceAutomationSettings';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box>
        <Typography variant="h4" gutterBottom>
          Paramètres Système
        </Typography>

        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label="Paramètres Généraux"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab 
              icon={<ReceiptIcon />} 
              label="Paramètres de Facturation" 
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Génération Automatique" 
              id="settings-tab-2"
              aria-controls="settings-tabpanel-2"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Onglet Paramètres Généraux */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Paramètres de Facturation
                  </Typography>
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Prix de Vente (€)"
                      defaultValue="19.00"
                      type="number"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Commission Agence (%)"
                      defaultValue="15.8"
                      type="number"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Prix Carte SIM (€)"
                      defaultValue="10.00"
                      type="number"
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{ mt: 2 }}
                    >
                      Enregistrer
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Paramètres de Notification
                  </Typography>
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Seuil d'Alerte Stock SIM"
                      defaultValue="10"
                      type="number"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Délai Relance Paiement (jours)"
                      defaultValue="5"
                      type="number"
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{ mt: 2 }}
                    >
                      Enregistrer
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Onglet Paramètres de Facturation */}
            <InvoiceSettings />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Onglet Génération Automatique */}
            <InvoiceAutomationSettings />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;