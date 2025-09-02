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
import { useGetRedAccountsQuery } from '../../store/slices/redAccountsSlice';
import { 
  useGetAvailableLinesQuery,
  useReserveLineMutation,
  useCancelReservationMutation,
  useActivateWithSimMutation,
  useGetPendingLineRequestsQuery,
  useReserveExistingLineRequestMutation
} from '../../store/slices/lineReservationsSlice';
import NewAccountDialog from '../AccountManagement/NewAccountDialog';

const RedAccountManagement = ({ client }) => {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedLineType, setSelectedLineType] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newLineNumber, setNewLineNumber] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  // États pour les modales de confirmation
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: '' });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  
  // Vérifier si l'utilisateur connecté est un superviseur
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Invalid user data in localStorage:', error);
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  
  // Déterminer l'agence à utiliser (superviseur gère toutes les agences)
  const getTargetAgencyId = () => {
    // Si on a un client avec une agence spécifique, on utilise celle du client
    if (client?.agencyId) {
      return client.agencyId;
    }
    
    // Fallback: utiliser client.agency.id si disponible
    if (client?.agency?.id) {
      return client.agency.id;
    }
    
    // Sinon, on utilise l'agence du superviseur (lui-même est une agence)
    return currentUser?.agencyId || 1;
  };
  
  const targetAgencyId = getTargetAgencyId();

  // Récupérer les données réelles depuis l'API (toujours appeler les hooks)
  const { data: redAccountsData, isLoading, error, refetch: refetchRedAccounts } = useGetRedAccountsQuery();
  const allRedAccounts = redAccountsData?.redAccounts || [];

  // Récupérer les lignes disponibles pour réservation
  const { data: availableLinesData, isLoading: linesLoading } = useGetAvailableLinesQuery();
  const allAvailableLines = availableLinesData?.data || [];

  // Filtrer les comptes RED par l'agence du client sélectionné
  const redAccounts = allRedAccounts.filter(account => account.agencyId === targetAgencyId);

  // Filtrer les lignes disponibles : SEULEMENT celles liées aux comptes RED de cette agence
  const redAccountIds = redAccounts.map(account => account.id);
  const filteredAvailableLines = allAvailableLines.filter(line => 
    // SEULEMENT les lignes attachées à un compte RED de cette agence
    redAccountIds.includes(line.redAccountId)
  );

  // Renommer la variable pour éviter les conflits
  const availableLines = filteredAvailableLines;

  // Debug forcé pour voir les données
  console.log('🚨 FORCE DEBUG RedAccountManagement:', {
    clientName: client?.user?.firstname + ' ' + client?.user?.lastname,
    clientAgencyId: client?.agencyId,
    targetAgencyId,
    allAvailableLinesCount: allAvailableLines.length,
    filteredCount: filteredAvailableLines.length,
    finalCount: availableLines.length,
    redAccountsCount: redAccounts.length
  });
  
  // Forcer un re-render si les données ont changé
  const [debugCounter, setDebugCounter] = React.useState(0);
  React.useEffect(() => {
    setDebugCounter(prev => prev + 1);
  }, [client?.agencyId, targetAgencyId, allAvailableLines.length]);

  // Mutations pour les réservations (toujours appeler les hooks)
  const [reserveLine, { isLoading: isReserving }] = useReserveLineMutation();
  const { data: pendingRequests, isLoading: isLoadingRequests } = useGetPendingLineRequestsQuery();
  const [reserveExistingRequest, { isLoading: isReservingExisting }] = useReserveExistingLineRequestMutation();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();
  const [activateWithSim, { isLoading: isActivating }] = useActivateWithSimMutation();
  
  // Si ce n'est pas un superviseur, bloquer l'accès (après tous les hooks)
  if (!isSupervisor) {
    return (
      <Card sx={{ width: '100%', mt: 3 }}>
        <CardContent>
          <Alert severity="error">
            <AlertTitle>Accès Restreint</AlertTitle>
            <Typography variant="body2">
              Seul le superviseur peut gérer les comptes RED et les attributions de lignes.
              <br /><br />
              En tant qu'agence, vous pouvez :
              <br />• Ajouter de nouveaux clients
              <br />• Gérer les encaissements
              <br />• Visualiser l'état des lignes de vos clients
              <br />• Vérifier les paiements
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const steps = ['Sélection du compte', 'Attribution du numéro'];


  // Fonction pour vérifier si une ligne résiliée est disponible (plus d'un an)
  const isTerminatedLineAvailable = (terminatedAt) => {
    if (!terminatedAt) return false;
    const terminationDate = new Date(terminatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return terminationDate <= oneYearAgo;
  };

  // Filtrer les comptes qui appartiennent à l'agence cible et ont des lignes disponibles
  const availableAccounts = redAccounts
    .filter(account => 
      account.agencyId === targetAgencyId &&
      (account.lines || []).some(line => 
        line.status === "unattributed" || 
        (line.status === "terminated" && isTerminatedLineAvailable(line.terminatedAt))
      )
    )
    .map(account => ({
      ...account,
      availableLines: (account.lines || []).filter(line => 
        line.status === "unattributed" || 
        (line.status === "terminated" && isTerminatedLineAvailable(line.terminatedAt))
      )
    }));

  // Analyse des comptes pour suggestion avec tri
  const analyzeAccountsForSuggestion = () => {
    const accounts = redAccounts
      .filter(account => account.agencyId === targetAgencyId)
      .map(account => {
        const terminatedLines = (account.lines || []).filter(line => 
          line.status === "terminated" && 
          isTerminatedLineAvailable(line.terminatedAt)
        );
        
        // Calculer les lignes non attribuées existantes
        const unattributedLines = (account.lines || []).filter(line => 
          line.status === "unattributed" || line.status === "UNATTRIBUTED"
        );

        // Calcul correct des places disponibles
        const occupiedSlots = (account.activeLines || 0) + (account.reservedLines || 0) + unattributedLines.length;
        const realAvailableSlots = Math.max(0, (account.maxLines || 0) - occupiedSlots);

        return {
          ...account,
          availableSlots: realAvailableSlots,
          unattributedLines: unattributedLines,
          terminatedLines: terminatedLines,
          canAcceptNewLine: occupiedSlots < (account.maxLines || 0)
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
                        {account.redAccountId} ({(account.activeLines || 0) + (account.reservedLines || 0)}/{account.maxLines})
                      </MenuItem>
                    ))
                  ) : (
                    availableAccounts
                      .filter(account => account.terminatedLines.length > 0)
                      .map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.redAccountId} ({account.terminatedLines.length} lignes)
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
                  {account.redAccountId}
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
            {/* Lignes disponibles pour réservation */}
            <Grid item xs={12}>
              {filteredAvailableLines.length > 0 ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>🚚 Lignes en cours de livraison disponibles ({filteredAvailableLines.length})</AlertTitle>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {filteredAvailableLines.length} ligne(s) commandée(s) en attente de livraison SIM. Vous pouvez réserver une ligne pour ce client. Le numéro exact sera connu lors de l'activation de la carte SIM.
                  </Typography>
                  
                  {/* Regroupement par compte RED pour clarté */}
                  {Object.entries(
                    filteredAvailableLines.reduce((acc, line) => {
                      const accountId = line.redAccount?.id || 'Inconnu';
                      if (!acc[accountId]) acc[accountId] = [];
                      acc[accountId].push(line);
                      return acc;
                    }, {})
                  ).map(([accountId, lines]) => (
                    <Box key={accountId} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        📋 Compte {accountId}: {lines.length} ligne(s) disponible(s)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ces lignes sont commandées mais les cartes SIM ne sont pas encore arrivées. Le numéro exact sera révélé lors de l'activation.
                      </Typography>
                      <Button
                        variant="contained"
                        color="warning"
                        disabled={isReserving}
                        onClick={() => {
                          // Réserver une place sur ce compte RED
                          setConfirmDialog({
                            open: true,
                            title: 'Réserver une ligne en cours de livraison',
                            message: `Réserver UNE ligne du compte ${accountId} pour ${client?.user?.firstname} ${client?.user?.lastname} ?\n\n⚠️ Le numéro exact sera connu quand la carte SIM arrivera et sera activée.`,
                            onConfirm: async () => {
                              try {
                                console.log('🚨 DEBUG Frontend - Réservation directe:', {
                                  accountId,
                                  redAccountId: parseInt(accountId),
                                  clientId: client.user.id,
                                  clientName: `${client.user.firstname} ${client.user.lastname}`,
                                });

                                // NOUVELLE LOGIQUE : Créer directement une demande de ligne
                                // qui sera automatiquement transformée en réservation
                                const lineRequestData = {
                                  clientId: client.user.id,
                                  redAccountId: parseInt(accountId),
                                  phoneType: 'POSTPAID', // Toujours POSTPAID pour les comptes RED
                                  notes: `Réservation place sur compte RED pour ${client.user.firstname} ${client.user.lastname} - Numéro sera révélé à l'activation`
                                };

                                let result;
                                // Si le client a déjà une LineRequest (vient de "À COMMANDER"), réserver une ligne pour cette demande
                                if (client.lineRequestId) {
                                  console.log('📤 Réservation ligne pour LineRequest existante:', client.lineRequestId);
                                  result = await reserveExistingRequest({ lineRequestId: client.lineRequestId }).unwrap();
                                  console.log('✅ Réservation effectuée:', result);
                                } else {
                                  console.log('📤 Création nouvelle demande de ligne:', lineRequestData);
                                  // Créer la demande de ligne (ancien workflow)
                                  result = await reserveLine(lineRequestData).unwrap();
                                  console.log('✅ Demande créée:', result);
                                }
                                
                                console.log('✅ Résultat final:', result);
                                setSuccessDialog({
                                  open: true,
                                  message: `Ligne réservée avec succès pour ${client.user.firstname} ${client.user.lastname} !\n\nQuand la carte SIM arrivera, vous pourrez l'activer depuis l'onglet "Activation" et le numéro sera révélé.`
                                });
                              } catch (error) {
                                console.error('Erreur réservation:', error);
                                setErrorDialog({
                                  open: true,
                                  message: 'Erreur lors de la réservation: ' + (error.data?.message || error.message)
                                });
                              }
                              setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                            }
                          });
                        }}
                        sx={{ mr: 1 }}
                      >
                        Réserver 1 ligne de ce compte
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        💡 Date de livraison estimée: {lines[0].estimatedDeliveryDate ? new Date(lines[0].estimatedDeliveryDate).toLocaleDateString() : 'En cours'}
                      </Typography>
                    </Box>
                  ))}
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>ℹ️ Aucune ligne en cours de livraison</AlertTitle>
                  <Typography variant="body2">
                    Aucune ligne n'est actuellement en cours de livraison dans cette agence. Vous devez commander de nouvelles lignes ou utiliser des lignes existantes ci-dessous.
                  </Typography>
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Alert severity={hasAvailableSlots ? "success" : "warning"}>
                <AlertTitle>Comptes avec places disponibles</AlertTitle>
                {hasAvailableSlots ? (
                  <Typography variant="body2">
                    {availableAccounts.length} compte(s) peuvent accueillir de nouvelles lignes
                    ({availableAccounts.reduce((sum, acc) => sum + acc.availableSlots, 0)} places au total)
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body2">
                      Aucune place disponible dans les comptes existants.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setShowCreateAccountModal(true)}
                      startIcon={<AddIcon />}
                    >
                      Créer un compte rattaché
                    </Button>
                  </Box>
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
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowCreateAccountModal(true)}
              startIcon={<AddIcon />}
            >
              Créer un compte
            </Button>
          }
        >
          <AlertTitle>Aucun compte disponible</AlertTitle>
          Aucun compte de l'agence {targetAgencyId} n'a de disponibilité. 
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
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body1" fontWeight="medium">
                {account.redAccountId}
              </Typography>
              <Chip 
                size="small"
                label={`${(account.activeLines || 0) + (account.reservedLines || 0)}/${account.maxLines}`}
                color="default"
                variant="outlined"
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              📊 {account.activeLines || 0} active(s)
              {(account.unattributedLines || []).length > 0 && ` • ${account.unattributedLines.length} non attribuée(s)`} 
              {(account.reservedLines || 0) > 0 && ` • ${account.reservedLines} réservée(s)`}
              {account.terminatedLines.length > 0 && ` • ${account.terminatedLines.length} réutilisable(s)`}
            </Typography>
            
            {/* Lignes disponibles pour ce compte */}
            {(() => {
              const accountAvailableLines = filteredAvailableLines.filter(line => 
                line.redAccount?.id === account.id && 
                line.deliveryStatus === 'PENDING_DELIVERY' &&
                line.reservationStatus === 'AVAILABLE'
              );
              return accountAvailableLines.length > 0 ? (
                <Typography variant="caption" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: 'warning.main',
                  fontWeight: 'medium'
                }}>
                  🚚 {accountAvailableLines.length} ligne(s) disponible(s) pour réservation
                </Typography>
              ) : null;
            })()}
            
            {/* Date dernière activité */}
            {account.lastActivity && (
              <Typography variant="caption" color="text.secondary">
                💡 Dernière activité: {new Date(account.lastActivity).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
            {account.availableSlots > 0 && (
              <Chip 
                size="small"
                label={`${account.availableSlots} place(s) libre(s)`}
                color="success"
                clickable
                onClick={() => {
                  setConfirmDialog({
                    open: true,
                    title: 'Confirmer l\'attribution',
                    message: `Attribuer une nouvelle ligne dans le compte ${account.redAccountId} à ${client?.user?.firstname} ${client?.user?.lastname} ?`,
                    onConfirm: () => {
                      console.log('Attribution nouvelle ligne:', { account, client });
                      setSuccessDialog({
                        open: true,
                        message: 'Nouvelle ligne attribuée avec succès !'
                      });
                      setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                    }
                  });
                }}
              />
            )}
            
            {(account.unattributedLines || []).length > 0 && (
              <Chip
                size="small"
                label={`${account.unattributedLines.length} non attribuée(s)`}
                color="primary"
                clickable
                onClick={() => {
                  const line = account.unattributedLines[0];
                  setConfirmDialog({
                    open: true,
                    title: 'Confirmer l\'attribution',
                    message: `Attribuer la ligne non attribuée (${line.phoneNumber || 'numéro en cours'}) à ${client?.user?.firstname} ${client?.user?.lastname} ?`,
                    onConfirm: () => {
                      console.log('Attribution ligne existante:', { line, client });
                      setSuccessDialog({
                        open: true,
                        message: 'Ligne existante attribuée avec succès !'
                      });
                      setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                    }
                  });
                }}
              />
            )}
            
            {account.terminatedLines.length > 0 && (
              <Chip
                size="small"
                label={`${account.terminatedLines.length} réutilisable(s)`}
                color="info"
                clickable
                onClick={() => {
                  const line = account.terminatedLines[0];
                  setConfirmDialog({
                    open: true,
                    title: 'Confirmer la réutilisation',
                    message: `Réutiliser la ligne ${line.number} (ex-client: ${line.clientData?.prenom || 'Inconnu'}) pour ${client?.user?.firstname} ${client?.user?.lastname} ?`,
                    onConfirm: () => {
                      console.log('Réutilisation ligne:', { line, client });
                      setSuccessDialog({
                        open: true,
                        message: 'Ligne réutilisée avec succès !'
                      });
                      setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                    }
                  });
                }}
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

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <Card sx={{ width: '100%', mt: 3 }}>
        <CardContent>
          <Typography>Chargement des comptes associés...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ width: '100%', mt: 3 }}>
        <CardContent>
          <Alert severity="error">
            <Typography>Erreur lors du chargement des comptes associés</Typography>
            <Typography variant="caption">{error.message || 'Erreur inconnue'}</Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SimCardIcon color="primary" />
          Attribution de ligne - {client?.agency?.name || 'Agence Superviseur'} (ID: {targetAgencyId})
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
      
      {/* Modales de confirmation et notifications */}
      {/* Modale de confirmation */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmDialog.onConfirm}
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale de succès */}
      <Dialog
        open={successDialog.open}
        onClose={() => setSuccessDialog({ open: false, message: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon color="success" />
          Succès
        </DialogTitle>
        <DialogContent>
          <Typography>{successDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            onClick={() => setSuccessDialog({ open: false, message: '' })}
            color="success"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale d'erreur */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <CloseIcon color="error" />
          Erreur
        </DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            onClick={() => setErrorDialog({ open: false, message: '' })}
            color="error"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de création de compte RED */}
      <NewAccountDialog
        open={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSubmit={() => {
          setShowCreateAccountModal(false);
          // Refetch les données pour mettre à jour la liste
          refetchRedAccounts();
        }}
        preselectedAgency={client?.agency}
      />
    </Card>
  );
};

export default RedAccountManagement;