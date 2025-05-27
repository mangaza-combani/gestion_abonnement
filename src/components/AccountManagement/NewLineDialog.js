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
  SimCard as SimCardIcon
} from '@mui/icons-material';

// Import de la mutation depuis redAccountsSlice
import { useCreateLineMutation, LINE_STATUSES } from '../../store/slices/redAccountsSlice';

const NewLineDialog = ({ open, onClose, onSubmit, accountId, clients = [] }) => {
  // Utilisation de la mutation de redAccountsSlice
  const [createLine, { isLoading: isCreatingLine, isError, error }] = useCreateLineMutation();

  const [formData, setFormData] = useState({
    clientId: '',
    phoneNumber: '',
    simCardId: '',
    assignSimNow: false,
    assignToClient: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    // Format as 06XX XX XX XX
    if (value.length > 2) value = value.slice(0, 2) + ' ' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + ' ' + value.slice(5);
    if (value.length > 8) value = value.slice(0, 8) + ' ' + value.slice(8);
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountId) {
      console.error("ID de compte manquant pour créer une ligne");
      return;
    }
    
    // Déterminer le statut approprié
    let status = formData.assignToClient ? LINE_STATUSES.ATTRIBUTED : LINE_STATUSES.UNATTRIBUTED;
    
    // Création de l'objet pour l'API
    const lineData = {
      phoneNumber: formData.phoneNumber.replace(/\s/g, ''), // Supprimer les espaces
      clientId: formData.assignToClient ? formData.clientId : null,
      simCardId: formData.assignSimNow ? formData.simCardId : null,
      status
    };

    try {
      // Utilisation de la mutation du redAccountsSlice
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
    } catch (err) {
      console.error("Erreur lors de la création de la ligne:", err);
      // Vous pourriez ajouter ici une gestion d'erreur supplémentaire si nécessaire
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      phoneNumber: '',
      simCardId: '',
      assignSimNow: false,
      assignToClient: false
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
            >
              {error?.data?.message || "Une erreur est survenue lors de la création de la ligne."}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Numéro de téléphone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="06XX XX XX XX"
                helperText="Format: 06XX XX XX XX"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
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

            {formData.assignToClient && (
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
                        {client.nom} {client.prenom} - {client.telephone || "N° non défini"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
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
            
            {formData.assignSimNow && (
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
            
            {!formData.assignSimNow && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<SimCardIcon />}>
                  Vous pourrez attribuer une carte SIM ultérieurement.
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