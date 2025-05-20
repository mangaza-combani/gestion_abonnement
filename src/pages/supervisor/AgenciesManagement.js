import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  List as ListIcon,
  People as PeopleIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useGetAgenciesQuery, 
  useGetAgencyByIdQuery, 
  useCreateAgencyMutation, 
  useUpdateAgencyMutation,
  setSelectedAgency,
  setFilters,
  resetFilters,
  selectAgencyFilters,
  selectSelectedAgency
} from '../../store/slices/agencySlice';

const AgenciesManagement = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const filters = useSelector(selectAgencyFilters);
  const selectedAgencyId = useSelector(selectSelectedAgency)?.id;

  // Local state
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [searchFocused, setSearchFocused] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    commissionRate: 15.8,
    subscriptionPrice: 19
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data using RTK Query
  const { 
    data: agencies = [], 
    isLoading: agenciesLoading, 
    error: agenciesError 
  } = useGetAgenciesQuery();
  
  const {
    data: selectedAgency,
    isLoading: selectedAgencyLoading
  } = useGetAgencyByIdQuery(selectedAgencyId, { skip: !selectedAgencyId });

  // Mutations
  const [createAgency, { isLoading: isCreating }] = useCreateAgencyMutation();
  const [updateAgency, { isLoading: isUpdating }] = useUpdateAgencyMutation();

  // Synchronize local search state with Redux filter state
  useEffect(() => {
    if (searchTerm !== filters.search) {
      const timeoutId = setTimeout(() => {
        dispatch(setFilters({ search: searchTerm }));
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, dispatch, filters.search]);

  // Set first agency as selected if none is selected yet
  useEffect(() => {
    if (agencies.length > 0 && !selectedAgencyId && !agenciesLoading) {
      dispatch(setSelectedAgency(agencies[0]));
    }
  }, [agencies, selectedAgencyId, agenciesLoading, dispatch]);

  // Filter agencies based on filters in Redux store
  const filteredAgencies = agencies.filter(agency => {
    // Filter by search term
    const matchesSearch = 
      agency.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      agency.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      agency.phone?.includes(filters.search);
    
    // Filter by status
    const matchesStatus = 
      filters.status === 'all' || 
      agency.status === filters.status;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort based on sort criteria
    const sortField = filters.sortBy;
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    
    if (a[sortField] < b[sortField]) return -1 * direction;
    if (a[sortField] > b[sortField]) return 1 * direction;
    return 0;
  });

  // Event handlers
  const handleAgencySelect = (agency) => {
    dispatch(setSelectedAgency(agency));
  };

  const handleOpenDetailsModal = () => {
    setDetailsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      commissionRate: 15.8,
      subscriptionPrice: 19
    });
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedAgency) {
      setFormData({
        name: selectedAgency?.agency.name,
        email: selectedAgency?.agency.email || '',
        phone: selectedAgency?.agency.phone || '',
        address: selectedAgency?.agency.address || '',
        commissionRate: selectedAgency?.agency.commissionRate || 15.8,
        subscriptionPrice: selectedAgency?.agency.subscriptionPrice || 19
      });
      setEditModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setDetailsModalOpen(false);
    setCreateModalOpen(false);
    setEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAgency = async () => {
    try {
      const result = await createAgency({
        ...formData,
        status: 'ACTIVE',
        tax_rate: "3.00",
        manager: "WEZO"
      }).unwrap();
      setCreateModalOpen(false);
      setNotification({
        open: true,
        message: 'Agence créée avec succès',
        severity: 'success'
      });
      dispatch(setSelectedAgency(result));
    } catch (error) {
      setNotification({
        open: true,
        message: `Erreur lors de la création: ${error.message || 'Veuillez réessayer'}`,
        severity: 'error'
      });
    }
  };

  const handleUpdateAgency = async () => {
    if (!selectedAgency) return;
    
    try {
      const result = await updateAgency({ 
        id: selectedAgency?.agency?.id,
        ...formData,
        status: 'ACTIVE',
        tax_rate: "3.00",
        manager: "WEZO"
      }).unwrap();
      
      setEditModalOpen(false);
      dispatch(setSelectedAgency(result));
      setNotification({
        open: true,
        message: 'Agence mise à jour avec succès',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Erreur lors de la mise à jour: ${error.message || 'Veuillez réessayer'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleSortChange = (field) => {
    const newDirection = 
      filters.sortBy === field && filters.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    
    dispatch(setFilters({ 
      sortBy: field, 
      sortDirection: newDirection 
    }));
  };

  const handleStatusFilterChange = (status) => {
    dispatch(setFilters({ status }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setSearchTerm('');
  };

  // Render loading state
  if (agenciesLoading && !agencies.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (agenciesError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          {agenciesError.status === 'FETCH_ERROR' 
            ? 'Impossible de se connecter au serveur.' 
            : agenciesError.data?.message || 'Une erreur est survenue lors du chargement des données.'}
        </Alert>
      </Box>
    );
  }

  // Render main content
  return (
    <Box>
      {/* Top toolbar */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Rechercher une agence..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 28,
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
                ...(searchFocused && {
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                })
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box>
            <IconButton 
              onClick={() => handleSortChange('name')} 
              color={filters.sortBy === 'name' ? 'primary' : 'default'}
              size="small"
              title="Trier par nom"
            >
              <SortIcon />
            </IconButton>
            
            <IconButton
              onClick={() => handleStatusFilterChange('active')}
              color={filters.status === 'ACTIVE' ? 'success' : 'default'}
              size="small"
              title="Agences actives"
            >
              <PlayArrowIcon />
            </IconButton>
            
            <IconButton
              onClick={() => handleStatusFilterChange('inactive')}
              color={filters.status === 'INACTIVE' ? 'warning' : 'default'}
              size="small"
              title="Agences inactives"
            >
              <BlockIcon />
            </IconButton>

            <IconButton
                onClick={() => handleStatusFilterChange('inactive')}
                color={filters.status === 'SUSPENDED' ? 'error' : 'default'}
                size="small"
                title="Suspendre l'agence"
            >
              <BlockIcon />
            </IconButton>
            
            {(filters.status !== 'all' || filters.search) && (
              <Button 
                size="small" 
                onClick={handleResetFilters}
                startIcon={<FilterListIcon />}
              >
                Réinitialiser
              </Button>
            )}
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Nouvelle agence
        </Button>
      </Box>

      {/* Main user interface */}
      <Box sx={{ display: 'flex', p: 3, gap: 3 }}>
        {/* Left panel - List of agencies */}
        <Box sx={{ width: '35%' }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                <TableRow>
                  <TableCell 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleSortChange('name')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      NOM
                      {filters.sortBy === 'name' && (
                        <Box component="span" sx={{ ml: 0.5, fontSize: 18 }}>
                          {filters.sortDirection === 'asc' ? '↑' : '↓'}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>MANAGER</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>STATUT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucune agence trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgencies?.map((agency) => (
                    <TableRow 
                      key={agency.id} 
                      hover
                      selected={selectedAgency && agency?.id == selectedAgency?.agency?.id}
                      onClick={() => handleAgencySelect(agency)}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: selectedAgency && agency.id === selectedAgency?.agency?.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.04)'
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.12)'
                        }
                      }}
                    >
                      <TableCell>{agency.name}</TableCell>
                      <TableCell>{agency.manager}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={agency.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                          color={agency.status === 'ACTIVE' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Middle panel - Agency details */}
        {selectedAgency ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedAgencyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Agency header */}
                <Card sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 1, overflow: 'hidden' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{selectedAgency?.agency?.name}</Typography>
                      <Box>
                        <IconButton 
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            '&:hover': { 
                              bgcolor: 'rgba(255, 255, 255, 0.25)'
                            },
                            mr: 1
                          }}
                          onClick={handleOpenDetailsModal}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            '&:hover': { 
                              bgcolor: 'rgba(255, 255, 255, 0.25)'
                            }
                          }}
                          onClick={handleOpenEditModal}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        startIcon={<ListIcon />} 
                        sx={{ 
                          color: 'white', 
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Liste des factures
                      </Button>
                      <Button 
                        startIcon={<PeopleIcon />} 
                        sx={{ 
                          color: 'white', 
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Liste des collaborateurs
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* CA and distribution */}
                <Card sx={{ borderRadius: 1, overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h4" color="primary.main" fontWeight="500" gutterBottom>
                      CA {(selectedAgency?.agency?.caTotal || 0).toLocaleString('fr-FR')}€
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          À verser
                        </Typography>
                        <Typography variant="h5" fontWeight="500">
                          {(selectedAgency?.agency?.aVerser || 0).toLocaleString('fr-FR')}€
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Commission
                        </Typography>
                        <Typography variant="h5" fontWeight="500">
                          {(selectedAgency?.agency?.commission || 0).toLocaleString('fr-FR')}€
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card sx={{ borderRadius: 1, overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      STATISTIQUES
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1
                    }}>
                      <PlayArrowIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>PLAY - {selectedAgency?.agency?.stats?.play || 0} Ligne(s)</Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      bgcolor: 'error.light',
                      borderRadius: 1
                    }}>
                      <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography color="error.main">
                        DETTE - {selectedAgency?.agency?.stats?.dette || 0} Ligne(s) - {(selectedAgency?.agency?.stats?.detteAmount || 0).toLocaleString('fr-FR')}€
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 1
                    }}>
                      <BlockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>RESILIE - {selectedAgency?.agency?.stats?.resilie || 0} Ligne(s)</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Aucune agence sélectionnée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veuillez sélectionner une agence dans la liste pour voir ses détails
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Right panel - Actions */}
        {selectedAgency && (
          <Box sx={{ width: '200px' }}>
            <Typography variant="h6" gutterBottom>ACTIONS</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  bgcolor: 'info.main',
                  '&:hover': { bgcolor: 'info.dark' },
                  borderRadius: 0,
                  color: 'white',
                  py: 1
                }}
              >
                Demander commission
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                sx={{ 
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' },
                  borderRadius: 0,
                  color: 'white',
                  py: 1
                }}
              >
                Valider commission
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Agency details modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Détails de l'agence
            <IconButton onClick={handleCloseModals}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAgency && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Informations générales</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
                  <Typography variant="body1">{selectedAgency?.agency?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedAgency?.agency?.email || 'Non spécifié'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
                  <Typography variant="body1">{selectedAgency?.agency?.phone || 'Non spécifié'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                  <Typography variant="body1">{selectedAgency?.agency.address || 'Non spécifiée'}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Paramètres financiers</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Chiffre d'affaires total</Typography>
                  <Typography variant="body1">{(selectedAgency?.agency?.caTotal || 0).toLocaleString('fr-FR')}€</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Montant à verser</Typography>
                  <Typography variant="body1">{(selectedAgency?.agency?.aVerser || 0).toLocaleString('fr-FR')}€</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Commission</Typography>
                  <Typography variant="body1">{(selectedAgency?.agency?.commission || 0).toLocaleString('fr-FR')}€</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Taux de commission</Typography>
                  <Typography variant="body1">{selectedAgency?.agency?.commissionRate || 15.8}%</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Prix d'abonnement</Typography>
                  <Typography variant="body1">{selectedAgency?.agency?.subscriptionPrice || 19}€</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Clients associés ({selectedAgency?.clients?.length || 0})</Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Téléphone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAgency?.clients?.length > 0 ? (
                        selectedAgency?.clients?.map(client => (
                          <TableRow key={client.id}>
                            <TableCell>{client.firstname + ' ' + client.lastname}</TableCell>
                            <TableCell>{client.email || '-'}</TableCell>
                            <TableCell>{client.phoneNumber || 'N/C'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            Aucun client pour cette agence
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Create agency modal */}
      <Dialog
        open={createModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Créer une nouvelle agence
            <IconButton onClick={handleCloseModals}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nom de l'agence"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Téléphone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Adresse"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="commissionRate"
                label="Taux de commission (%)"
                type="number"
                fullWidth
                value={formData.commissionRate}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="subscriptionPrice"
                label="Prix d'abonnement (€)"
                type="number"
                fullWidth
                value={formData.subscriptionPrice}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Annuler</Button>
          <Button 
            onClick={handleCreateAgency} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.name || isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit agency modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Modifier l'agence
            <IconButton onClick={handleCloseModals}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nom de l'agence"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Téléphone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Adresse"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="commissionRate"
                label="Taux de commission (%)"
                type="number"
                fullWidth
                value={formData.commissionRate}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="subscriptionPrice"
                label="Prix d'abonnement (€)"
                type="number"
                fullWidth
                value={formData.subscriptionPrice}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Annuler</Button>
          <Button 
            onClick={handleUpdateAgency} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.name || isUpdating}
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgenciesManagement;