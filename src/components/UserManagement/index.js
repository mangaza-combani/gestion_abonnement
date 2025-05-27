// src/components/UserManagement/ModernUserTable.js
import React, { useState } from 'react';
import { 
  Box,
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Typography,
  Fade,
  useTheme,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Email as EmailIcon,
  Phone as PhoneIcon,
  Password as PasswordIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Composant pour afficher le mot de passe avec possibilité de le révéler
const PasswordDisplay = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePassword = (event) => {
    event.stopPropagation(); // Empêche le déclenchement de l'événement onClick du TableRow
    setShowPassword(!showPassword);
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <PasswordIcon fontSize="small" color="action" />
      <Typography variant="body2" sx={{ flex: 1 }}>
        {showPassword ? password : '••••••••'}
      </Typography>
      <IconButton 
        size="small" 
        onClick={togglePassword}
        sx={{ ml: 1 }}
      >
        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
};

// Composant pour afficher le statut avec une icône
const StatusDisplay = ({ status }) => {
  const isActive = status === true;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {isActive ? (
        <CheckCircleIcon fontSize="small" color="success" />
      ) : (
        <CancelIcon fontSize="small" color="error" />
      )}
      <Typography 
        variant="body2" 
        color={isActive ? "success.main" : "error.main"}
      >
        {isActive ? 'Actif' : 'Inactif'}
      </Typography>
    </Box>
  );
};

const ModernUserTable = ({ users, selectedUser, onUserSelect }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.5} borderBottom={1} borderColor="divider">
        <Typography variant="h6">
          Liste des utilisateurs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {users?.length} utilisateur(s)
        </Typography>
      </Box>
      
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>NOM D'UTILISATEUR</TableCell>
              <TableCell>EMAIL</TableCell>
              <TableCell>Clé secrète</TableCell>
              <TableCell>TÉLÉPHONE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun utilisateur ne correspond aux critères de recherche
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <Fade key={user.id} in={true} timeout={300}>
                  <TableRow
                    hover
                    selected={selectedUser?.id === user.id}
                    onClick={() => onUserSelect(user)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&.Mui-selected': {
                        backgroundColor: `${theme.palette.primary.light}20`
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: `${theme.palette.primary.light}30`
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={selectedUser?.id === user.id ? 'bold' : 'regular'}>
                        {user.firstname} {user.lastname}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <PasswordDisplay password={user.secretKey} /> {/* Mot de passe fictif */}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {user.phoneNumber || 'N/C'}
                        </Typography>
                      </Box>
                    </TableCell>

                  </TableRow>
                </Fade>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ModernUserTable;