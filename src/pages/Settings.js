import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import InvoiceSettings from '../components/Settings/InvoiceSettings';
import InvoiceAutomationSettings from '../components/Settings/InvoiceAutomationSettings';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const Settings = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', boxShadow: 1, mb: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 2 }}>
          <Typography variant="h4" gutterBottom>
            Paramètres du Système
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configurez les paramètres généraux de l'application
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ px: 3 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Entreprise"
              icon={<BusinessIcon />}
              iconPosition="start"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab 
              label="Sécurité" 
              icon={<SecurityIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab 
              label="Notifications" 
              icon={<NotificationsIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab 
              label="Génération Auto" 
              icon={<ScheduleIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <TabPanel value={currentTab} index={0}>
          <InvoiceSettings />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Paramètres Sécurité
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section sera développée prochainement
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Paramètres Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section sera développée prochainement
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <InvoiceAutomationSettings />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Settings;