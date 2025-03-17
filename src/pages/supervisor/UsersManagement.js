// src/pages/admin/UsersManagement.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Tooltip, 
  Card,
  CardContent,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import ModernUserTable from '../../components/UserManagement';
import UserDetails from '../../components/UserManagement/UserDetails';
import NewUserDialog from '../../components/UserManagement/NewUserDialog';

// Données de test
const mockUsers = [
  { 
    id: 1, 
    username: 'Soibhadimy', 
    email: 'abdou.celine@gmail.com', 
    telephone: '0253114152', 
    role: 'Collaborateur', 
    agency: 'Agence 1',
    status: 'ACTIF'
  },
  { 
    id: 2, 
    username: 'Mohamadi', 
    email: 'marie@yahoo.fr', 
    telephone: '1862136545', 
    role: 'Manager', 
    agency: 'Agence 2',
    status: 'ACTIF'
  },
  { 
    id: 3, 
    username: 'Anis', 
    email: 'david99@gmail.com', 
    telephone: '8650333642', 
    role: 'Collaborateur', 
    agency: 'Agence 3',
    status: 'INACTIF'
  }
];

const mockAgencies = [
  { id: 1, name: 'Agence 1' },
  { id: 2, name: 'Agence 2' },
  { id: 3, name: 'Agence 3' }
];

const UsersManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtrer les utilisateurs en fonction des critères de recherche
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ? true : 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Gérer la création d'un nouvel utilisateur
  const handleCreateUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      status: 'ACTIF'
    };
    
    setUsers([...users, newUser]);
    setIsNewUserDialogOpen(false);
    showSnackbar('Utilisateur créé avec succès', 'success');
  };

  // Afficher un message snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Gérer la modification d'un utilisateur
  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setUsers(updatedUsers);
    setSelectedUser(updatedUser);
    showSnackbar('Utilisateur mis à jour avec succès', 'success');
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = (userId) => {
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
    if (confirmDelete) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setSelectedUser(null);
      showSnackbar('Utilisateur supprimé avec succès', 'error');
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'grey.50', 
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Header avec barre de recherche et bouton d'ajout */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" component="h1" fontWeight="medium">
                Gestion des Utilisateurs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredUsers.length} utilisateur(s)
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: '600px' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <Tooltip title="Créer un nouvel utilisateur">
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsNewUserDialogOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Nouvel Utilisateur
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Conteneur principal */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Panneau de gauche (liste) */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: { xs: '100%', lg: '700px' },
          maxWidth: { lg: '900px' }
        }}>
          {/* Liste des utilisateurs */}
          <ModernUserTable 
            users={filteredUsers}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
        </Box>

        {/* Panneau de droite (détails) */}
        <Box sx={{ flex: 2, display: 'flex', minWidth: { xs: '100%', lg: '400px' } }}>
          {selectedUser ? (
            <Fade in={!!selectedUser}>
              <div style={{ width: '100%' }}>
                <UserDetails 
                  user={selectedUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  agencies={mockAgencies}
                />
              </div>
            </Fade>
          ) : (
            <Card sx={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PersonIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun utilisateur sélectionné
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Veuillez sélectionner un utilisateur dans la liste pour voir ses détails
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Dialog pour nouvel utilisateur */}
      <NewUserDialog 
        open={isNewUserDialogOpen}
        onClose={() => setIsNewUserDialogOpen(false)}
        onSubmit={handleCreateUser}
        agencies={mockAgencies}
      />

      {/* Snackbar pour les notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersManagement;