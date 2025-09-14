import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  ContactPhone as ContactPhoneIcon,
  SimCard as SimCardIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
  History as HistoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import de la mutation depuis redAccountsSlice
import { useCreateLineMutation, LINE_STATUSES } from '../../store/slices/redAccountsSlice';

const NewLineDialog = ({ open, onClose, onSubmit, accountId, clients = [], simplifiedMode = false }) => {
  // Utilisation de la mutation de redAccountsSlice
  const [createLine, { isLoading: isCreatingLine, isError, error }] = useCreateLineMutation();

  const [formData, setFormData] = useState({
    clientId: '',
    phoneNumber: '',
    simCardId: '',
    assignSimNow: false,
    assignToClient: false,
    orderDate: new Date().toISOString().split('T')[0], // Date du jour par défaut
    trackingNotes: '',
    isHistoricalLine: false, // Mode ligne historique (forcé à false en mode simplifié)
    skipOrderTracking: false // Ignorer le suivi de commande
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked,
      // Logique spéciale pour les modes
      ...(name === 'assignSimNow' && checked && {
        skipOrderTracking: true, // Si on assigne une SIM maintenant, on peut ignorer le suivi
        orderDate: null
      }),
      ...(name === 'assignSimNow' && !checked && {
        skipOrderTracking: false,
        orderDate: new Date().toISOString().split('T')[0]
      }),
      ...(name === 'isHistoricalLine' && checked && {
        skipOrderTracking: true,
        orderDate: null
      }),
      ...(name === 'isHistoricalLine' && !checked && {
        skipOrderTracking: false,
        orderDate: new Date().toISOString().split('T')[0]
      })
    }));
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    // Vérifier la validité seulement si on a au moins 2 chiffres
    if (value.length >= 2) {
      const prefix = value.slice(0, 2);
      // Rejeter seulement si ce n'est pas un préfixe français valide
      if (!['01', '02', '03', '04', '05', '06', '07', '09'].includes(prefix)) {
        // Si on a déjà une valeur existante, garder seulement le premier chiffre
        if (formData.phoneNumber) {
          value = formData.phoneNumber.replace(/\D/g, '').slice(0, 1) + value.slice(-1);
        }
      }
    }
    
    // Format as 0X XX XX XX XX
    let formattedValue = value;
    if (value.length > 2) formattedValue = value.slice(0, 2) + ' ' + value.slice(2);
    if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5) + ' ' + formattedValue.slice(5);
    if (formattedValue.length > 8) formattedValue = formattedValue.slice(0, 8) + ' ' + formattedValue.slice(8);
    
    setFormData(prev => ({ ...prev, phoneNumber: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountId) {
      console.error("ID de compte manquant pour créer une ligne");
      if (window.showNotification) {
        window.showNotification('Erreur : Aucun compte RED sélectionné', 'error');
      }
      return;
    }

    // Validation côté frontend
    const phoneNumberClean = formData.phoneNumber.replace(/\s/g, '');
    if (!phoneNumberClean || phoneNumberClean.length < 10) {
      if (window.showNotification) {
        window.showNotification('Le numéro de téléphone doit contenir au moins 10 chiffres', 'error');
      }
      return;
    }

    if (formData.assignToClient && !formData.clientId) {
      if (window.showNotification) {
        window.showNotification('Veuillez sélectionner un client', 'error');
      }
      return;
    }

    if (formData.assignSimNow && (!formData.simCardId || formData.simCardId.length < 15)) {
      if (window.showNotification) {
        window.showNotification('Veuillez saisir un ICCID valide (minimum 15 caractères)', 'error');
      }
      return;
    }
    
    // Déterminer le statut approprié
    let status = formData.assignToClient ? LINE_STATUSES.ATTRIBUTED : LINE_STATUSES.UNATTRIBUTED;
    
    // Création de l'objet pour l'API
    const lineData = {
      phoneNumber: formData.phoneNumber.replace(/\s/g, ''), // Supprimer les espaces
      clientId: formData.assignToClient ? formData.clientId : null,
      simCardId: formData.assignSimNow ? formData.simCardId : null,
      orderDate: formData.skipOrderTracking ? null : (formData.orderDate || null),
      trackingNotes: formData.trackingNotes.trim() || null,
      isHistoricalLine: formData.isHistoricalLine,
      skipOrderTracking: formData.skipOrderTracking,
      status
    };

    try {
      // Utilisation de la mutation du redAccountsSlice
      console.log("Tentative de création de ligne:", { accountId, lineData });
      
      const result = await createLine({
        accountId,
        lineData
      }).unwrap();

      console.log("Ligne créée avec succès:", result);

      // Appel du callback onSubmit
      if (onSubmit) {
        onSubmit({ 
          ...result, // Utiliser les données de la réponse de l'API
          accountId
        });
      }
      
      resetForm();
      onClose();
      
      // Notification de succès
      if (window.showNotification) {
        window.showNotification('Ligne créée avec succès !', 'success');
      }
      
    } catch (err) {
      console.error("Erreur lors de la création de la ligne:", err);
      console.log("Détails de l'erreur:", {
        status: err?.status,
        data: err?.data,
        originalStatus: err?.originalStatus,
        error: err?.error
      });
      
      // Gestion spécifique des erreurs selon le code
      let userMessage = "Une erreur inconnue est survenue.";
      
      if (err?.data?.error === 'PHONE_NUMBER_EXISTS') {
        userMessage = `Le numéro ${formData.phoneNumber} est déjà enregistré. Veuillez choisir un autre numéro.`;
      } else if (err?.data?.error === 'MISSING_PHONE_NUMBER') {
        userMessage = "Veuillez saisir un numéro de téléphone.";
      } else if (err?.data?.error === 'RED_ACCOUNT_NOT_FOUND') {
        userMessage = "Le compte RED sélectionné n'existe pas.";
      } else if (err?.data?.error === 'USER_NOT_FOUND') {
        userMessage = "Le client sélectionné n'existe pas.";
      } else if (err?.data?.error === 'UNAUTHORIZED') {
        userMessage = "Vous devez être connecté pour effectuer cette action.";
      } else if (err?.data?.error === 'FORBIDDEN') {
        userMessage = "Vous n'avez pas les permissions nécessaires.";
      }
      
      // Affichage d'une notification toast si disponible
      if (window.showNotification) {
        window.showNotification(userMessage, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      phoneNumber: '',
      simCardId: '',
      assignSimNow: false,
      assignToClient: false,
      orderDate: new Date().toISOString().split('T')[0],
      trackingNotes: '',
      isHistoricalLine: false,
      skipOrderTracking: false
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    if (!formData.phoneNumber) return false;
    if (formData.assignToClient && !formData.clientId) return false;
    return !(formData.assignSimNow && !formData.simCardId);

  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon />
            <Typography variant="h6">Nouvelle Ligne</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {isError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                error?.data?.details?.phoneNumber && (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => setFormData(prev => ({ ...prev, phoneNumber: '' }))}
                  >
                    Effacer
                  </Button>
                )
              }
            >
              <strong>
                {error?.data?.error === 'PHONE_NUMBER_EXISTS' ? 'Numéro déjà utilisé' :
                 error?.data?.error === 'MISSING_PHONE_NUMBER' ? 'Numéro manquant' :
                 error?.data?.error === 'RED_ACCOUNT_NOT_FOUND' ? 'Compte RED introuvable' :
                 error?.data?.error === 'USER_NOT_FOUND' ? 'Client introuvable' :
                 error?.data?.error === 'UNAUTHORIZED' ? 'Non autorisé' :
                 error?.data?.error === 'FORBIDDEN' ? 'Permissions insuffisantes' :
                 'Erreur'}
              </strong>
              <br />
              {error?.data?.message || "Une erreur est survenue lors de la création de la ligne."}
              
              {error?.data?.details && (
                <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {Object.entries(error.data.details).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </Box>
              )}
            </Alert>
          )}
          
          <Grid container spacing={3}>

            {!simplifiedMode && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isHistoricalLine}
                      onChange={handleSwitchChange}
                      name="isHistoricalLine"
                      color="secondary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <HistoryIcon color={formData.isHistoricalLine ? "secondary" : "disabled"} />
                      <Typography>
                        Mode ligne historique (données d'avant le système)
                      </Typography>
                    </Box>
                  }
                />
                {formData.isHistoricalLine && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Mode historique activé : La date de commande et le suivi ne seront pas requis.
                    </Typography>
                  </Alert>
                )}
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Numéro de téléphone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="06 XX XX XX XX"
                helperText="Format français: 06/07 (mobile) ou 01/02/03/04/05/09 (fixe)"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                  )
                }}
              />
            </Grid>

            {!formData.skipOrderTracking && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de commande sur RED BY"
                  name="orderDate"
                  value={formData.orderDate || ''}
                  onChange={handleChange}
                  helperText={
                    formData.assignSimNow 
                      ? "Optionnel - La ligne a déjà une carte SIM" 
                      : "Date à laquelle la ligne a été commandée (utilisée pour estimer la livraison)"
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                    )
                  }}
                />
                {formData.assignSimNow && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Carte SIM assignée immédiatement - Le suivi de commande est optionnel
                    </Typography>
                  </Alert>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={formData.isHistoricalLine ? "Notes sur cette ligne historique" : "Notes de suivi (optionnel)"}
                name="trackingNotes"
                value={formData.trackingNotes}
                onChange={handleChange}
                placeholder={
                  formData.isHistoricalLine 
                    ? "Informations sur cette ligne existante..." 
                    : "Notes sur la commande, remarques particulières..."
                }
                helperText={
                  formData.isHistoricalLine 
                    ? "Informations utiles sur cette ligne d'avant le système" 
                    : "Informations utiles pour le suivi de cette ligne"
                }
                InputProps={{
                  startAdornment: (
                    <NotesIcon color="primary" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            {!simplifiedMode && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.assignToClient}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          assignToClient: e.target.checked,
                          clientId: e.target.checked ? prev.clientId : ''
                        }));
                      }}
                      name="assignToClient"
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <ContactPhoneIcon color={formData.assignToClient ? "primary" : "disabled"} />
                      <Typography>Attribuer à un client</Typography>
                    </Box>
                  }
                />
              </Grid>
            )}

            {!simplifiedMode && formData.assignToClient && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="client-select-label">Client</InputLabel>
                  <Select
                    labelId="client-select-label"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    label="Client"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.firstname} {client.lastname} - {client.phoneNumber || "N° non défini"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            {!simplifiedMode && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.assignSimNow}
                      onChange={handleSwitchChange}
                      name="assignSimNow"
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <SimCardIcon color={formData.assignSimNow ? "primary" : "disabled"} />
                      <Typography>Attribuer une carte SIM maintenant</Typography>
                    </Box>
                  }
                />
              </Grid>
            )}

            {!simplifiedMode && formData.assignSimNow && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required={formData.assignSimNow}
                  label="ICCID Carte SIM"
                  name="simCardId"
                  value={formData.simCardId}
                  onChange={handleChange}
                  helperText="Entrez l'ICCID de la carte SIM à associer"
                />
              </Grid>
            )}

            {!simplifiedMode && !formData.assignSimNow && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<SimCardIcon />}>
                  Vous pourrez attribuer une carte SIM ultérieurement.
                </Alert>
              </Grid>
            )}

            {simplifiedMode && (
              <Grid item xs={12}>
                <Alert severity="success" icon={<InfoIcon />}>
                  Mode création simple : La ligne sera créée sans attribution client ni carte SIM.
                  Vous pourrez les attribuer ultérieurement depuis l'interface de gestion.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isCreatingLine || !isFormValid()}
            sx={{ borderRadius: 2 }}
            startIcon={isCreatingLine ? <CircularProgress size={20} /> : null}
          >
            {isCreatingLine ? 'Création...' : 'Ajouter la ligne'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewLineDialog;