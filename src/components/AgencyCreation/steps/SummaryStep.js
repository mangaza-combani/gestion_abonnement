import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';

const SummaryStep = ({ formData }) => {
  const summaryItems = [
    {
      category: 'Informations de l\'agence',
      icon: <BusinessIcon color="primary" />,
      items: [
        { label: 'Nom de l\'agence', value: formData.agencyName, icon: <BusinessIcon /> },
        { label: 'Responsable', value: `${formData.contactFirstName} ${formData.contactLastName}`, icon: <PersonIcon /> },
        { label: 'Téléphone', value: formData.phoneNumber, icon: <PhoneIcon /> },
        { label: 'Adresse', value: formData.address, icon: <LocationIcon /> }
      ]
    },
    {
      category: 'Compte utilisateur',
      icon: <SecurityIcon color="primary" />,
      items: [
        { label: 'Adresse email', value: formData.email, icon: <EmailIcon /> },
        { label: 'Rôle', value: 'AGENCY', icon: <SecurityIcon />, isChip: true }
      ]
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SummarizeIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Récapitulatif
        </Typography>
      </Box>
      

      <Card variant="outlined" sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Agence
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
              {formData.agencyName}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Responsable
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
              {formData.contactFirstName} {formData.contactLastName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
              {formData.email}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Téléphone
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {(() => {
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
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Adresse
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formData.address}
            </Typography>
          </Grid>
        </Grid>
      </Card>

    </Box>
  );
};

export default SummaryStep;