import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Alert,
  AlertTitle,
  Button,
  Stack,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  SimCard as SimCardIcon,
  Add as AddIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  PhoneEnabled as PhoneIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const RedAccountManagement = ({ client }) => {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedLineType, setSelectedLineType] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newLineNumber, setNewLineNumber] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Sélection du compte', 'Attribution du numéro'];

  // Mock data
  const mockRedAccounts = [
    {
      id: "RED_123456",
      password: "SecurePass123",
      agencyId: "COMBANI_01",
      activeLines: 5,
      maxLines: 5,
      lines: [
        { 
          number: "0612345678", 
          status: "attributed",
          clientData: {
            id: '123',
            prenom: 'Jean',
            nom: 'Dupont'
          },
          attributedAt: "2024-01-15"
        },
        { 
          number: "0645678901", 
          status: "unattributed", 
          simCard: "893315031952478",
          lastStatus: "new"
        },
        { 
          number: "0656789012", 
          status: "terminated",
          simCard: "8933150319yyyy",
          terminatedAt: "2025-01-15",
          clientData: {
            id: '126',
            prenom: 'Sophie',
            nom: 'Bernard'
          }
        }
      ]
    },
    {
      id: "RED_789012",
      password: "Pass789012",
      agencyId: "COMBANI_01",
      activeLines: 5,
      maxLines: 5,
      lines: [
        { 
          number: "0689012345", 
          status: "unattributed",
          simCard: "8933150319zzzz"
        }
      ]
    }
  ];

  // Fonction pour vérifier si une ligne résiliée est disponible (plus d'un an)
  const isTerminatedLineAvailable = (terminatedAt) => {
    if (!terminatedAt) return false;
    const terminationDate = new Date(terminatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return terminationDate <= oneYearAgo;
  };

  // Filtrer les comptes qui appartiennent à l'agence et ont des lignes disponibles
  const availableAccounts = mockRedAccounts
    .filter(account => 
      account.agencyId === (client?.agency?.id || '') &&
      account.lines.some(line => 
        line.status === "unattributed" || 
        (line.status === "terminated" && isTerminatedLineAvailable(line.terminatedAt))
      )
    )
    .map(account => ({
      ...account,
      availableLines: account.lines.filter(line => 
        line.status === "unattributed" || 
        (line.status === "terminated" && isTerminatedLineAvailable(line.terminatedAt))
      )
    }));

  // Analyse des comptes pour suggestion avec tri
  const analyzeAccountsForSuggestion = () => {
    const accounts = mockRedAccounts
      .filter(account => account.agencyId === (client?.agency?.id || ''))
      .map(account => {
        const terminatedLines = account.lines.filter(line => 
          line.status === "terminated" && 
          isTerminatedLineAvailable(line.terminatedAt)
        );
        
        return {
          ...account,
          availableSlots: account.maxLines - account.activeLines,
          terminatedLines: terminatedLines,
          canAcceptNewLine: account.activeLines < account.maxLines
        };
      });

    return {
      availableAccounts: accounts.filter(acc => acc.availableSlots > 0)
        .sort((a, b) => b.availableSlots - a.availableSlots),
      fullAccounts: accounts.filter(acc => acc.availableSlots === 0),
      terminatedLines: accounts.flatMap(acc => acc.terminatedLines)
    };
  };

  const handleAssignLine = () => {
    if (!selectedNumber) return;
    console.log("Attribution de la ligne:", {
      number: selectedNumber,
      clientId: client.id,
      simCard: client.simCCID
    });
  };

  const handleCreateNewLine = () => {
    if (!selectedAccount) return;
    setActiveStep(1);
    setShowAssignmentDialog(true);
    
    console.log("Création d'une nouvelle ligne:", {
      accountId: selectedAccount,
      type: selectedLineType,
      clientId: client.id
    });
  };

  const handleAssignNewLine = () => {
    if (selectedLineType === 'reuse') {
      console.log("Attribution de ligne résiliée avec commande de carte SIM:", {
        accountId: selectedAccount,
        number: selectedNumber,
        clientId: client.id,
        type: 'reuse',
        status: 'waiting_for_sim',
        message: 'En attente de réception de la carte SIM'
      });
    } else {
      if (!newLineNumber) return;
      console.log("Attribution d'une nouvelle ligne:", {
        accountId: selectedAccount,
        number: newLineNumber,
        clientId: client.id,
        type: 'new'
      });
    }

    // Réinitialiser les états
    setShowAssignmentDialog(false);
    setShowCreateForm(false);
    setSelectedAccount('');
    setSelectedLineType('');
    setNewLineNumber('');
    setActiveStep(0);
  };

  const togglePassword = (accountId) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getLineStatusChip = (line) => {
    if (line.status === "unattributed") {
      return (
        <Chip 
          size="small" 
          label="Nouvelle" 
          color="success" 
          variant="outlined"
        />
      );
    }
    return (
      <Chip 
        size="small" 
        label="Réutilisable" 
        color="warning" 
        variant="outlined"
      />
    );
  };

  const renderAssignmentDialog = () => {
    const { availableAccounts } = analyzeAccountsForSuggestion();
    const selectedAccountData = availableAccounts.find(acc => acc.id === selectedAccount);
    const isReuse = selectedLineType === 'reuse';

    return (
      <Dialog 
        open={showAssignmentDialog} 
        onClose={() => setShowAssignmentDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isReuse ? 'Réutilisation de ligne ' : 'Attribution du numéro de ligne'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Informations du compte</AlertTitle>
                <Typography variant="body2">
                  Compte : {selectedAccount}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="body2">
                    Code du compte :
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {showPasswords[selectedAccount] ? selectedAccountData?.password : '••••••••••'}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => togglePassword(selectedAccount)}
                  >
                    {showPasswords[selectedAccount] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Box>
              </Alert>

              {isReuse ? (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>Commande de carte SIM nécessaire</AlertTitle>
                    <Typography variant="body2">
                      Pour réutiliser la ligne {selectedNumber}, une nouvelle carte SIM doit être commandée pour le client.
                    </Typography>
                  </Alert>

            
                </>
              ) : (
                <TextField
                  fullWidth
                  label="Numéro de ligne"
                  value={newLineNumber}
                  onChange={(e) => setNewLineNumber(e.target.value)}
                  placeholder="Ex: 0612345678"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowAssignmentDialog(false);
              setActiveStep(0);
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained"
            disabled={!isReuse && !newLineNumber}
            onClick={handleAssignNewLine}
            startIcon={<CheckIcon />}
            color={isReuse ? "success" : "primary"}
          >
            {isReuse ? "Confirmer la commande de carte SIM" : "Valider le numéro"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderCreationForm = () => {
    const { availableAccounts, terminatedLines } = analyzeAccountsForSuggestion();
    const hasTerminatedLines = terminatedLines.length > 0;
    const selectedAccountData = availableAccounts.find(acc => acc.id === selectedAccount);

    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Créer une nouvelle ligne
          </Typography>
          <IconButton size="small" onClick={() => setShowCreateForm(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type de ligne</InputLabel>
              <Select
                value={selectedLineType}
                onChange={(e) => {
                  setSelectedLineType(e.target.value);
                  setSelectedNumber('');
                  setSelectedAccount('');
                }}
                label="Type de ligne"
              >
                <MenuItem value="new">Nouvelle ligne</MenuItem>
                {hasTerminatedLines && (
                  <MenuItem value="reuse">Réutiliser une ligne</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {selectedLineType && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Compte</InputLabel>
                <Select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  label="Compte"
                >
                  {selectedLineType === 'new' ? (
                    availableAccounts.map(account => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.id} ({account.activeLines}/{account.maxLines})
                      </MenuItem>
                    ))
                  ) : (
                    availableAccounts
                      .filter(account => account.terminatedLines.length > 0)
                      .map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.id} ({account.terminatedLines.length} lignes)
                        </MenuItem>
                      ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}


          {selectedLineType === 'reuse' && selectedAccount && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ligne à réutiliser</InputLabel>
                <Select
                  value={selectedNumber}
                  onChange={(e) => setSelectedNumber(e.target.value)}
                  label="Ligne à réutiliser"
                >
                  {availableAccounts
                    .find(acc => acc.id === selectedAccount)
                    ?.terminatedLines.map(line => (
                      <MenuItem key={line.number} value={line.number}>
                        {line.number} - Ancien client: {line.clientData.prenom} {line.clientData.nom}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!selectedAccount || (selectedLineType === 'reuse' && !selectedNumber)}
          onClick={handleCreateNewLine}
          startIcon={<CheckIcon />}
        >
          {selectedLineType === 'reuse' 
            ? 'Continuer avec cette ligne'
            : 'Continuer'
          }
        </Button>
      </Paper>
    );
  };

  const renderAccountsWithSimCard = () => (
    <Box>
      {availableAccounts.length === 0 ? (
        <Alert 
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<AddIcon />}
            >
              Commander
            </Button>
          }
        >
          <AlertTitle>Aucun compte disponible</AlertTitle>
          Aucun compte de l'agence n'a de ligne disponible. Une nouvelle ligne doit être commandée.
        </Alert>
      ) : (
        <>
          {availableAccounts.map((account) => (
            <Box 
              key={account.id}
              sx={{ 
                mb: 3,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {account.id}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontFamily="monospace">
                    {showPasswords[account.id] ? account.password : '••••••••••'}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => togglePassword(account.id)}
                  >
                    {showPasswords[account.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Lignes disponibles :
              </Typography>
              <Stack spacing={1}>
                {account.availableLines.map((line) => (
                  <Box
                    key={line.number}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: selectedNumber === line.number ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => setSelectedNumber(line.number)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography>{line.number}</Typography>
                      </Box>
                      {getLineStatusChip(line)}
                    </Box>
                    {line.status === "terminated" && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Anciennement : {line.clientData.prenom} {line.clientData.nom}
                        <br />
                        Résiliée le : {new Date(line.terminatedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}

          <Button
            variant="contained"
            fullWidth
            disabled={!selectedNumber}
            onClick={handleAssignLine}
          >
            Attribuer la ligne {selectedNumber}
          </Button>
        </>
      )}
    </Box>
  );

  const renderSuggestionContent = () => {
    const { availableAccounts, fullAccounts, terminatedLines } = analyzeAccountsForSuggestion();
    const hasAvailableSlots = availableAccounts.length > 0;
    const hasTerminatedLines = terminatedLines.length > 0;

    return (
      <Stack spacing={3}>
        {/* Résumé des disponibilités */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              État des comptes ({availableAccounts.length + fullAccounts.length})
            </Typography>
            {!showCreateForm && (hasAvailableSlots || hasTerminatedLines) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
              >
                Créer une ligne
              </Button>
            )}
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Alert severity={hasAvailableSlots ? "success" : "warning"}>
                <AlertTitle>Comptes avec places disponibles</AlertTitle>
                {hasAvailableSlots ? (
                  <Typography variant="body2">
                    {availableAccounts.length} compte(s) peuvent accueillir de nouvelles lignes
                    ({availableAccounts.reduce((sum, acc) => sum + acc.availableSlots, 0)} places au total)
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    Aucune place disponible. Créez un nouveau compte.
                  </Typography>
                )}
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Alert severity={hasTerminatedLines ? "info" : "warning"}>
                <AlertTitle>Lignes réutilisables</AlertTitle>
                <Typography variant="body2">
                  {hasTerminatedLines 
                    ? `${terminatedLines.length} ligne(s) résiliée(s) disponible(s)`
                    : 'Aucune ligne résiliée disponible'
                  }
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          {showCreateForm && renderCreationForm()}

          {/* Liste détaillée des comptes */}
        {/* Liste détaillée des comptes */}
<Box sx={{ mt: 2, maxHeight: '400px', overflow: 'auto' }}>
  <Typography variant="subtitle2" gutterBottom color="text.secondary">
    Liste des comptes avec disponibilités :
  </Typography>
  
  {(() => {
    const accountsWithAvailability = availableAccounts
      .filter(account => account.availableSlots > 0 || account.terminatedLines.length > 0);

    if (accountsWithAvailability.length === 0) {
      return (
        <Alert 
          severity="warning"
        >
          <AlertTitle>Aucun compte disponible</AlertTitle>
          Aucun compte de l'agence {client?.agency?.id} n'a de disponibilité. 
          Veuillez créer un nouveau compte associé à l'agence pour pouvoir ajouter des lignes.
        </Alert>
      );
    }

    return accountsWithAvailability
      .sort((a, b) => b.availableSlots - a.availableSlots)
      .map(account => (
        <Box
          key={account.id}
          sx={{
            p: 1.5,
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Box>
            <Typography variant="body2">
              {account.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {account.activeLines}/{account.maxLines} lignes
              {account.terminatedLines.length > 0 && 
                ` • ${account.terminatedLines.length} ligne(s) réutilisable(s)`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {account.availableSlots > 0 && (
              <Chip 
                size="small"
                label={`${account.availableSlots} place(s)`}
                color="success"
              />
            )}
            {account.terminatedLines.length > 0 && (
              <Chip
                size="small"
                label={`${account.terminatedLines.length} réutilisable(s)`}
                color="info"
              />
            )}
          </Box>
        </Box>
      ));
  })()}
</Box>
        </Paper>
      </Stack>
    );
  };

  return (
    <Card sx={{ width: '100%', mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SimCardIcon color="primary" />
          Attribution de ligne Agence combani
        </Typography>

        {client.simCCID ? (
          <Box>
            <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
              <AlertTitle>Carte SIM fournie - ICCID: {client.simCCID}</AlertTitle>
              Cette carte SIM correspond à une des lignes disponibles ci-dessous.
              Testez la carte pour identifier la ligne correspondante.
            </Alert>
            {renderAccountsWithSimCard()}
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            {renderSuggestionContent()}
            {renderAssignmentDialog()}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RedAccountManagement;