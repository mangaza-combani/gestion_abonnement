import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Paper,
  Autocomplete
} from '@mui/material';
import {
  Info as InfoIcon,
  PhoneAndroid as PhoneIcon,
  CheckCircle as CheckIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useGetAgenciesQuery } from '../../store/slices/agencySlice';
import { useAnalyzeIccidForSupervisorQuery, useGetAvailableSimCardsQuery, useGetValidNumbersForAgencyQuery, useActivateWithSimMutation, lineReservationsApiSlice } from '../../store/slices/lineReservationsSlice';
import { useConfirmReactivationMutation } from '../../store/slices/linesSlice';
import { redAccountsApiSlice } from '../../store/slices/redAccountsSlice';

const ActivationInfo = ({ client }) => {
  const dispatch = useDispatch();
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedSimCard, setSelectedSimCard] = useState(null);
  const [iccid, setIccid] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedManualNumber, setSelectedManualNumber] = useState(null);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);
  
  // Détecter si l'ICCID est déjà renseigné par l'agence (CAS 1)
  const preFilledIccid = client?.preAssignedIccid || client?.activatedWithIccid || client?.user?.activatedWithIccid;
  const isPreFilledMode = client?.isPreAssigned || !!preFilledIccid;
  
  const { data: agenciesData } = useGetAgenciesQuery();
  
  // Récupérer les cartes SIM disponibles
  const { data: simCardsData, isLoading: isLoadingSims } = useGetAvailableSimCardsQuery();
  
  // Mutations pour activer la ligne
  const [activateWithSim, { isLoading: isActivating }] = useActivateWithSimMutation();
  const [confirmReactivation, { isLoading: isConfirming }] = useConfirmReactivationMutation();
  
  // Récupérer l'ID de l'agence du client
  const getClientAgencyId = () => {
    return client?.user?.agencyId || 
           client?.client?.agencyId || 
           client?.agencyId;
  };
  
  const clientAgencyId = getClientAgencyId();
  
  // Récupérer tous les numéros valides de l'agence pour autocomplete
  const { data: validNumbersData, isLoading: isLoadingNumbers } = useGetValidNumbersForAgencyQuery(
    clientAgencyId,
    { skip: !clientAgencyId }
  );
  
  // Analyse ICCID - utilise l'ICCID pré-rempli ou saisi manuellement
  const iccidToAnalyze = isPreFilledMode ? preFilledIccid : iccid;
  const shouldAnalyze = isPreFilledMode || (analysisTriggered && iccid && iccid.trim().length >= 8);
  
  const { data: iccidAnalysis, isLoading: isAnalyzing, error: analysisError } = useAnalyzeIccidForSupervisorQuery(
    iccidToAnalyze, 
    { 
      skip: !shouldAnalyze || !iccidToAnalyze || iccidToAnalyze.trim() === ''
    }
  );
  
  // Filtrer les cartes SIM par l'agence du client
  const getFilteredSimCards = () => {
    if (!client || !simCardsData?.data?.simCards) return [];
    
    const clientAgencyId = getClientAgencyId();
    if (!clientAgencyId) return simCardsData.data.simCards.filter(sim => !sim.isAlreadyInUse);
    
    return simCardsData.data.simCards.filter(sim => 
      sim.agencyId === clientAgencyId && !sim.isAlreadyInUse
    );
  };

  const filteredSimCards = getFilteredSimCards();

  // Auto-sélectionner la carte SIM si ICCID pré-rempli (CAS 1)
  useEffect(() => {
    if (isPreFilledMode && preFilledIccid && filteredSimCards.length > 0) {
      // Chercher la carte SIM correspondant à l'ICCID pré-rempli
      const matchingSimCard = filteredSimCards.find(sim => sim.iccid === preFilledIccid);
      if (matchingSimCard && !selectedSimCard) {
        console.log('🎯 Auto-sélection carte SIM pour CAS 1:', matchingSimCard.iccid);
        setSelectedSimCard(matchingSimCard);
        setIccid(preFilledIccid);
        setAnalysisTriggered(true);
      }
    }
  }, [isPreFilledMode, preFilledIccid, filteredSimCards, selectedSimCard]);

  const handleIccidChange = (e) => {
    const newIccid = e.target.value;
    setIccid(newIccid);
    setSelectedLine('');
    
    // Auto-déclencher l'analyse si ICCID est complet (au moins 8 caractères)
    if (newIccid && newIccid.length >= 8) {
      setAnalysisTriggered(true);
      console.log('🔍 Frontend - Déclenchement analyse ICCID:', newIccid);
    } else {
      setAnalysisTriggered(false);
    }
  };

  const handleSimpleConfirmation = async () => {
    try {
      await confirmReactivation({ phoneId: client.id }).unwrap();
      console.log('✅ Réactivation confirmée avec succès');
      setShowConfirmationDialog(false);
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de réactivation:', error);
    }
  };

  const handleActivationConfirm = async () => {
    // Cette fonction ne gère que les nouvelles activations (logique existante préservée)
    const finalIccid = isPreFilledMode ? preFilledIccid : iccid;
    
    if (!selectedManualNumber && (!finalIccid || !selectedLine)) return;
    
    try {
      // Détermine le phoneId à partir de la sélection
      let phoneIdToActivate;
      
      if (selectedManualNumber) {
        // Si sélection manuelle, utilise l'ID du numéro sélectionné
        phoneIdToActivate = selectedManualNumber.id;
      } else if (selectedLine) {
        // Si sélection par analyse ICCID, utilise la ligne sélectionnée
        phoneIdToActivate = selectedLine;
      }
      
      if (!phoneIdToActivate || !finalIccid) {
        console.error('Impossible d\'identifier le phoneId ou l\'ICCID pour l\'activation');
        return;
      }
      
      // Récupérer l'ID du client
      const clientId = client?.user?.id || client?.id;
      
      // Appel de l'API d'activation
      await activateWithSim({
        phoneId: phoneIdToActivate,
        iccid: finalIccid,
        clientId: clientId
      }).unwrap();
      
      console.log('Activation réussie pour:', {
        phoneId: phoneIdToActivate,
        iccid: finalIccid,
        client: client?.user?.firstname + ' ' + client?.user?.lastname
      });

      // Invalider tous les caches pertinents pour mise à jour immédiate
      dispatch(lineReservationsApiSlice.util.invalidateTags([
        { type: 'LineReservation', id: 'RESERVED' },
        { type: 'LineReservation', id: 'AVAILABLE' },
        { type: 'Phone', id: phoneIdToActivate },
        { type: 'Phone', id: 'LIST' },
        { type: 'Client', id: clientId },
        { type: 'Client', id: 'LIST' },
        { type: 'SimCard', id: 'LIST' },
        'LineReservation', // Invalider toutes les réservations
        'Phone', // Invalider tous les téléphones
        'Client' // Invalider tous les clients
      ]));

      // Invalider aussi les comptes RED
      dispatch(redAccountsApiSlice.util.invalidateTags([
        { type: 'RedAccount', id: 'LIST' },
        'RedAccount' // Invalider tous les comptes RED
      ]));

      console.log('✅ Cache invalidé après activation - les données devraient se mettre à jour automatiquement');

      // Fermer le dialog après succès
      handleCloseDialog();
      
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      // TODO: Afficher une notification d'erreur à l'utilisateur
    }
  };
  
  const handleCloseDialog = () => {
    setShowActivationDialog(false);
    setSelectedSimCard(null);
    setIccid('');
    setSelectedLine('');
    setSelectedManualNumber(null);
    setAnalysisTriggered(false);
  };
  
  // S'assurer que l'ICCID est nettoyé quand le dialogue se ferme
  const resetAnalysisState = () => {
    setIccid('');
    setAnalysisTriggered(false);
    setSelectedLine('');
    setSelectedManualNumber(null);
  };
  
  if (!client) {
    return (
      <Card sx={{ minWidth: 350 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6">
              Informations d'activation
            </Typography>
          </Box>
          <Alert severity="info">
            Aucune information client disponible
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 350 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">
            Informations d'activation
          </Typography>
        </Box>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Client
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {client?.user?.firstname} {client?.user?.lastname}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {client?.user?.email}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={client?.user?.phoneStatus || client?.phoneStatus} 
              size="small" 
              color="warning"
            />
          </Box>
          
          {/* 🆕 Informations sur le type d'activation et la raison */}
          {(client?.activationType || client?.reactivationReason) && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type d'activation
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  label={
                    client?.activationType === 'NEW_ACTIVATION' ? 'Nouvelle activation' :
                    client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Réactivation (Pause)' :
                    client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Réactivation (Impayé)' :
                    client?.activationType === 'REACTIVATION' ? 'Réactivation' : 
                    'Activation'
                  }
                  size="small" 
                  color={client?.activationType === 'NEW_ACTIVATION' ? 'success' : 'info'}
                />
              </Stack>
              {client?.reactivationReason && (
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {client.reactivationReason}
                </Typography>
              )}
            </Box>
          )}
          
          {/* Compte RED rattaché */}
          {(client?.redAccountId || client?.lineRequest?.redAccountId) && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Compte RED rattaché
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                🏢 {client?.redAccountName || client?.redAccount?.accountName || client?.lineRequest?.redAccount?.accountName || 
                     `Compte ${client?.redAccountId || client?.lineRequest?.redAccountId}`}
              </Typography>
            </Box>
          )}
          
          <Button
            variant="contained"
            color={client?.activationType === 'NEW_ACTIVATION' ? "primary" : "success"}
            startIcon={client?.activationType === 'NEW_ACTIVATION' ? <PhoneIcon /> : <CheckIcon />}
            onClick={() => {
              if (client?.activationType === 'NEW_ACTIVATION') {
                setShowActivationDialog(true);
              } else {
                setShowConfirmationDialog(true);
              }
            }}
            fullWidth
          >
            {client?.activationType === 'NEW_ACTIVATION' 
              ? 'Activer la ligne (Superviseur)' 
              : 'Confirmer activation sur RED'
            }
          </Button>
        </Stack>
      </CardContent>
      
      {/* Dialog d'activation avec analyse ICCID */}
      <Dialog
        open={showActivationDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {client?.activationType === 'NEW_ACTIVATION' ? (
              <PhoneIcon color="primary" />
            ) : (
              <CheckIcon color="success" />
            )}
            {client?.activationType === 'NEW_ACTIVATION' 
              ? `Activation superviseur - ${client?.user?.firstname} ${client?.user?.lastname}`
              : `Confirmer activation RED - ${client?.user?.firstname} ${client?.user?.lastname}`
            }
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            
            {/* ✅ CAS CONFIRMATION : Réactivation après pause/impayé */}
            {client?.activationType !== 'NEW_ACTIVATION' ? (
              <Paper sx={{ p: 3, bgcolor: 'success.lighter' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ Confirmation d'activation sur RED
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cette ligne nécessite uniquement une confirmation que l'activation a été effectuée sur le compte RED.
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Ligne :</strong> {client?.phoneNumber}<br />
                    <strong>Type :</strong> {
                      client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Retour après pause temporaire' :
                      client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Retour après règlement impayé' :
                      'Réactivation'
                    }<br />
                    <strong>Raison :</strong> {client?.reactivationReason}
                  </Typography>
                </Alert>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Avez-vous activé cette ligne sur le compte RED ?</strong>
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  En confirmant, le statut de la ligne passera à "ACTIVE" dans le système.
                </Typography>
              </Paper>
            ) : (
              /* 🔧 CAS NOUVELLE ACTIVATION : Workflow complet avec ICCID */
              <Paper sx={{ p: 2, bgcolor: isPreFilledMode ? 'success.lighter' : 'grey.50' }}>
              {isPreFilledMode ? (
                <>
                  <Typography variant="subtitle2" gutterBottom color="success.main">
                    ✅ ICCID pré-renseigné par l'agence
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      📱 ICCID: {preFilledIccid}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      L'agence a déjà renseigné cet ICCID lors de la souscription. 
                      Analyse automatique en cours pour identifier le compte RED approprié.
                    </Typography>
                  </Box>
                  {isAnalyzing && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <CircularProgress size={20} color="success" />
                      <Typography variant="body2" color="success.main">
                        Analyse de l'ICCID en cours...
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    📱 Étape 1: Sélectionner une carte SIM en stock
                  </Typography>
                  
                  {isLoadingSims ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Chargement des cartes SIM...</Typography>
                    </Box>
                  ) : simCardsData?.data ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Pour cette agence (ID: {clientAgencyId}): {filteredSimCards.length} disponible(s)
                      </Typography>
                      
                      {filteredSimCards.length === 0 ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          Aucune carte SIM disponible pour cette agence. 
                          Vérifiez que l'agence a bien des cartes en stock.
                        </Alert>
                      ) : (
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={filteredSimCards}
                          getOptionLabel={(option) => option.iccid}
                          value={selectedSimCard}
                          onChange={(event, newValue) => {
                            setSelectedSimCard(newValue);
                            if (newValue && newValue.iccid && newValue.iccid.trim().length > 0) {
                              setIccid(newValue.iccid);
                              setSelectedManualNumber(null);
                              handleIccidChange({ target: { value: newValue.iccid } });
                            } else {
                              resetAnalysisState();
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Choisir une carte SIM..."
                            />
                          )}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                            <Box component="li" key={key} {...otherProps}>
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {option.iccid}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.agencyName} - {option.isAlreadyInUse ? '⚠️ Déjà utilisé' : '✅ Disponible'}
                                </Typography>
                              </Box>
                            </Box>
                            );
                          }}
                          noOptionsText="Aucune carte SIM trouvée"
                        />
                      )}
                      
                      {/* Indication analyse automatique */}
                      {selectedSimCard && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <AlertTitle>Analyse automatique déclenchée</AlertTitle>
                          L'ICCID sélectionné est analysé automatiquement pour identifier l'agence et proposer des lignes.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="error">
                      Impossible de charger les cartes SIM disponibles.
                    </Alert>
                  )}
                </>
              )}
            </Paper>
            )}
            
            {/* Étape 2: Résultats de l'analyse */}
            {iccidAnalysis && (
              <Paper sx={{ p: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  🔍 Étape 2: Analyse de l'ICCID
                </Typography>
                
                {/* Informations extraites de l'ICCID */}
                <Box sx={{ mb: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    📊 Informations extraites :
                  </Typography>
                  <Typography variant="body2">
                    • Date de commande: {iccidAnalysis.iccidAnalysis?.extractedInfo?.orderDate}
                  </Typography>
                  <Typography variant="body2">
                    • Numéro possible: {iccidAnalysis.iccidAnalysis?.possiblePhoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    • Longueur ICCID: {iccidAnalysis.iccidAnalysis?.extractedInfo?.length} caractères
                  </Typography>
                </Box>
                
                {/* Comptes RED trouvés */}
                {iccidAnalysis.potentialMatches?.map((match, index) => (
                  <Box key={`match-${match.redAccount?.id || index}`} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.lighter' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon color="success" />
                      <Typography variant="subtitle2" color="success.main">
                        🏢 Agence: {match.redAccount?.agency?.name}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`Confiance: ${match.matchConfidence?.score}%`} 
                        color={match.matchConfidence?.score > 70 ? 'success' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2">
                      • Compte RED: {match.redAccount?.accountId}
                    </Typography>
                    <Typography variant="body2">
                      • Adresse: {match.redAccount?.agency?.address}
                    </Typography>
                    <Typography variant="body2">
                      • Contact: {match.redAccount?.agency?.contactFirstName} {match.redAccount?.agency?.contactLastName}
                    </Typography>
                    
                    {/* Lignes disponibles */}
                    {match.linesAwaitingActivation && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          📞 Lignes disponibles pour activation :
                        </Typography>
                        
                        {/* Lignes réservées (priorité) */}
                        {match.linesAwaitingActivation.reserved?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="warning.main" fontWeight="bold">
                              🔒 Lignes réservées (priorité) :
                            </Typography>
                            {match.linesAwaitingActivation.reserved.map((line) => (
                              <Box key={line.id} sx={{ ml: 2, mt: 0.5 }}>
                                <Button
                                  variant={selectedLine === line.id ? 'contained' : 'outlined'}
                                  size="small"
                                  onClick={() => setSelectedLine(line.id)}
                                  sx={{ mr: 1, mb: 0.5 }}
                                >
                                  {line.temporaryNumber}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                  Commande: {line.orderDate}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                        
                        {/* Lignes disponibles */}
                        {match.linesAwaitingActivation.available?.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="success.main" fontWeight="bold">
                              ✅ Lignes disponibles :
                            </Typography>
                            {match.linesAwaitingActivation.available.map((line) => (
                              <Box key={line.id} sx={{ ml: 2, mt: 0.5 }}>
                                <Button
                                  variant={selectedLine === line.id ? 'contained' : 'outlined'}
                                  size="small"
                                  onClick={() => setSelectedLine(line.id)}
                                  sx={{ mr: 1, mb: 0.5 }}
                                >
                                  {line.currentNumber}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                  Commande: {line.orderDate}, Livraison estimée: {line.estimatedDelivery}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                        
                        {(!match.linesAwaitingActivation.reserved?.length && !match.linesAwaitingActivation.available?.length) && (
                          <Alert severity="warning" sx={{ ml: 2, mt: 1 }}>
                            <AlertTitle>Aucune ligne suggérée</AlertTitle>
                            Aucune ligne réservée ou disponible trouvée pour ce compte RED.
                            Vous pouvez saisir manuellement un numéro ci-dessous.
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
                
                {/* Saisie manuelle de numéro (nouveau) */}
                <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'grey.400', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📝 Ou saisissez manuellement un numéro :
                  </Typography>
                  {console.log('🔍 DEBUG Frontend - iccidAnalysis:', iccidAnalysis)}
                  {console.log('🔍 DEBUG Frontend - availableForManualSelection:', iccidAnalysis?.availableForManualSelection)}
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={iccidAnalysis?.availableForManualSelection || []}
                    getOptionLabel={(option) => option.phoneNumber}
                    value={selectedManualNumber}
                    onChange={(event, newValue) => {
                      setSelectedManualNumber(newValue);
                      if (newValue) {
                        setSelectedLine('');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Exemple: 0699123456"
                        helperText="Si aucune ligne suggérée ne convient, saisissez le numéro à attribuer"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {option.phoneNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.status === 'AVAILABLE' ? 'Disponible' : `Temporaire - ${option.conflictInfo?.currentClient?.name}`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText="Aucun numéro trouvé"
                  />
                  {selectedManualNumber && selectedManualNumber.status !== 'AVAILABLE' && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <AlertTitle>Conflit détecté</AlertTitle>
                      Ce numéro est attribué à {selectedManualNumber.conflictInfo?.currentClient?.name}. 
                      L'activation nécessitera une résolution de conflit.
                    </Alert>
                  )}
                </Box>
                
                {/* Instructions superviseur */}
                {iccidAnalysis.supervisorInstructions && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>📋 Instructions superviseur</AlertTitle>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {iccidAnalysis.supervisorInstructions.message}
                    </Typography>
                    {iccidAnalysis.supervisorInstructions.steps?.map((step, index) => (
                      <Typography key={`step-${index}-${step.slice(0, 10)}`} variant="body2" sx={{ ml: 1 }}>
                        {step}
                      </Typography>
                    ))}
                  </Alert>
                )}
              </Paper>
            )}
            
            {/* Récapitulatif final */}
            {(selectedManualNumber || (iccid && selectedLine && iccidAnalysis)) && (
              <Paper sx={{ p: 2, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  ✅ Étape 3: Récapitulatif de l'activation
                </Typography>
                <Typography variant="body2">
                  • Client: {client?.user?.firstname} {client?.user?.lastname} ({client?.user?.email})
                </Typography>
                {selectedManualNumber ? (
                  <>
                    <Typography variant="body2">
                      • Numéro sélectionné: <strong>{selectedManualNumber.phoneNumber}</strong> (sélection manuelle)
                    </Typography>
                    <Typography variant="body2">
                      • Statut: {selectedManualNumber.status === 'AVAILABLE' ? 'Disponible' : 'Temporaire - Conflit possible'}
                    </Typography>
                    <Typography variant="body2">
                      • Agence: {selectedManualNumber.agency}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2">
                      • ICCID: {iccid}
                    </Typography>
                    <Typography variant="body2">
                      • Ligne sélectionnée: ID {selectedLine}
                    </Typography>
                    <Typography variant="body2">
                      • Agence identifiée: {iccidAnalysis.potentialMatches?.[0]?.redAccount?.agency?.name}
                    </Typography>
                    <Typography variant="body2">
                      • Date de commande: {iccidAnalysis.iccidAnalysis?.extractedInfo?.orderDate}
                    </Typography>
                  </>
                )}
              </Paper>
            )}
            
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleActivationConfirm}
            disabled={isActivating || (client?.activationType === 'NEW_ACTIVATION' && (!selectedManualNumber && (!iccid || !selectedLine)))}
            startIcon={isActivating ? <CircularProgress size={20} /> : <CheckIcon />}
            color={client?.activationType === 'NEW_ACTIVATION' ? "primary" : "success"}
          >
            {isActivating ? 
              (client?.activationType === 'NEW_ACTIVATION' ? 'Activation en cours...' : 'Confirmation en cours...') : 
              (client?.activationType === 'NEW_ACTIVATION' ? 'Activer la ligne' : 'Confirmer activation sur RED')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Dialog simple pour confirmations de réactivation */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color="success" />
            Confirmer activation sur RED
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}<br />
                <strong>Ligne :</strong> {client?.phoneNumber}<br />
                <strong>Type :</strong> {
                  client?.activationType === 'REACTIVATION_AFTER_PAUSE' ? 'Retour après pause temporaire' :
                  client?.activationType === 'REACTIVATION_AFTER_DEBT' ? 'Retour après règlement impayé' :
                  'Réactivation'
                }<br />
                {client?.reactivationReason && (
                  <>
                    <strong>Raison :</strong> {client.reactivationReason}
                  </>
                )}
              </Typography>
            </Alert>

            <Typography variant="h6" sx={{ textAlign: 'center', color: 'success.main' }}>
              Avez-vous activé cette ligne sur le compte RED ?
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              En confirmant, le statut de la ligne passera à "ACTIVE" dans le système.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSimpleConfirmation}
            disabled={isConfirming}
            startIcon={isConfirming ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {isConfirming ? 'Confirmation...' : 'Oui, confirmer l\'activation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ActivationInfo;