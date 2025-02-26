import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Composants
import AccountSearch from '../../components/AccountManagement/AccountSearch';
import AccountList from '../../components/AccountManagement/AccountList';
import AccountDetails from '../../components/AccountManagement/AccountDetails';
import NewAccountDialog from '../../components/AccountManagement/NewAccountDialog';
import NewLineDialog from '../../components/AccountManagement/NewLineDialog';

// Données de test
import { 
  mockAccounts, 
  mockAgencies, 
  mockClients 
} from '../../components/AccountManagement/accountConstants';

const AccountResign = () => {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [isNewLineDialogOpen, setIsNewLineDialogOpen] = useState(false);

  // Filtrer les comptes en fonction des critères de recherche
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchTerm ? true : 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.login.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgency = !selectedAgency ? true : 
      account.agencyId === selectedAgency;
    
    return matchesSearch && matchesAgency;
  });

  // Gérer la création d'un nouveau compte
  const handleCreateAccount = (accountData) => {
    const newAccount = {
      id: accounts.length + 1,
      name: accountData.name,
      login: accountData.login,
      email: accountData.email,
      agency: mockAgencies.find(a => a.id === parseInt(accountData.agencyId))?.name || '',
      agencyId: parseInt(accountData.agencyId),
      status: 'ACTIF',
      cardLastFour: accountData.cardLastFour,
      cardExpiry: accountData.cardExpiry,
      linesCount: 0,
      lines: []
    };
    
    setAccounts([...accounts, newAccount]);
    setIsNewAccountDialogOpen(false);
  };

  // Gérer l'ajout d'une nouvelle ligne
  const handleAddLine = (lineData) => {
    if (!selectedAccount) return;
    
    const client = mockClients.find(c => c.id === parseInt(lineData.clientId));
    if (!client) return;
    
    const newLine = {
      id: Date.now(),
      phoneNumber: lineData.phoneNumber,
      clientName: `${client.nom} ${client.prenom}`,
      status: 'ACTIF',
      paymentStatus: 'A JOUR'
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
  };

  // Gérer la suppression d'une ligne
  const handleDeleteLine = (line) => {
    if (!selectedAccount) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la ligne ${line.phoneNumber}?`)) {
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
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header avec bouton d'ajout */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Gestion des Comptes Rattachés
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsNewAccountDialogOpen(true)}
        >
          Nouveau Compte
        </Button>
      </Paper>

      {/* Conteneur principal */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Liste des comptes */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AccountSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={filteredAccounts.length}
            selectedAgency={selectedAgency}
            onAgencyChange={setSelectedAgency}
            agencies={mockAgencies}
          />
          <AccountList 
            accounts={filteredAccounts}
            selectedAccount={selectedAccount}
            onAccountSelect={setSelectedAccount}
          />
        </Box>

        {/* Détails du compte sélectionné */}
        {selectedAccount && (
          <AccountDetails 
            account={selectedAccount}
            onAddLine={() => setIsNewLineDialogOpen(true)}
            onActivateLine={handleActivateLine}
            onBlockLine={handleBlockLine}
            onPauseLine={handlePauseLine}
            onDeleteLine={handleDeleteLine}
          />
        )}
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
    </Box>
  );
};

export default AccountResign;