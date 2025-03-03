// src/components/UserManagement/UserDetails.js
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Stack, 
  Button,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const StatusChip = ({ status }) => {
  const theme = useTheme();
  const getColor = (status) => {
    switch (status) {
      case 'ACTIF':
        return theme.palette.success.main;
      case 'INACTIF':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        px: 1.5, 
        py: 0.5,
        borderRadius: 2,
        backgroundColor: alpha(getColor(status), 0.1),
        color: getColor(status),
        fontWeight: 'medium'
      }}
    >
      {status}
    </Box>
  );
};

const UserDetails = ({ user, onUpdateUser, onDeleteUser, agencies }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

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
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  return (
    <Card 
      sx={{ 
        width: '100%', 
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
          borderBottom: `1px dashed ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              {user.username[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {user.username}
              </Typography>
              <StatusChip status={user.status} />
            </Box>
          </Box>
          <Box>
            {!isEditing ? (
              <Tooltip title="Modifier l'utilisateur">
                <IconButton 
                  color="primary" 
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Enregistrer">
                  <IconButton color="success" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Annuler">
                  <IconButton color="error" onClick={handleCancel}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informations personnelles
            </Typography>
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    name="username"
                    value={editedUser.username}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={editedUser.telephone}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Typography variant="body1">{user.username}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" />
                  <Typography variant="body1">{user.telephone}</Typography>
                </Box>
              </Stack>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Détails professionnels
            </Typography>
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Rôle"
                    name="role"
                    value={editedUser.role}
                    onChange={handleInputChange}
                    variant="outlined"
                  >
                    <MenuItem value="Collaborateur">Collaborateur</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Agence"
                    name="agency"
                    value={editedUser.agency}
                    onChange={handleInputChange}
                    variant="outlined"
                  >
                    {agencies.map((agency) => (
                      <MenuItem key={agency.id} value={agency.name}>
                        {agency.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Mot de passe"
                    name="password"
                    value={editedUser.password || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="action" />
                  <Typography variant="body1">{user.agency}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Typography variant="body1">{user.role}</Typography>
                </Box>
              </Stack>
            )}
          </Grid>
        </Grid>

        {!isEditing && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<DeleteIcon />} 
              color="error" 
              variant="outlined"
              onClick={() => onDeleteUser(user.id)}
            >
              Supprimer l'utilisateur
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDetails;