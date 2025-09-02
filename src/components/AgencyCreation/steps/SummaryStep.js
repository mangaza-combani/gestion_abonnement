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
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Vérifiez les informations ci-dessous avant de créer l'agence. Une fois créée, 
          l'agence recevra un email de bienvenue avec les informations de connexion.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {summaryItems.map((section, sectionIndex) => (
          <Grid item xs={12} key={sectionIndex}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {section.icon}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {section.category}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {React.cloneElement(item.icon, { 
                          fontSize: 'small', 
                          color: 'action' 
                        })}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: '120px' }}>
                              {item.label}:
                            </Typography>
                            {item.isChip ? (
                              <Chip 
                                label={item.value} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {item.value}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions à effectuer */}
      <Card variant="outlined" sx={{ mt: 3, bgcolor: 'success.50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'success.main' }}>
              Actions qui seront effectuées
            </Typography>
          </Box>
          
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Création de l'agence dans la base de données"
                secondary="L'agence sera enregistrée avec toutes les informations fournies"
              />
            </ListItem>
            
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Création du compte utilisateur AGENCY"
                secondary="Un compte avec le rôle AGENCY sera créé pour le responsable"
              />
            </ListItem>
            
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Association du compte à l'agence"
                secondary="Le compte utilisateur sera automatiquement lié à cette agence"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SummaryStep;