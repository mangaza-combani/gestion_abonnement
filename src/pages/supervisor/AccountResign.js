import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Fade, 
  Tooltip, 
  Card,
  CardContent,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  AccountCircle as AccountCircleIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import AccountSearch from '../../components/AccountManagement/AccountSearch';
import AccountDetails from '../../components/AccountManagement/AccountDetails';
import NewAccountDialog from '../../components/AccountManagement/NewAccountDialog';
import NewLineDialog from '../../components/AccountManagement/NewLineDialog';
import AccountList from '../../components/AccountManagement/AccountList';

// Import hooks from redAccountsApiSlice
import {
  useGetRedAccountsQuery,
  useChangeLineStatusMutation,
  useCreateLineMutation,
  useCreateRedAccountMutation,
  useUpdatePaymentInfoMutation,
  transformAccount,
  selectSelectedAccount,
  selectAccount
} from '../../store/slices/redAccountsSlice';
import { useDispatch, useSelector } from 'react-redux';

// Import real API hooks for agencies and clients
import { useGetAgenciesQuery } from '../../store/slices/agencySlice';
import { useGetClientsQuery } from '../../store/slices/clientsSlice';

const ModernAccountManagement = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isNewLineDialogOpen, setIsNewLineDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const dispatch = useDispatch();

  // Fetch accounts data with RTK Query
  const {
    data: accounts = [],
    isLoading,
    isError,
    error
  } = useGetRedAccountsQuery();
  // Get selected account from Redux state
  const selectedAccount = useSelector(selectSelectedAccount);

  // Fetch agencies and clients data
  const { data: agenciesData, isLoading: agenciesLoading } = useGetAgenciesQuery();
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery();

  // Initialize mutations
  const [changeLineStatus] = useChangeLineStatusMutation();
  const [createLine] = useCreateLineMutation();
  const [createRedAccount] = useCreateRedAccountMutation();
  const [updatePaymentInfo] = useUpdatePaymentInfoMutation();

  // Effect to show error in snackbar if API call fails
  useEffect(() => {
    if (isError) {
      showSnackbar(`Erreur: ${error?.data?.message || 'Impossible de charger les données'}`, 'error');
    }
  }, [isError, error]);

  // Filtrer les comptes en fonction des critères de recherche
  const filteredAccounts = (accounts?.redAccounts || []).filter(account => {
    const matchesSearch = !searchTerm ? true : 
      account.redAccountId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id?.toString().includes(searchTerm) ||
      account.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgency = !selectedAgency ? true : 
      account.agencyId === selectedAgency;
    
    return matchesSearch && matchesAgency;
  });

  // Gérer la création d'un nouveau compte
  const handleCreateAccount = async (accountData) => {
    try {
      // Appel API pour créer le compte
      const result = await createRedAccount(accountData).unwrap();
      
      setIsNewAccountDialogOpen(false);
      showSnackbar('Compte RED créé avec succès ! Les données ont été actualisées.', 'success');
      
      // Optionnel : sélectionner automatiquement le nouveau compte créé
      if (result.redAccount) {
        dispatch(selectAccount(result.redAccount));
      }
      
    } catch (err) {
      showSnackbar(`Erreur lors de la création du compte: ${err.data?.message || err.message}`, 'error');
    }
  };

  // Gérer l'ajout d'une nouvelle ligne
  const handleAddLine = async (lineData) => {
    if (!selectedAccount) return;
    
    try {
      await createLine({
        accountId: selectedAccount.id,
        lineData: {
          phoneNumber: lineData.phoneNumber,
          clientId: lineData.clientId || null,
          simCardId: lineData.assignSimNow ? lineData.simCardId : null,
          status: lineData.assignToClient ? 'attributed' : 'unattributed'
        }
      }).unwrap();
      
      setIsNewLineDialogOpen(false);
      showSnackbar('Ligne ajoutée avec succès', 'success');
    } catch (err) {
      showSnackbar(`Erreur lors de l'ajout de la ligne: ${err.message}`, 'error');
    }
  };

  // Gérer l'activation d'une ligne
  const handleActivateLine = async (line) => {
    if (!selectedAccount) return;
    
    try {
      await changeLineStatus({
        accountId: selectedAccount.id,
        lineId: line.id,
        status: 'attributed'
      }).unwrap();
      
      showSnackbar(`Ligne ${line.phoneNumber} activée`, 'success');
    } catch (err) {
      showSnackbar(`Erreur lors de l'activation: ${err.message}`, 'error');
    }
  };

  // Gérer le blocage d'une ligne
  const handleBlockLine = async (line) => {
    if (!selectedAccount) return;
    
    try {
      await changeLineStatus({
        accountId: selectedAccount.id,
        lineId: line.id,
        status: 'blocked'
      }).unwrap();
      
      showSnackbar(`Ligne ${line.phoneNumber} bloquée`, 'warning');
    } catch (err) {
      showSnackbar(`Erreur lors du blocage: ${err.message}`, 'error');
    }
  };

  // Gérer la mise en pause d'une ligne
  const handlePauseLine = async (line) => {
    if (!selectedAccount) return;
    
    try {
      await changeLineStatus({
        accountId: selectedAccount.id,
        lineId: line.id,
        status: 'paused'
      }).unwrap();
      
      showSnackbar(`Ligne ${line.phoneNumber} mise en pause`, 'info');
    } catch (err) {
      showSnackbar(`Erreur lors de la mise en pause: ${err.message}`, 'error');
    }
  };

  // Gérer la mise à jour des informations de paiement
  const handleUpdatePaymentInfo = async (paymentData) => {
    if (!selectedAccount) return;
    
    try {
      await updatePaymentInfo({
        accountId: selectedAccount.id,
        bankName: paymentData.bankName,
        cardLastFour: paymentData.cardLastFour,
        cardExpiry: paymentData.cardExpiry
      }).unwrap();
      
      showSnackbar('Informations de paiement mises à jour avec succès', 'success');
    } catch (err) {
      showSnackbar(`Erreur lors de la mise à jour: ${err.data?.message || err.message}`, 'error');
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

  // Sélectionner un compte
  const handleSelectAccount = (account) => {
    dispatch(selectAccount(transformAccount(account)));
  };

  // Calculer les statistiques totales des lignes
  const totalLines = accounts?.redAccounts?.reduce((acc, curr) => acc + (curr.lines?.length || 0), 0);

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'grey.50', 
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Header avec bouton d'ajout */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderRadius: 2,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountCircleIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" component="h1" fontWeight="medium">
              Gestion des Comptes Rattachés
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Chargement...' : 
                `${filteredAccounts.length} compte(s) • ${totalLines} ligne(s)`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Afficher/masquer les filtres">
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              startIcon={<FilterListIcon />}
            >
              Filtres
            </Button>
          </Tooltip>
          <Tooltip title="Créer un nouveau compte">
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsNewAccountDialogOpen(true)}
            >
              Nouveau Compte
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Conteneur principal */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Panneau de gauche (recherche et liste) */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: '700px',
          maxWidth: '900px'
        }}>
          {/* Bloc de recherche avec animation */}
          <Fade in={isFilterVisible || !selectedAccount}>
            <div>
              <AccountSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredAccounts?.length || 0}
                selectedAgency={selectedAgency}
                onAgencyChange={setSelectedAgency}
                agencies={agenciesData || []}
              />
            </div>
          </Fade>
          
          {/* Liste des comptes avec animation */}
          <Box sx={{ mt: isFilterVisible ? 2 : 0, flex: 1, transition: 'all 0.3s ease-in-out' }}>
            {isLoading ? (
              <Typography>Chargement des comptes...</Typography>
            ) : (
              <AccountList 
                accounts={filteredAccounts}
                selectedAccount={selectedAccount}
                onAccountSelect={handleSelectAccount}
              />
            )}
          </Box>
        </Box>

        {/* Panneau de droite (détails) */}
        <Box sx={{ flex: 2, display: 'flex', minWidth: '400px' }}>
          {selectedAccount ? (
            <Fade in={!!selectedAccount}>
              <div style={{ width: '100%' }}>
                <AccountDetails 
                  account={selectedAccount}
                  onAddLine={() => {
                    if (!selectedAccount?.id) {
                      showSnackbar('Veuillez sélectionner un compte RED avant d\'ajouter une ligne', 'warning');
                      return;
                    }
                    setIsNewLineDialogOpen(true);
                  }}
                  onActivateLine={handleActivateLine}
                  onBlockLine={handleBlockLine}
                  onPauseLine={handlePauseLine}
                  onDeleteLine={() => {}} // Cette fonctionnalité sera implémentée ultérieurement
                  onUpdatePaymentInfo={handleUpdatePaymentInfo}
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
                <AccountCircleIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {isLoading ? 'Chargement des comptes...' : 'Aucun compte sélectionné'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isLoading ? 'Veuillez patienter...' : 'Veuillez sélectionner un compte dans la liste pour voir ses détails'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Dialogs */}
      <NewAccountDialog 
        open={isNewAccountDialogOpen}
        onClose={() => setIsNewAccountDialogOpen(false)}
        onSubmit={handleCreateAccount}
        agencies={agenciesData || []}
      />

      <NewLineDialog 
        open={isNewLineDialogOpen && !!selectedAccount?.id}
        onClose={() => setIsNewLineDialogOpen(false)}
        onSubmit={handleAddLine}
        accountId={selectedAccount?.id}
        clients={clientsData?.users || []}
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

export default ModernAccountManagement;