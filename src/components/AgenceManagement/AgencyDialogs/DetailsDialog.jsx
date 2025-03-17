// src/components/agencies/AgencyDialogs/DetailsDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  SpeedDial as SpeedDialIcon
} from '@mui/icons-material';
import AgencyCollaborators from '../AgencyDetails/AgencyCollaborators';
import AgencyClients from '../AgencyDetails/AgencyClients';
import AgencyStats from '../AgencyDetails/AgencyStats';

const DetailsDialog = ({ agency, open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!agency) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Détails de l'agence
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar 
              sx={{ 
                bgcolor: agency.status === 'active' ? 'success.main' : 'grey.500',
                width: 64,
                height: 64
              }}
            >
              {agency.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {agency.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={agency.status === 'active' ? 'Actif' : 'Inactif'} 
                  color={agency.status === 'active' ? "success" : "default"} 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  {agency.email} • {agency.phone}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Informations" />
            <Tab label="Collaborateurs" />
            <Tab label="Clients" />
          </Tabs>

          {/* Onglet d'informations */}
          {tabValue === 0 && (
            <AgencyStats agency={agency} />
          )}

          {/* Onglet de collaborateurs */}
          {tabValue === 1 && (
            <AgencyCollaborators collaborators={agency.collaborators} />
          )}

          {/* Onglet de clients */}
          {tabValue === 2 && (
            <AgencyClients clients={agency.clients} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;