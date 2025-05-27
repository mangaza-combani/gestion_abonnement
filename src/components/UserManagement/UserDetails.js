import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Stack, 
  Button,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Switch,
  Paper,
  Divider,
  Fade,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Badge as BadgeIcon,
  VpnKey as KeyIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import {useGetAgenciesQuery} from "../../store/slices/agencySlice";

// Boîte d'information pour afficher une paire clé-valeur
const InfoBox = ({ icon, label, value, iconBgColor = "primary.light" }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        py: 1.5,
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 1,
        },
        transition: 'all 0.2s'
      }}
    >
      <Box sx={{ 
        p: 1.5, 
        borderRadius: '12px', 
        bgcolor: theme?.palette ? alpha(theme.palette[iconBgColor] || '#f0f0f0', 0.1) : '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 42,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 500,
            fontSize: '0.7rem'
          }}
        >
          {label}
        </Typography>
        <Typography 
          variant="body1" 
          fontWeight="500"
          sx={{ marginTop: '2px' }}
        >
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
};

// Dialogue pour gérer les agences de l'utilisateur
const AgencyManagementDialog = ({ open, handleClose, selectedAgencies = [], availableAgencies = [], onSave }) => {
  const [agencies, setAgencies] = useState(selectedAgencies || []);
  const theme = useTheme();
  
  useEffect(() => {
    setAgencies(selectedAgencies || []);
  }, [selectedAgencies]);
  
  const handleSave = () => {
    onSave(agencies);
    handleClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.05),
          borderBottom: `1px solid ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h6">Gestion des Agences</Typography>
        </Box>
        <IconButton onClick={handleClose} edge="end" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{ 
            bgcolor: alpha(theme?.palette?.info?.main || '#0288d1', 0.05),
            p: 2,
            borderRadius: 1,
            borderLeft: `3px solid ${alpha(theme?.palette?.info?.main || '#0288d1', 0.5)}`
          }}
        >
          Sélectionnez les agences auxquelles l'utilisateur aura accès. L'utilisateur pourra consulter et gérer les données des agences sélectionnées.
        </Typography>
        
        <Autocomplete
          multiple
          options={availableAgencies || []}
          getOptionLabel={(option) => option?.name || ''}
          value={agencies}
          onChange={(event, newValue) => {
            setAgencies(newValue);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option?.id || index}
                label={option?.name || ''}
                size="small"
                {...getTagProps({ index })}
                sx={{ 
                  borderRadius: '8px',
                  fontWeight: 'medium',
                  bgcolor: theme?.palette ? alpha(theme.palette.primary.main || '#1976d2', 0.1) : '#e3f2fd',
                  py: 0.5
                }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Rechercher une agence"
              fullWidth
              sx={{ mt: 2 }}
            />
          )}
        />
        
        <Box sx={{ mt: 3 }}>
          <Typography 
            variant="subtitle2" 
            gutterBottom
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            <BusinessIcon fontSize="small" color="primary" />
            Agences sélectionnées:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mt: 1, 
              borderRadius: 2,
              borderColor: theme?.palette?.divider || '#e0e0e0',
              minHeight: 100,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: 1
            }}
          >
            {agencies && agencies.length > 0 ? (
              agencies.map((agency) => (
                <Chip
                  key={agency?.id || Math.random()}
                  label={agency?.name || ''}
                  onDelete={() => {
                    setAgencies(agencies.filter((a) => a?.id !== agency?.id));
                  }}
                  sx={{ 
                    borderRadius: '8px',
                    fontWeight: 'medium',
                    bgcolor: theme?.palette ? alpha(theme.palette.primary.main || '#1976d2', 0.1) : '#e3f2fd',
                    py: 0.5
                  }}
                  deleteIcon={<CloseIcon fontSize="small" />}
                />
              ))
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                Aucune agence sélectionnée
              </Typography>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
          px: 3, 
          py: 2,
          bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.02)
        }}
      >
        <Button 
          onClick={handleClose}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3
          }}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dialogue de confirmation pour bloquer/débloquer un utilisateur
const StatusConfirmDialog = ({ open, onClose, user, action, onConfirm }) => {
  const isBlocking = action === 'block';
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2, overflow: 'hidden' }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: isBlocking ? 'error.light' : 'success.light', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        {isBlocking ? <BlockIcon /> : <LockOpenIcon />}
        {isBlocking ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Box sx={{ py: 1 }}>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              fontWeight: 500,
              mb: 3
            }}
          >
            Êtes-vous sûr de vouloir {isBlocking ? 'bloquer' : 'débloquer'} l'utilisateur <strong>{user?.username || ''}</strong> ?
          </Typography>
          
          <Paper
            variant="outlined"
            sx={{ 
              p: 2, 
              borderRadius: 2,
              bgcolor: alpha(isBlocking ? theme.palette.error.main : theme.palette.success.main, 0.05),
              borderLeft: `3px solid ${isBlocking ? theme.palette.error.main : theme.palette.success.main}`
            }}
          >
            {isBlocking ? (
              <Typography variant="body2" color="text.secondary">
                <strong>Important:</strong> L'utilisateur ne pourra plus se connecter à l'application tant qu'il sera bloqué. Cette action peut être annulée ultérieurement.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                <strong>Information:</strong> L'utilisateur pourra à nouveau se connecter à l'application avec ses identifiants actuels.
              </Typography>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Annuler
        </Button>
        <Button 
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={isBlocking ? "error" : "success"}
          startIcon={isBlocking ? <BlockIcon /> : <LockOpenIcon />}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3
          }}
        >
          {isBlocking ? 'Bloquer' : 'Débloquer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserDetails = ({ user = {}, onUpdateUser = () => {}, onDeleteUser = () => {}, agencies = [] }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user, userAgencies: user?.userAgencies || [] });
  const [agencyDialogOpen, setAgencyDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const {
          data: agenciesData = [],
  } = useGetAgenciesQuery()
  
  // Sécuriser l'accès aux propriétés
  const isActive = user?.isActive;
  const selectedAgencies = editedUser?.userAgencies || [];
  
  // Mettre à jour editedUser lorsque user change
  useEffect(() => {
    setEditedUser({ ...user, userAgencies: user?.userAgencies || [] });
  }, [user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...user, userAgencies: user?.userAgencies || [] });
    setIsEditing(false);
  };

        const handleAgenciesSave = (selectedAgencies) => {
                setEditedUser(prev => ({
                        ...prev,
                        userAgencies: selectedAgencies
                }));
        };
  
  const handleStatusChange = () => {
    const newStatus = isActive ? 'INACTIF' : 'ACTIF';
    const updatedUser = { ...user, status: newStatus };
    onUpdateUser(updatedUser);
  };
  
  const openStatusDialog = (action) => {
    setStatusAction(action);
    setStatusDialogOpen(true);
  };
  
  // Fonction sécurisée pour utiliser alpha
  const safeAlpha = (color, opacity) => {
    if (!theme || !theme.palette) return 'rgba(0, 0, 0, 0.1)';
    try {
      return alpha(color || '#000000', opacity);
    } catch (error) {
      console.error('Error using alpha function:', error);
      return 'rgba(0, 0, 0, 0.1)';
    }
  };
  
  return (
    <>
      <Fade in={true} timeout={300}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            background: 'linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(250,250,255,1) 100%)',
            position: 'relative'
          }}
        >
          {/* Barre supérieure colorée */}
          <Box 
            sx={{ 
              height: 8, 
              width: '100%', 
              bgcolor: isActive ? 'success.main' : 'error.main',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1
            }}
          />
          
          <Box sx={{ p: 4, pt: 3, position: 'relative', zIndex: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: isActive ? 'success.main' : 'error.main',
                      width: 70,
                      height: 70,
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {user?.firstname ? user.firstname.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: '600',
                        mb: 0.5,
                        color: 'text.primary'
                      }}
                    >
                      {user?.firstname + " " + user?.lastname || 'Utilisateur'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip 
                        label={isActive ? 'ACTIF' : 'INACTIF'} 
                        color={isActive ? 'success' : 'error'} 
                        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                        sx={{ 
                          borderRadius: '8px',
                          fontWeight: '600',
                          pl: 0.5,
                          '& .MuiChip-icon': {
                            mr: 0.5
                          }
                        }}
                      />
                      <Chip
                        icon={user?.role === 'SUPER_ADMIN' ? <SchoolIcon /> : <BadgeIcon />}
                        label={user?.role || 'Non défini'}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          bgcolor: safeAlpha(theme?.palette?.primary?.main, 0.05),
                          borderColor: safeAlpha(theme?.palette?.primary?.main, 0.2)
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1.5 }}>
                  {isActive ? (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<BlockIcon />}
                      onClick={() => openStatusDialog('block')}
                      sx={{ 
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2
                      }}
                    >
                      Bloquer
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      color="success" 
                      startIcon={<LockOpenIcon />}
                      onClick={() => openStatusDialog('unblock')}
                      sx={{ 
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2
                      }}
                    >
                      Débloquer
                    </Button>
                  )}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ 
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }}
                  >
                    Modifier
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Fade>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={500}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 0, 
                borderRadius: 3, 
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.04),
                borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.12)
                    }}
                  >
                    <PersonIcon fontSize="small" color="primary" />
                  </Box>
                  Informations personnelles
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {isEditing ? (
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstname"
                      value={editedUser?.firstname || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  <TextField
                      fullWidth
                      label="Nom"
                      name="lastname"
                      value={editedUser?.lastname || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                              startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={editedUser?.email || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phoneNumber"
                      value={editedUser?.phoneNumber || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={editedUser?.secureKey || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Stack>
                ) : (
                  <Stack spacing={1}>
                    <InfoBox 
                      icon={<PersonIcon color="primary" fontSize="small" />}
                      label="Nom d'utilisateur"
                      value={user?.firstname + " " + user?.lastname || 'Non défini'}
                      iconBgColor="primary.light"
                    />
                    <Divider variant="fullWidth" sx={{ my: 0.5 }} />
                    <InfoBox 
                      icon={<EmailIcon color="primary" fontSize="small" />}
                      label="Email"
                      value={user?.email}
                      iconBgColor="primary.light"
                    />
                    <Divider variant="fullWidth" sx={{ my: 0.5 }} />
                    <InfoBox 
                      icon={<PhoneIcon color="primary" fontSize="small" />}
                      label="Téléphone"
                      value={user?.phoneNumber || 'Non défini'}
                      iconBgColor="primary.light"
                    />
                    <Divider variant="fullWidth" sx={{ my: 0.5 }} />
                    <InfoBox 
                      icon={user?.role === 'SUPER_ADMIN' ? <SchoolIcon color="primary" fontSize="small" /> : <BadgeIcon color="primary" fontSize="small" />}
                      label="Rôle"
                      value={user?.role}
                      iconBgColor="primary.light"
                    />
                  </Stack>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={700}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 0, 
                borderRadius: 3, 
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 2.5, 
                bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.04),
                borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      bgcolor: alpha(theme?.palette?.primary?.main || '#1976d2', 0.12)
                    }}
                  >
                    <BusinessIcon fontSize="small" color="primary" />
                  </Box>
                  Agences
                </Typography>
                
                {isEditing && (
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => setAgencyDialogOpen(true)}
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Gérer les agences
                  </Button>
                )}
              </Box>
              
              <Box sx={{ p: 3 }}>
                {isEditing ? (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      mb: 3,
                      p: 2,
                      border: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
                      borderRadius: 2,
                      bgcolor: alpha(theme?.palette?.background?.default || '#ffffff', 0.6),
                      minHeight: 60
                    }}>
                      {selectedAgencies && selectedAgencies.length > 0 ? (
                        selectedAgencies.map((agency) => (
                          <Chip
                            key={agency?.id || Math.random()}
                            label={agency?.name || ''}
                            size="medium"
                            onDelete={() => {
                              setEditedUser(prev => ({
                                ...prev,
                                userAgencies: prev?.userAgencies?.filter(a => a?.id !== agency?.id) || []
                              }));
                            }}
                            sx={{ 
                              borderRadius: '8px',
                              fontWeight: 'medium',
                              bgcolor: safeAlpha(theme?.palette?.primary?.main, 0.1),
                              height: 32
                            }}
                          />
                        ))
                      ) : (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            height: '100%',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          Aucune agence sélectionnée
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 4 }}>
                      <FormControl component="fieldset">
                        <FormLabel 
                          component="legend" 
                          sx={{ 
                            fontWeight: 500, 
                            mb: 1.5,
                            color: 'text.primary'
                          }}
                        >
                          Rôle utilisateur
                        </FormLabel>
                        <RadioGroup
                          row
                          name="role"
                          value={editedUser?.role || ''}
                          onChange={handleInputChange}
                        >
                          <FormControlLabel 
                            value="Manager" 
                            control={<Radio color="primary" />} 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon color="primary" fontSize="small" />
                                <Typography>Manager</Typography>
                              </Box>
                            }
                            sx={{ mr: 4 }}
                          />
                          <FormControlLabel 
                            value="Collaborateur" 
                            control={<Radio color="primary" />} 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BadgeIcon color="primary" fontSize="small" />
                                <Typography>Collaborateur</Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                    
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleCancel}
                        startIcon={<CloseIcon />}
                        sx={{ 
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3
                        }}
                      >
                        Annuler
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSave}
                        startIcon={<SaveIcon />}
                        sx={{ 
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 3,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        Enregistrer
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        mb: 4
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          pb: 1,
                          borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
                          fontWeight: 600
                        }}
                      >
                        <BusinessIcon color="primary" fontSize="small" />
                        Agences attribuées
                      </Typography>

                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 40 }}>
                                    {selectedAgencies && selectedAgencies.length > 0 ? (
                                        selectedAgencies.map((agency) => (
                                            <Chip
                                                key={agency?.id || Math.random()}
                                                label={agency?.name || ''}
                                                size="medium"
                                                sx={{
                                                        borderRadius: '8px',
                                                        fontWeight: 'medium',
                                                        bgcolor: safeAlpha(theme?.palette?.primary?.main, 0.1),
                                                        px: 1
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                                Aucune agence attribuée
                                        </Typography>
                                    )}
                            </Box>
                    </Paper>
                    
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          fontWeight: 600
                        }}
                      >
                        Actions
                      </Typography>
                      
                      <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2, 
                          borderColor: alpha(theme?.palette?.divider || '#e0e0e0', 0.8),
                          bgcolor: alpha(theme?.palette?.background?.default || '#ffffff', 0.5)
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              startIcon={<DeleteIcon />}
                              onClick={() => onDeleteUser(user?.id)}
                              fullWidth
                              sx={{ 
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 1
                              }}
                            >
                              Supprimer l'utilisateur
                            </Button>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              justifyContent: 'center',
                              bgcolor: safeAlpha(isActive ? theme?.palette?.success?.main : theme?.palette?.error?.main, 0.1),
                              p: 1.5,
                              borderRadius: 2
                            }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: isActive ? 'success.main' : 'error.main'
                                }}
                              >
                                {isActive ? "Compte actif" : "Compte inactif"}
                              </Typography>
                              <Switch
                                checked={isActive}
                                onChange={() => openStatusDialog(isActive ? 'block' : 'unblock')}
                                color={isActive ? "success" : "error"}
                                sx={{ ml: 'auto' }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
      
      {/* Dialogue de gestion des agences */}
      <AgencyManagementDialog
        open={agencyDialogOpen}
        handleClose={() => setAgencyDialogOpen(false)}
        selectedAgencies={selectedAgencies}
        availableAgencies={agenciesData}
        onSave={handleAgenciesSave}
      />
      
      {/* Dialogue de confirmation de changement de statut */}
      <StatusConfirmDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        user={user}
        action={statusAction}
        onConfirm={handleStatusChange}
      />
    </>
  );
};

export default UserDetails;