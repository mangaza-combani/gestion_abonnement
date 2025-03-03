import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Fade, 
  Tooltip, 
  Card,
  CardContent,
  Divider,
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

// Importation du composant AccountList modifié
import AccountList from '../../components/AccountManagement/AccountList';

// Données de test
import { 
  mockAccounts, 
  mockAgencies, 
  mockClients 
} from '../../components/AccountManagement/accountConstants';

const ModernAccountManagement = () => {
  const theme = useTheme();
  const [accounts, setAccounts] = useState(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isNewLineDialogOpen, setIsNewLineDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Filtrer les comptes en fonction des critères de recherche
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchTerm ? true : 
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgency = !selectedAgency ? true : 
      account.agencyId === selectedAgency;
    
    return matchesSearch && matchesAgency;
  });

  // Gérer la création d'un nouveau compte
  const handleCreateAccount = (accountData) => {
    const newAccount = {
      id: accounts.length + 1,
      login: accountData.login,
      email: accountData.email,
      password: accountData.password,
      agency: mockAgencies.find(a => a.id === parseInt(accountData.agencyId))?.name || '',
      agencyId: parseInt(accountData.agencyId),
      status: 'ACTIF',
      linesCount: 0,
      lines: []
    };
    
    setAccounts([...accounts, newAccount]);
    setIsNewAccountDialogOpen(false);
    showSnackbar('Compte créé avec succès', 'success');
  };

  // Gérer l'ajout d'une nouvelle ligne
  const handleAddLine = (lineData) => {
    if (!selectedAccount) return;
    
    const client = lineData.clientId 
      ? mockClients.find(c => c.id === parseInt(lineData.clientId))
      : null;
    
    const newLine = {
      id: Date.now(),
      phoneNumber: lineData.phoneNumber,
      clientName: client ? `${client.nom} ${client.prenom}` : 'Sans client',
      status: 'ACTIF',
      paymentStatus: 'A JOUR',
      simCardId: lineData.simCardId
    };
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        const updatedLines = [...account.lines, newLine];
        return {
          ...account,
          lines: updatedLines,
          linesCount: updatedLines.length
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    setSelectedAccount(updatedAccounts.find(a => a.id === selectedAccount.id));
    setIsNewLineDialogOpen(false);
    showSnackbar('Ligne ajoutée avec succès', 'success');
  };

  // Gérer l'activation d'une ligne
  const handleActivateLine = (line) => {
    if (!selectedAccount) return;
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        const updatedLines = account.lines.map(l => 
          l.id === line.id ? { ...l, status: 'ACTIF' } : l
        );
        return {
          ...account,
          lines: updatedLines
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    setSelectedAccount(updatedAccounts.find(a => a.id === selectedAccount.id));
    showSnackbar(`Ligne ${line.phoneNumber} activée`, 'success');
  };

  // Gérer le blocage d'une ligne
  const handleBlockLine = (line) => {
    if (!selectedAccount) return;
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        const updatedLines = account.lines.map(l => 
          l.id === line.id ? { ...l, status: 'BLOQUÉ' } : l
        );
        return {
          ...account,
          lines: updatedLines
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    setSelectedAccount(updatedAccounts.find(a => a.id === selectedAccount.id));
    showSnackbar(`Ligne ${line.phoneNumber} bloquée`, 'warning');
  };

  // Gérer la mise en pause d'une ligne
  const handlePauseLine = (line) => {
    if (!selectedAccount) return;
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        const updatedLines = account.lines.map(l => 
          l.id === line.id ? { ...l, status: 'PAUSE' } : l
        );
        return {
          ...account,
          lines: updatedLines
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    setSelectedAccount(updatedAccounts.find(a => a.id === selectedAccount.id));
    showSnackbar(`Ligne ${line.phoneNumber} mise en pause`, 'info');
  };

  // Gérer la suppression d'une ligne
  const handleDeleteLine = (line) => {
    if (!selectedAccount) return;
    
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer la ligne ${line.phoneNumber}?`);
    if (confirmDelete) {
      const updatedAccounts = accounts.map(account => {
        if (account.id === selectedAccount.id) {
          const updatedLines = account.lines.filter(l => l.id !== line.id);
          return {
            ...account,
            lines: updatedLines,
            linesCount: updatedLines.length
          };
        }
        return account;
      });
      
      setAccounts(updatedAccounts);
      setSelectedAccount(updatedAccounts.find(a => a.id === selectedAccount.id));
      showSnackbar(`Ligne ${line.phoneNumber} supprimée`, 'error');
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
              {filteredAccounts.length} compte(s) • {accounts.reduce((acc, curr) => acc + curr.linesCount, 0)} ligne(s)
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
        {/* Panneau de gauche (recherche et liste) - avec largeur encore plus augmentée */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: '700px',  // Augmenté de 650px à 700px
          maxWidth: '900px'   // Augmenté de 800px à 900px
        }}>
          {/* Bloc de recherche avec animation */}
          <Fade in={isFilterVisible || !selectedAccount}>
            <div>
              <AccountSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredAccounts.length}
                selectedAgency={selectedAgency}
                onAgencyChange={setSelectedAgency}
                agencies={mockAgencies}
              />
            </div>
          </Fade>
          
          {/* Liste des comptes avec animation */}
          <Box sx={{ mt: isFilterVisible ? 2 : 0, flex: 1, transition: 'all 0.3s ease-in-out' }}>
            <AccountList 
              accounts={filteredAccounts}
              selectedAccount={selectedAccount}
              onAccountSelect={setSelectedAccount}
            />
          </Box>
        </Box>

        {/* Panneau de droite (détails) */}
        <Box sx={{ flex: 2, display: 'flex', minWidth: '400px' }}>
          {selectedAccount ? (
            <Fade in={!!selectedAccount}>
              <div style={{ width: '100%' }}>
                <AccountDetails 
                  account={selectedAccount}
                  onAddLine={() => setIsNewLineDialogOpen(true)}
                  onActivateLine={handleActivateLine}
                  onBlockLine={handleBlockLine}
                  onPauseLine={handlePauseLine}
                  onDeleteLine={handleDeleteLine}
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
                  Aucun compte sélectionné
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Veuillez sélectionner un compte dans la liste pour voir ses détails
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
        agencies={mockAgencies}
      />

      <NewLineDialog 
        open={isNewLineDialogOpen}
        onClose={() => setIsNewLineDialogOpen(false)}
        onSubmit={handleAddLine}
        accountId={selectedAccount?.id}
        clients={mockClients}
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