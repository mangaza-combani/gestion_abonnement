// src/pages/admin/UsersManagement.js
import React, { useState, useEffect } from 'react';
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
import {useCreateClientMutation, useGetAllUsersQuery} from "../../store/slices/clientsSlice";
import {useGetAgenciesQuery} from "../../store/slices/agencySlice";

const UsersManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { data: agencies } = useGetAgenciesQuery()
  const [createClient] = useCreateClientMutation()

  const {
    error: usersError,
    data: usersData,
    isLoading: usersLoading
  } = useGetAllUsersQuery()

  // Synchroniser les données RTK Query avec l'état local
  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  // Filtrer les utilisateurs en fonction des critères de recherche
  const filteredUsers = React.useMemo(() => {
    if (!users || users.length === 0) return [];

    if (!searchTerm.trim()) return users;

    const searchLower = searchTerm.toLowerCase().trim();

    return users.filter(user => {
      const firstname = user.firstname?.toLowerCase() || '';
      const lastname = user.lastname?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phoneNumber = user.phoneNumber?.toLowerCase() || '';

      return firstname.includes(searchLower) ||
          lastname.includes(searchLower) ||
          email.includes(searchLower) ||
          phoneNumber.includes(searchLower);
    });
  }, [users, searchTerm]);

  // Gérer la création d'un nouvel utilisateur
  const handleCreateUser = async (userData) => {
    try {
      const result = await createClient(userData).unwrap();

      // Ajouter le nouvel utilisateur à l'état local immédiatement
      const newUser = {
        id: result.id || Date.now(), // Utiliser l'ID du serveur ou un timestamp
        ...userData,
        status: 'ACTIF'
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      setIsNewUserDialogOpen(false);
      showSnackbar('Utilisateur créé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      showSnackbar('Erreur lors de la création de l\'utilisateur', 'error');
    }
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

  // Gérer la sélection d'un utilisateur
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Affichage de chargement
  if (usersLoading) {
    return (
        <Box sx={{
          p: 3,
          bgcolor: 'grey.50',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography>Chargement des utilisateurs...</Typography>
        </Box>
    );
  }

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
                  {filteredUsers?.length || 0} utilisateur(s)
                  {searchTerm && ` (${users?.length || 0} au total)`}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: '600px' }}>
              <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher par nom, email ou téléphone..."
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

          {/* Indicateur de recherche active */}
          {searchTerm && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Recherche active pour :
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  "{searchTerm}"
                </Typography>
                <Button
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ ml: 1 }}
                >
                  Effacer
                </Button>
              </Box>
          )}
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
            {/* Message si aucun résultat */}
            {searchTerm && filteredUsers.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Aucun utilisateur trouvé
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Essayez avec d'autres termes de recherche
                  </Typography>
                </Paper>
            )}

            {/* Liste des utilisateurs */}
            <ModernUserTable
                users={filteredUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
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
                        agencies={agencies}
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
            agencies={agencies}
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